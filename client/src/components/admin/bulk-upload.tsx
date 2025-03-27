import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, Loader2, Check, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "./manage-products";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface BulkUploadProps {
  onProductsUploaded: (products: Product[]) => void;
}

export const BulkUpload = ({ onProductsUploaded }: BulkUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedProducts, setUploadedProducts] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setUploadedProducts([]);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check if the file is a CSV or Excel file
    const fileType = selectedFile.type;
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(fileType) && !selectedFile.name.endsWith('.csv')) {
      setError("Please upload a valid CSV or Excel file.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    setFile(selectedFile);
  };
  
  const parseCSV = async (csvText: string) => {
    // Simple CSV parsing (comma-separated with headers in first row)
    const lines = csvText.split('\\n');
    if (lines.length < 2) {
      throw new Error("CSV file is empty or invalid");
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required headers
    const requiredHeaders = ['title', 'description', 'price', 'stock', 'brand', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    const products: Partial<Product>[] = [];
    
    // Parse each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        throw new Error(`Line ${i + 1} has ${values.length} values but should have ${headers.length}`);
      }
      
      const product: Record<string, any> = {};
      
      // Map each value to its corresponding header
      headers.forEach((header, index) => {
        switch (header) {
          case 'price':
          case 'stock':
          case 'discountpercentage':
            product[header] = parseFloat(values[index]) || 0;
            break;
          case 'images':
            product[header] = values[index] ? values[index].split(';').map(img => img.trim()) : [];
            break;
          default:
            product[header] = values[index];
            break;
        }
      });
      
      // Handle special cases and defaults
      if (!product.thumbnail && product.images && product.images.length > 0) {
        product.thumbnail = product.images[0];
      }
      
      if (!product.images) {
        product.images = product.thumbnail ? [product.thumbnail] : [];
      }
      
      if (!product.rating) {
        product.rating = 0;
      }
      
      products.push(product as Partial<Product>);
    }
    
    return products;
  };
  
  const processUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Read the file
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);
      
      // Parse the CSV data
      const parsedProducts = await parseCSV(text);
      
      // Create product objects with IDs
      // In a real implementation, we would send this to the server
      const nextId = Math.floor(Math.random() * 1000) + 100; // For demo purposes
      
      const formattedProducts: Product[] = parsedProducts.map((product, index) => ({
        id: nextId + index,
        title: product.title || `Product ${nextId + index}`,
        description: product.description || "No description provided",
        price: product.price || 0,
        discountPercentage: product.discountPercentage || null,
        rating: product.rating || null,
        stock: product.stock || 0,
        brand: product.brand || "Unknown",
        category: product.category || "Other",
        thumbnail: product.thumbnail || "",
        images: product.images || [],
        createdAt: new Date().toISOString()
      }));
      
      // Complete progress and finish
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadedProducts(formattedProducts);
        onProductsUploaded(formattedProducts);
        
        toast({
          title: "Products Uploaded Successfully",
          description: `${formattedProducts.length} products have been imported.`,
        });
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      
      toast({
        title: "Upload Failed",
        description: err instanceof Error ? err.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetUpload = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
    setUploadedProducts([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleClose = () => {
    setIsOpen(false);
    // Reset after dialog is closed
    setTimeout(resetUpload, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with your product data. 
            The file should include columns for title, description, price, stock, brand, and category.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {uploadedProducts.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">Upload Complete</span>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Imported Products:</h4>
              <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                {uploadedProducts.map((product) => (
                  <div key={product.id} className="flex justify-between py-1 border-b last:border-0">
                    <span className="truncate max-w-[300px]">{product.title}</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {uploadedProducts.length} products have been successfully imported.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="product-file" className="text-sm font-medium">
                Choose File
              </label>
              <input
                id="product-file"
                type="file"
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="border rounded-md p-2"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: CSV, Excel (.xls, .xlsx)
              </p>
            </div>
            
            {file && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{file.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-center text-muted-foreground">
                  Processing file... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
            
            <div className="flex gap-2 flex-col sm:flex-row">
              <Button 
                type="button" 
                variant="default" 
                onClick={processUpload} 
                disabled={!file || isUploading} 
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetUpload} 
                disabled={isUploading || (!file && !error)}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-medium">CSV Format Example:</p>
              <pre className="bg-muted p-2 rounded-md overflow-x-auto mt-1">
                title,description,price,stock,brand,category,discountPercentage,thumbnail,images<br/>
                Product 1,Description here,1499,50,Brand A,Electronics,10,http://image.url,http://image.url;http://image2.url<br/>
                Product 2,Another product,999,25,Brand B,Fashion,5,http://image.url,http://image.url
              </pre>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {uploadedProducts.length > 0 ? "Done" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};