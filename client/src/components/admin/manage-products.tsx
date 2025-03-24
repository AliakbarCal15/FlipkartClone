import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Edit, 
  Trash,
  ImageIcon,
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data and interfaces for product management
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number | null;
  rating: number | null;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  createdAt: string;
}

const categories = [
  "Electronics",
  "Fashion",
  "Home",
  "Grocery",
  "Toys",
  "Beauty",
  "Sports",
  "Books",
  "Furniture"
];

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  category: z.string().min(2, "Please select a category"),
  thumbnail: z.string().url("Please enter a valid URL for the thumbnail"),
  images: z.array(z.string().url("Please enter valid URLs for images"))
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ManageProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const productsPerPage = 10;

  // Initialize local storage with demo products if needed
  useEffect(() => {
    const storedProducts = localStorage.getItem('admin_products');
    if (!storedProducts) {
      // Generate some demo products
      const demoProducts: Product[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Product ${i + 1}`,
        description: `This is a description for product ${i + 1}. It includes all the details about the product.`,
        price: Math.floor(Math.random() * 10000) + 500,
        discountPercentage: Math.floor(Math.random() * 70),
        rating: (Math.random() * 2 + 3).toFixed(1) as unknown as number,
        stock: Math.floor(Math.random() * 100) + 10,
        brand: ["Apple", "Samsung", "Sony", "HP", "Dell", "Lenovo", "Asus", "Nike", "Adidas", "Puma"][Math.floor(Math.random() * 10)],
        category: categories[Math.floor(Math.random() * categories.length)],
        thumbnail: `https://images.unsplash.com/photo-${1590000000000 + i}?w=400&h=400&fit=crop`,
        images: [
          `https://images.unsplash.com/photo-${1590000000000 + i}?w=400&h=400&fit=crop`,
          `https://images.unsplash.com/photo-${1591000000000 + i}?w=400&h=400&fit=crop`
        ],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
      }));
      localStorage.setItem('admin_products', JSON.stringify(demoProducts));
      setProducts(demoProducts);
    } else {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discountPercentage: 0,
      stock: 0,
      brand: "",
      category: "",
      thumbnail: "",
      images: [""]
    }
  });

  const onAddImage = () => {
    const currentImages = form.getValues().images || [];
    form.setValue("images", [...currentImages, ""]);
  };

  const onRemoveImage = (index: number) => {
    const currentImages = form.getValues().images || [];
    if (currentImages.length > 1) {
      form.setValue("images", currentImages.filter((_, i) => i !== index));
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(product => 
        product.id === editingProduct.id ? { ...product, ...data } : product
      );
      setProducts(updatedProducts);
      localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
      toast({
        title: "Product Updated",
        description: `${data.title} has been updated successfully.`,
      });
    } else {
      // Add new product
      const newProduct: Product = {
        ...data,
        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
        createdAt: new Date().toISOString()
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
      toast({
        title: "Product Added",
        description: `${data.title} has been added to the catalog.`,
      });
    }
    
    setIsAddProductOpen(false);
    setEditingProduct(null);
    form.reset();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      brand: product.brand,
      category: product.category,
      thumbnail: product.thumbnail,
      images: product.images
    });
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
      toast({
        title: "Product Deleted",
        description: "The product has been removed from the catalog.",
        variant: "destructive"
      });
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const resetForm = () => {
    form.reset();
    setEditingProduct(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Management</CardTitle>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  Fill in the details for the product. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter brand name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter product description"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="thumbnail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter thumbnail URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <Label className="mb-2 block">Product Images</Label>
                      {form.getValues().images?.map((image, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <Input
                            placeholder={`Image URL ${index + 1}`}
                            value={image}
                            onChange={(e) => {
                              const currentImages = [...form.getValues().images];
                              currentImages[index] = e.target.value;
                              form.setValue("images", currentImages);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onRemoveImage(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddImage}
                        className="mt-2"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Image
                      </Button>
                    </div>
                    
                    <DialogFooter className="pt-4">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        {editingProduct ? "Update Product" : "Save Product"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Manage your product catalog. Add, edit, or remove products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1); // Reset to first page on category change
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {currentProducts.length} of {filteredProducts.length} products
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=No+Image";
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">₹{product.price.toLocaleString()}</span>
                        {product.discountPercentage && product.discountPercentage > 0 && (
                          <span className="text-xs text-green-600">-{product.discountPercentage}%</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 10 ? "outline" : "destructive"}>
                        {product.stock > 0 ? product.stock : "Out of stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-amber-500">★</span>
                        <span>{product.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No products found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    className={currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(totalPages);
                      }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};