import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
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
  Eye, 
  Truck, 
  Package, 
  Check, 
  Loader2, 
  AlertCircle, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Order status options for Flipkart
const ORDER_STATUSES = [
  { value: 'ordered', label: 'Ordered', icon: <Calendar className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  { value: 'packed', label: 'Packed', icon: <Package className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
  { value: 'shipped', label: 'Shipped', icon: <Truck className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'delivered', label: 'Delivered', icon: <Check className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  { value: 'canceled', label: 'Canceled', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
  { value: 'returned', label: 'Returned', icon: <Package className="h-4 w-4" />, color: 'bg-slate-100 text-slate-800' },
];

// Payment methods
const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'emi', label: 'EMI' },
];

interface OrderItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export const ManageOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const ordersPerPage = 10;

  // Generate random addresses
  const getRandomAddress = () => {
    const streets = [
      "123 Gandhi Road", "456 Nehru Street", "789 Patel Avenue", 
      "234 Tagore Lane", "567 Bose Boulevard", "890 Ambedkar Road"
    ];
    const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];
    const states = ["Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "West Bengal", "Gujarat"];
    const pincodes = ["400001", "560001", "600001", "500001", "700001", "380001"];
    
    const street = streets[Math.floor(Math.random() * streets.length)];
    const cityIndex = Math.floor(Math.random() * cities.length);
    return `${street}, ${cities[cityIndex]}, ${states[cityIndex]} - ${pincodes[cityIndex]}`;
  };

  // Generate random customer names
  const getRandomCustomer = () => {
    const firstNames = ["Raj", "Amit", "Priya", "Neha", "Vikram", "Ananya", "Arjun", "Kiran", "Rohit", "Meera"];
    const lastNames = ["Sharma", "Patel", "Singh", "Desai", "Kumar", "Reddy", "Mehta", "Joshi", "Gupta", "Verma"];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`
    };
  };

  // Generate random products for order items
  const getRandomProducts = (count: number) => {
    const products = [
      { id: 1, title: "Wireless Earbuds", price: 1499, image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100&h=100&fit=crop" },
      { id: 2, title: "Gaming Mouse", price: 1999, image: "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=100&h=100&fit=crop" },
      { id: 3, title: "Bluetooth Speakers", price: 2499, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop" },
      { id: 4, title: "4K Smart TV", price: 45999, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&h=100&fit=crop" },
      { id: 5, title: "Trimmer", price: 1299, image: "https://images.unsplash.com/photo-1585914643208-46d2eaec3030?w=100&h=100&fit=crop" },
      { id: 6, title: "Gaming Laptop", price: 76990, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=100&h=100&fit=crop" },
      { id: 7, title: "Casual Shirts", price: 799, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop" },
      { id: 8, title: "Women's Tops", price: 599, image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=100&h=100&fit=crop" },
      { id: 9, title: "Running Shoes", price: 2999, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" },
      { id: 10, title: "Watches", price: 2499, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=100&h=100&fit=crop" }
    ];
    
    const selectedProducts: OrderItem[] = [];
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const existingIndex = selectedProducts.findIndex(item => item.productId === product.id);
      
      if (existingIndex >= 0) {
        selectedProducts[existingIndex].quantity += 1;
      } else {
        selectedProducts.push({
          id: i + 1,
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          image: product.image
        });
      }
    }
    
    return selectedProducts;
  };

  // Initialize local storage with demo orders if needed
  useEffect(() => {
    const storedOrders = localStorage.getItem('admin_orders');
    if (!storedOrders) {
      // Generate 20 dummy orders
      const demoOrders: Order[] = Array.from({ length: 20 }, (_, i) => {
        const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        const customer = getRandomCustomer();
        const items = getRandomProducts(Math.floor(Math.random() * 3) + 1);
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
          id: 1000 + i,
          userId: 100 + i,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          totalAmount,
          shippingAddress: getRandomAddress(),
          paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)].value,
          status: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)].value,
          createdAt: orderDate.toISOString(),
          updatedAt: new Date(orderDate.getTime() + Math.floor(Math.random() * 24) * 60 * 60 * 1000).toISOString(),
          items
        };
      });
      
      localStorage.setItem('admin_orders', JSON.stringify(demoOrders));
      setOrders(demoOrders);
    } else {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('admin_orders', JSON.stringify(updatedOrders));
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status, updatedAt: new Date().toISOString() });
    }
    
    toast({
      title: "Order Status Updated",
      description: `Order #${orderId} has been marked as ${ORDER_STATUSES.find(s => s.value === status)?.label}`,
    });
  };

  // Filter orders based on search, status, and tab
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch = 
        `#${order.id}`.includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      // Tab filter
      const matchesTab = activeTab === "all" || 
        (activeTab === "recent" && new Date(order.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (activeTab === "processing" && ["ordered", "packed", "shipped", "out_for_delivery"].includes(order.status)) ||
        (activeTab === "delivered" && order.status === "delivered") ||
        (activeTab === "canceled" && (order.status === "canceled" || order.status === "returned"));
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  };

  const filteredOrders = getFilteredOrders();
  
  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  // Get status badge color and icon
  const getStatusBadge = (status: string) => {
    const statusInfo = ORDER_STATUSES.find(s => s.value === status);
    if (!statusInfo) return { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    return statusInfo;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <CardDescription>
          View and manage customer orders, update order status, and track deliveries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-5 md:w-[600px]">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="canceled">Canceled/Returned</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by order # or customer..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1); // Reset to first page on status change
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      {status.icon}
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {currentOrders.length} of {filteredOrders.length} orders
          </div>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  const paymentMethod = PAYMENT_METHODS.find(pm => pm.value === order.paymentMethod)?.label || order.paymentMethod;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "hh:mm a")}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">₹{order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{paymentMethod}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.icon}
                          <span className="ml-1">{statusBadge.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    {status.icon}
                                    <span>{status.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No orders found. Try adjusting your search or filters.
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

        {/* Order Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
              <DialogDescription>
                Complete information about this order.
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <ScrollArea className="max-h-[80vh]">
                <div className="space-y-6 px-1">
                  {/* Order Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-medium">Current Status</h3>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                {status.icon}
                                <span>{status.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="relative">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 mb-5">
                        {ORDER_STATUSES.slice(0, 5).map((status, index) => {
                          const statusIndex = ORDER_STATUSES.findIndex(s => s.value === selectedOrder.status);
                          const isActive = index <= statusIndex && statusIndex < 5; // Only for non-canceled/returned statuses
                          
                          return (
                            <div 
                              key={status.value}
                              className={`flex-1 shadow-none ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between">
                        {ORDER_STATUSES.slice(0, 5).map((status, index) => {
                          const statusIndex = ORDER_STATUSES.findIndex(s => s.value === selectedOrder.status);
                          const isActive = index <= statusIndex && statusIndex < 5;
                          const isCurrent = index === statusIndex && statusIndex < 5;
                          
                          return (
                            <div key={status.value} className="text-center">
                              <div className={`
                                flex items-center justify-center w-8 h-8 rounded-full mb-1 mx-auto
                                ${isCurrent ? 'bg-blue-500 text-white' : isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-400'}
                              `}>
                                {status.icon}
                              </div>
                              <div className={`text-xs ${isActive ? 'text-blue-800 font-medium' : 'text-gray-400'}`}>
                                {status.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Order Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">Order Date:</p>
                            <p className="text-sm font-medium">{format(new Date(selectedOrder.createdAt), "MMM dd, yyyy hh:mm a")}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="h-4 w-4 mr-2 mt-0.5 flex items-center justify-center text-muted-foreground">₹</div>
                          <div>
                            <p className="text-sm">Payment Method:</p>
                            <p className="text-sm font-medium">
                              {PAYMENT_METHODS.find(pm => pm.value === selectedOrder.paymentMethod)?.label || selectedOrder.paymentMethod}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Customer Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">Name:</p>
                            <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">Email:</p>
                            <p className="text-sm font-medium">{selectedOrder.customerEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">Phone:</p>
                            <p className="text-sm font-medium">{selectedOrder.customerPhone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">Shipping Address</h3>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <p className="text-sm">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Order Items */}
                  <div>
                    <h3 className="text-base font-medium mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/64x64?text=No+Image";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{item.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-base font-medium mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm">Subtotal:</p>
                        <p className="text-sm">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Shipping:</p>
                        <p className="text-sm">₹0</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Tax:</p>
                        <p className="text-sm">₹0</p>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <p>Total:</p>
                        <p>₹{selectedOrder.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};