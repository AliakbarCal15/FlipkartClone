import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/main-layout";
import { Order, OrderItem, Product } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  ChevronRight,
  Star,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";

type OrderWithItems = {
  order: Order;
  items: (OrderItem & { product: Product })[];
};

const OrdersPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Fetch order details when expanded
  const { data: expandedOrderData, isLoading: isOrderDetailLoading } = useQuery<OrderWithItems>({
    queryKey: [`/api/orders/${expandedOrderId}`],
    enabled: !!expandedOrderId,
  });
  
  // Handle order expansion toggle
  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  // Filter orders based on status and search query
  const getFilteredOrders = () => {
    if (!orders) return [];
    
    return orders.filter((order) => {
      const matchesFilter = filter === "all" || order.status === filter;
      const matchesSearch = searchQuery === "" || 
        `#${order.id}`.includes(searchQuery) || 
        order.status.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  };
  
  const filteredOrders = getFilteredOrders();
  
  // Format date
  const formatDate = (dateString: Date | string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get order status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-[#388e3c]" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-[#2874f0]" />;
      case 'processing':
        return <Package className="h-5 w-5 text-[#ff9f00]" />;
      default:
        return <Clock className="h-5 w-5 text-[#878787]" />;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-4">
          <Skeleton className="h-10 w-40 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-[#2874f0]" />
            <h2 className="text-xl font-medium mb-2">No Orders Found!</h2>
            <p className="text-[#878787] mb-6">You haven't placed any orders yet.</p>
            <Link href="/">
              <Button className="bg-[#2874f0]">Shop Now</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-medium mb-6">My Orders</h1>
        
        <div className="bg-white rounded-sm shadow-sm mb-6">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
            <div className="flex justify-between items-center p-4 border-b">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="rounded-sm data-[state=active]:bg-[#2874f0] data-[state=active]:text-white"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="processing" 
                  className="rounded-sm data-[state=active]:bg-[#2874f0] data-[state=active]:text-white"
                >
                  Processing
                </TabsTrigger>
                <TabsTrigger 
                  value="shipped" 
                  className="rounded-sm data-[state=active]:bg-[#2874f0] data-[state=active]:text-white"
                >
                  Shipped
                </TabsTrigger>
                <TabsTrigger 
                  value="delivered" 
                  className="rounded-sm data-[state=active]:bg-[#2874f0] data-[state=active]:text-white"
                >
                  Delivered
                </TabsTrigger>
                <TabsTrigger 
                  value="cancelled" 
                  className="rounded-sm data-[state=active]:bg-[#2874f0] data-[state=active]:text-white"
                >
                  Cancelled
                </TabsTrigger>
              </TabsList>
              
              <div className="relative flex items-center">
                <Search className="h-4 w-4 absolute left-3 text-[#878787]" />
                <input
                  type="text"
                  placeholder="Search orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border rounded-sm focus:outline-none focus:border-[#2874f0]"
                />
              </div>
            </div>
            
            <div className="p-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Filter className="h-10 w-10 mx-auto mb-2 text-[#878787]" />
                  <p className="text-[#878787]">No orders match your filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border rounded-sm overflow-hidden"
                    >
                      {/* Order header */}
                      <div className="bg-[#f5f5f5] p-4 flex flex-wrap justify-between items-center">
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">ORDER</span> #{order.id}
                          </p>
                          <p className="text-xs text-[#878787]">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center mr-4">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 text-sm capitalize">
                              {order.status}
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => toggleOrderExpansion(order.id)}
                          >
                            {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Order details (shown when expanded) */}
                      {expandedOrderId === order.id && (
                        <div className="p-4 border-t">
                          {isOrderDetailLoading ? (
                            <div className="space-y-4">
                              <Skeleton className="h-20 w-full" />
                              <Skeleton className="h-20 w-full" />
                            </div>
                          ) : expandedOrderData ? (
                            <div>
                              {/* Order items */}
                              <div className="space-y-4 mb-6">
                                {expandedOrderData.items.map((item) => {
                                  const product = item.product;
                                  
                                  return (
                                    <div key={item.id} className="flex">
                                      <div className="w-16 h-16 flex-shrink-0">
                                        <img
                                          src={product.thumbnail}
                                          alt={product.title}
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                      <div className="ml-4 flex-grow">
                                        <p className="text-sm mb-1 line-clamp-1">{product.title}</p>
                                        <p className="text-xs text-[#878787]">
                                          Quantity: {item.quantity} • ₹{item.price.toLocaleString('en-IN')} each
                                        </p>
                                        <p className="text-sm font-medium mt-1">
                                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Link href={`/product/${product.id}`}>
                                          <Button variant="outline" size="sm" className="text-xs h-8">
                                            Buy Again
                                          </Button>
                                        </Link>
                                        {order.status === 'delivered' && (
                                          <Link href={`/product/${product.id}`}>
                                            <Button variant="ghost" size="sm" className="text-xs h-8 mt-2">
                                              <Star className="h-3 w-3 mr-1" />
                                              Rate & Review
                                            </Button>
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Order summary */}
                              <div className="border-t pt-4 flex flex-wrap justify-between">
                                <div>
                                  <p className="text-sm font-medium">Shipping Address:</p>
                                  <p className="text-xs text-[#878787] mt-1">{expandedOrderData.order.shippingAddress}</p>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-sm font-medium">Payment Method:</p>
                                  <p className="text-xs text-[#878787] mt-1">{expandedOrderData.order.paymentMethod}</p>
                                  <p className="text-sm font-medium mt-2">
                                    Total: ₹{expandedOrderData.order.totalAmount.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-center py-4 text-[#878787]">Failed to load order details</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
