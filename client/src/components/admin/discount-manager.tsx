import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CalendarIcon, Percent, Tag, Tags, Trash2 } from "lucide-react";
import { Product } from "./manage-products";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Discount {
  id: number;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: Date;
  endDate: Date;
  applicable: 'product' | 'category' | 'all';
  applicableId?: number;
  applicableName?: string;
  active: boolean;
}

interface DiscountManagerProps {
  products: Product[];
  categories: string[];
  onApplyDiscount: (productIds: number[], discountPercentage: number) => void;
}

export const DiscountManager = ({ products, categories, onApplyDiscount }: DiscountManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([
    {
      id: 1,
      name: "Summer Sale",
      type: "percentage",
      value: 25,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      applicable: "category",
      applicableId: 1,
      applicableName: "Electronics",
      active: true
    },
    {
      id: 2,
      name: "Clearance",
      type: "percentage",
      value: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      applicable: "product",
      applicableId: 3,
      applicableName: "Bluetooth Speakers",
      active: true
    }
  ]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>("single");
  
  // New discount fields
  const [newDiscount, setNewDiscount] = useState<Omit<Discount, 'id'>>({
    name: "",
    type: "percentage",
    value: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    applicable: "all",
    active: true
  });
  
  const { toast } = useToast();

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleApplyBulkDiscount = () => {
    let productsToDiscount: number[] = [];
    
    if (selectedCategory === "all") {
      productsToDiscount = selectedProducts;
    } else {
      productsToDiscount = products
        .filter(p => p.category === selectedCategory)
        .map(p => p.id);
    }
    
    if (productsToDiscount.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select products or a category to apply the discount",
        variant: "destructive"
      });
      return;
    }
    
    onApplyDiscount(productsToDiscount, discountPercentage);
    
    toast({
      title: "Discount Applied",
      description: `${discountPercentage}% discount applied to ${productsToDiscount.length} products`
    });
  };

  const handleAddDiscount = () => {
    if (!newDiscount.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the discount",
        variant: "destructive"
      });
      return;
    }
    
    if (newDiscount.value <= 0) {
      toast({
        title: "Invalid Discount",
        description: "Discount value must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    // Logic to add new discount
    const discount: Discount = {
      ...newDiscount,
      id: Math.max(0, ...discounts.map(d => d.id)) + 1
    };
    
    if (newDiscount.applicable === "product" && !newDiscount.applicableId) {
      toast({
        title: "Missing Information",
        description: "Please select a product for this discount",
        variant: "destructive"
      });
      return;
    }
    
    if (newDiscount.applicable === "category" && !newDiscount.applicableName) {
      toast({
        title: "Missing Information",
        description: "Please select a category for this discount",
        variant: "destructive"
      });
      return;
    }
    
    setDiscounts([...discounts, discount]);
    
    // Reset form
    setNewDiscount({
      name: "",
      type: "percentage",
      value: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      applicable: "all",
      active: true
    });
    
    toast({
      title: "Discount Created",
      description: `"${discount.name}" has been created successfully`
    });
  };

  const handleDeleteDiscount = (id: number) => {
    setDiscounts(discounts.filter(d => d.id !== id));
    
    toast({
      title: "Discount Deleted",
      description: "The discount has been removed"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Percent className="mr-2 h-4 w-4" />
          Manage Discounts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Discount & Offers Manager</DialogTitle>
          <DialogDescription>
            Create and manage discounts for your products
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="active">Active Discounts</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Discount</TabsTrigger>
            <TabsTrigger value="new">New Discount</TabsTrigger>
          </TabsList>
          
          {/* Active Discounts */}
          <TabsContent value="active" className="pt-4">
            {discounts.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Discount Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <div className="font-medium">{discount.name}</div>
                          <Badge variant={discount.active ? "default" : "outline"} className="mt-1">
                            {discount.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {discount.type === "percentage" ? `${discount.value}%` : `₹${discount.value}`}
                        </TableCell>
                        <TableCell>
                          {discount.applicable === "all" ? (
                            <Badge variant="outline">All Products</Badge>
                          ) : discount.applicable === "category" ? (
                            <Badge variant="secondary">{discount.applicableName}</Badge>
                          ) : (
                            <Badge variant="outline">{discount.applicableName}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            <div>From: {format(discount.startDate, "PP")}</div>
                            <div>To: {format(discount.endDate, "PP")}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteDiscount(discount.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 border rounded-md">
                <Tags className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No Active Discounts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new discount to get started
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Bulk Discount */}
          <TabsContent value="bulk" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="category-select">Filter by Category</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1 w-32">
                <Label htmlFor="discount-percentage">Discount (%)</Label>
                <Input
                  id="discount-percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.length === products.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Current Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products
                    .filter(p => selectedCategory === "all" || p.category === selectedCategory)
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          {product.discountPercentage ? (
                            <Badge className="bg-green-500">{product.discountPercentage}%</Badge>
                          ) : (
                            <Badge variant="outline">None</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleApplyBulkDiscount}>
                Apply Discount to Selected
              </Button>
            </div>
          </TabsContent>
          
          {/* New Discount */}
          <TabsContent value="new" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="discount-name">Discount Name</Label>
                <Input
                  id="discount-name"
                  placeholder="e.g. Summer Sale"
                  value={newDiscount.name}
                  onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select 
                  value={newDiscount.type} 
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setNewDiscount({ ...newDiscount, type: value })
                  }
                >
                  <SelectTrigger id="discount-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="discount-value">
                  {newDiscount.type === "percentage" ? "Discount Percentage" : "Discount Amount"}
                </Label>
                <div className="relative">
                  <Input
                    id="discount-value"
                    type="number"
                    min="0"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ 
                      ...newDiscount, 
                      value: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <div className="absolute right-3 top-2.5 text-muted-foreground">
                    {newDiscount.type === "percentage" ? "%" : "₹"}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="discount-applies">Applies To</Label>
                <Select 
                  value={newDiscount.applicable} 
                  onValueChange={(value: 'all' | 'category' | 'product') => 
                    setNewDiscount({ 
                      ...newDiscount, 
                      applicable: value,
                      applicableId: undefined,
                      applicableName: undefined
                    })
                  }
                >
                  <SelectTrigger id="discount-applies">
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="category">Specific Category</SelectItem>
                    <SelectItem value="product">Specific Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newDiscount.applicable === "category" && (
              <div className="space-y-1">
                <Label htmlFor="category-selection">Select Category</Label>
                <Select 
                  value={newDiscount.applicableName || ""} 
                  onValueChange={(value) => setNewDiscount({ 
                    ...newDiscount, 
                    applicableName: value,
                    applicableId: categories.indexOf(value) + 1
                  })}
                >
                  <SelectTrigger id="category-selection">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {newDiscount.applicable === "product" && (
              <div className="space-y-1">
                <Label htmlFor="product-selection">Select Product</Label>
                <Select 
                  value={newDiscount.applicableId?.toString() || ""} 
                  onValueChange={(value) => {
                    const productId = parseInt(value);
                    const product = products.find(p => p.id === productId);
                    setNewDiscount({ 
                      ...newDiscount, 
                      applicableId: productId,
                      applicableName: product?.title
                    });
                  }}
                >
                  <SelectTrigger id="product-selection">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newDiscount.startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newDiscount.startDate}
                      onSelect={(date) => date && setNewDiscount({ ...newDiscount, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-1">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newDiscount.endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newDiscount.endDate}
                      onSelect={(date) => date && setNewDiscount({ ...newDiscount, endDate: date })}
                      disabled={(date) => date < newDiscount.startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setNewDiscount({
                name: "",
                type: "percentage",
                value: 10,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                applicable: "all",
                active: true
              })} className="mr-2">
                Reset
              </Button>
              <Button onClick={handleAddDiscount}>
                Create Discount
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};