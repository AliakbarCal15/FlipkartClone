import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CircleAlert, Settings } from "lucide-react";
import { Product } from "./manage-products";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface StockAlertsProps {
  products: Product[];
  onUpdateProductStock: (productId: number, newStock: number) => void;
}

export const StockAlerts = ({ products, onUpdateProductStock }: StockAlertsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(10);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Filter products with low stock based on threshold
  const lowStockProducts = products.filter((product) => product.stock <= stockThreshold);
  const alertCount = lowStockProducts.length;

  // Automatically show notification when alert count changes
  useEffect(() => {
    if (alertCount > 0 && notificationsEnabled) {
      toast({
        title: "Low Stock Alert",
        description: `${alertCount} products are running low on stock`,
        variant: "destructive",
      });
    }
  }, [alertCount, notificationsEnabled, toast]);

  const handleUpdateStock = (productId: number, newStock: number) => {
    onUpdateProductStock(productId, newStock);
    
    toast({
      title: "Stock Updated",
      description: "Product stock has been updated successfully",
    });
  };

  const handleThresholdChange = (value: number[]) => {
    setStockThreshold(value[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={alertCount > 0 ? "destructive" : "outline"} className="relative">
          <Bell className="mr-2 h-4 w-4" />
          Stock Alerts
          {alertCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {alertCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CircleAlert className={alertCount > 0 ? "h-5 w-5 text-destructive" : "h-5 w-5 text-muted-foreground"} />
              Stock Alerts
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Products with stock levels at or below the threshold ({stockThreshold} items).
          </DialogDescription>
        </DialogHeader>
        
        {showSettings ? (
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>Configure when and how you receive stock alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stock-threshold">Stock Threshold</Label>
                  <span className="text-sm font-medium">{stockThreshold} items</span>
                </div>
                <Slider 
                  id="stock-threshold"
                  defaultValue={[stockThreshold]} 
                  max={50} 
                  step={1} 
                  className="w-full" 
                  onValueChange={handleThresholdChange}
                />
                <p className="text-xs text-muted-foreground">
                  Alert me when product stock falls below this threshold
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Back to Alerts
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            {lowStockProducts.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={product.stock === 0 ? "destructive" : "outline"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.stock === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : (
                            <Badge variant="default" className="bg-amber-500">Low Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStock(product.id, product.stock + 20)}
                          >
                            Restock +20
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <CircleAlert className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No Low Stock Alerts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All products have stock levels above the threshold.
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};