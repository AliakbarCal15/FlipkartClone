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
  Save,
  Upload,
  Bell,
  Percent,
  Copy,
  Loader2
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Product as ProductType } from "@shared/schema";

// Import the new product management components
import { BulkUpload } from "./bulk-upload";
import { StockAlerts } from "./stock-alerts";
import { ProductImageGallery } from "./product-image-gallery";
import { DiscountManager } from "./discount-manager";

// Product interfaces
export interface Product extends ProductType {}

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
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  stock: z.coerce.number().min(0, "Stock cannot be negative").int("Stock must be a whole number"),
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  category: z.string().min(2, "Please select a category"),
  thumbnail: z.string().url("Please enter a valid URL for the thumbnail"),
  images: z.array(z.string().url("Please enter valid URLs for images"))
    .min(1, "At least one image URL is required")
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ManageProducts = () => {
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const productsPerPage = 10;
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch products from API
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Add Product Mutation
  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      console.log("Submitting product data:", data);
      const res = await apiRequest("POST", "/api/admin/products", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.message || "Failed to add product");
      }
      return await res.json();
    },
    onSuccess: (product) => {
      // Invalidate and refetch products list
      console.log("Product added successfully:", product);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Added",
        description: "The product has been added to the catalog.",
      });
      setIsAddProductOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Failed to add product:", error);
      toast({
        title: "Failed to Add Product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormValues }) => {
      console.log("Updating product data:", { id, data });
      const res = await apiRequest("PATCH", `/api/admin/products/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.message || "Failed to update product");
      }
      return await res.json();
    },
    onSuccess: (product) => {
      // Invalidate and refetch products list
      console.log("Product updated successfully:", product);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
      });
      setIsAddProductOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Failed to update product:", error);
      toast({
        title: "Failed to Update Product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting product with ID:", id);
      const res = await apiRequest("DELETE", `/api/admin/products/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete product");
      }
      return;
    },
    onSuccess: () => {
      // Invalidate and refetch products list
      console.log("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Deleted",
        description: "The product has been removed from the catalog.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to delete product:", error);
      toast({
        title: "Failed to Delete Product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

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
    form.setValue("images", [...currentImages, ""], { shouldValidate: true });
  };

  const onRemoveImage = (index: number) => {
    const currentImages = form.getValues().images || [];
    if (currentImages.length > 1) {
      form.setValue("images", currentImages.filter((_, i) => i !== index), { shouldValidate: true });
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      // Update existing product
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      // Add new product
      addProductMutation.mutate(data);
    }
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
      deleteProductMutation.mutate(id);
    }
  };
  const sortedProducts = [...products].sort((a, b) => {
    if (!sortBy) return 0; // If no sorting criteria, return as is
    
    const aValue = a[sortBy as keyof Product];
    const bValue = b[sortBy as keyof Product];
  
    if (aValue == null || bValue == null) return 0; // Avoid errors when values are undefined
  
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  
  // Filter products based on search, category, and sorting
  const filteredProducts = sortedProducts.filter(product => {
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
                              <Input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={field.value?.toString() || "0"} 
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                              />
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
                    
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Images</FormLabel>
                          <div className="space-y-2">
                            {field.value?.map((image, index) => (
                              <div key={index} className="flex items-center gap-2 mb-2">
                                <FormControl>
                                  <Input
                                    placeholder={`Image URL ${index + 1}`}
                                    value={image}
                                    onChange={(e) => {
                                      const currentImages = [...field.value];
                                      currentImages[index] = e.target.value;
                                      field.onChange(currentImages);
                                    }}
                                  />
                                </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={addProductMutation.isPending || updateProductMutation.isPending}
                      >
                        {(addProductMutation.isPending || updateProductMutation.isPending) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {editingProduct ? "Update Product" : "Save Product"}
                          </>
                        )}
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
        {/* Enhanced Product Management Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <BulkUpload 
            onProductsUploaded={(newProducts) => {
              // For each new product, call the create API
              newProducts.forEach(product => {
                addProductMutation.mutate(product);
              });
              
              // Refresh product list
              queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            }} 
          />
          
          <StockAlerts 
            products={products} 
            onUpdateProductStock={(productId, newStock) => {
              // Find the product to update
              const product = products.find(p => p.id === productId);
              if (product) {
                // Update the product with new stock
                updateProductMutation.mutate({ 
                  id: productId, 
                  data: { ...product, stock: newStock } 
                });
              }
            }} 
          />
          
          <DiscountManager 
            products={products}
            categories={categories}
            onApplyDiscount={(productIds, discountPercentage) => {
              // Update each product in the list with the new discount
              productIds.forEach(productId => {
                const product = products.find(p => p.id === productId);
                if (product) {
                  updateProductMutation.mutate({
                    id: productId,
                    data: { ...product, discountPercentage }
                  });
                }
              });
            }}
          />
          
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        </div>
        
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
            <div
  onClick={() => {
    if (sortBy === "id") {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy("id");
      setSortOrder("asc");
    }
  }}
>
  Showing {currentProducts?.length || 0} of {filteredProducts?.length || 0} products
</div>
          </div>
          <Button variant="outline" onClick={() => setIsAddProductOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                  onClick={() => setSortBy("id")}
                  className={`flex items-center gap-1 ${
                    sortBy === "id" ? "font-bold" : ""
                  }`}
                  >
                  ID
                  {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                  onClick={() => setSortBy("title")}
                  className={`flex items-center gap-1 ${
                    sortBy === "title" ? "font-bold" : ""
                  }`}
                  >
                  Product
                  {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                  onClick={() => setSortBy("category")}
                  className={`flex items-center gap-1 ${
                    sortBy === "category" ? "font-bold" : ""
                  }`}
                  >
                  Category
                  {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                  onClick={() => setSortBy("price")}
                  className={`flex items-center gap-1 ${
                    sortBy === "price" ? "font-bold" : ""
                  }`}
                  >
                  Price
                  {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                  onClick={() => setSortBy("stock")}
                  className={`flex items-center gap-1 ${
                    sortBy === "stock" ? "font-bold" : ""
                  }`}
                  >
                  Stock
                  {sortBy === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                  onClick={() => setSortBy("dateAdded")}
                  className={`flex items-center gap-1 ${
                    sortBy === "dateAdded" ? "font-bold" : ""
                  }`}
                  >
                  Rating 
                  {sortBy === "dateAdded" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </TableHead>
                {/* Removed duplicate TableHead elements */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                      <span>Loading products...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-destructive">
                    Error loading products. Please try again later.
                  </TableCell>
                </TableRow>
              ) : currentProducts.length > 0 ? (
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleEditProduct(product)}
                          disabled={updateProductMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <ProductImageGallery 
                          product={product}
                          onUpdateImages={(productId, images, thumbnail) => {
                            // Find the product to update
                            const productToUpdate = products.find(p => p.id === productId);
                            if (productToUpdate) {
                              // Update the product with new images and thumbnail
                              updateProductMutation.mutate({
                                id: productId,
                                data: { ...productToUpdate, images, thumbnail }
                              });
                            }
                          }}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          {deleteProductMutation.isPending && deleteProductMutation.variables === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
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