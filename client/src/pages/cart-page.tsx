import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/main-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Plus,
  Minus,
  Info,
  LocationIcon,
  Shield,
  X,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
  };
};

type Cart = {
  id: number;
  userId: number;
  createdAt: Date;
};

type CartWithItems = {
  cart: Cart;
  items: CartItem[];
};

const CartPage = () => {
  const { toast } = useToast();
  const [deliveryPincode, setDeliveryPincode] = useState("");
  
  // Fetch cart data
  const { data: cartData, isLoading } = useQuery<CartWithItems>({
    queryKey: ["/api/cart"],
  });
  
  // Update quantity mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/items/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update quantity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle quantity update
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItemMutation.mutate({ id, quantity: newQuantity });
  };
  
  // Handle remove item
  const handleRemoveItem = (id: number) => {
    removeCartItemMutation.mutate(id);
  };
  
  // Calculate totals
  const calculateTotals = () => {
    if (!cartData?.items || cartData.items.length === 0) {
      return { totalItems: 0, subtotal: 0, discount: 0, total: 0 };
    }
    
    const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
    
    const subtotal = cartData.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
    
    const discount = cartData.items.reduce(
      (sum, item) => sum + ((item.product.price * item.product.discountPercentage / 100) * item.quantity),
      0
    );
    
    const total = subtotal - discount;
    
    return {
      totalItems,
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      total: Math.round(total),
    };
  };
  
  const { totalItems, subtotal, discount, total } = calculateTotals();
  
  // If loading
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-8/12">
              <Skeleton className="h-96 w-full mb-4" />
            </div>
            <div className="w-full lg:w-4/12">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Empty cart state
  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-[#2874f0]" />
            <h2 className="text-xl font-medium mb-2">Your cart is empty!</h2>
            <p className="text-[#878787] mb-6">Add items to it now.</p>
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column - Cart Items */}
          <div className="w-full lg:w-8/12">
            <div className="bg-white rounded-sm shadow-sm mb-4">
              <div className="flex justify-between items-center border-b p-4">
                <h1 className="text-lg font-medium">My Cart ({totalItems})</h1>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1 text-[#2874f0]" />
                  <span>Deliver to:</span>
                  <input
                    type="text"
                    placeholder="Enter delivery pincode"
                    className="ml-2 p-1 border border-gray-300 rounded-sm w-32 text-sm"
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                  />
                  <button className="ml-2 text-[#2874f0] font-medium">Check</button>
                </div>
              </div>
              
              {/* Cart Items */}
              <div>
                {cartData.items.map((item) => {
                  const product = item.product;
                  const discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
                  
                  return (
                    <div key={item.id} className="p-4 border-b flex flex-col md:flex-row">
                      <div className="w-full md:w-2/12 flex justify-center mb-4 md:mb-0">
                        <Link href={`/product/${product.id}`}>
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-24 w-24 object-contain"
                          />
                        </Link>
                      </div>
                      
                      <div className="w-full md:w-10/12">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <div>
                            <Link href={`/product/${product.id}`}>
                              <h3 className="text-sm font-medium mb-1 hover:text-[#2874f0]">{product.title}</h3>
                            </Link>
                            <p className="text-xs text-[#878787] mb-2">Seller: {product.brand}</p>
                            
                            <div className="flex items-baseline mb-3">
                              <span className="text-lg font-medium mr-2">₹{Math.round(discountedPrice * item.quantity).toLocaleString('en-IN')}</span>
                              {product.discountPercentage > 0 && (
                                <>
                                  <span className="text-sm text-[#878787] line-through mr-2">₹{Math.round(product.price * item.quantity).toLocaleString('en-IN')}</span>
                                  <span className="text-sm text-[#388e3c]">{product.discountPercentage}% off</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-2 md:mt-0">
                            <div className="flex items-center border border-gray-300 mr-4">
                              <button 
                                className="px-2 py-1 border-r border-gray-300 text-[#212121]"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={updateCartItemMutation.isPending}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center py-1">{item.quantity}</span>
                              <button 
                                className="px-2 py-1 border-l border-gray-300 text-[#212121]"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={updateCartItemMutation.isPending}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex mt-4 space-x-4">
                          <button 
                            className="text-[#212121] text-sm font-medium"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeCartItemMutation.isPending}
                          >
                            REMOVE
                          </button>
                          <button className="text-[#212121] text-sm font-medium">SAVE FOR LATER</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 flex justify-between items-center bg-[#fff] sticky bottom-0 border-t">
                <div></div>
                <Link href="/checkout">
                  <Button className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white px-12 py-6 rounded-sm text-base font-medium">
                    PLACE ORDER
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Column - Price Details */}
          <div className="w-full lg:w-4/12">
            <div className="bg-white rounded-sm shadow-sm mb-4">
              <div className="p-4 border-b">
                <h2 className="text-base font-medium text-[#878787]">PRICE DETAILS</h2>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Price ({totalItems} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-[#388e3c]">- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className={total > 500 ? "text-[#388e3c]" : ""}>
                      {total > 500 ? "FREE" : "₹40"}
                    </span>
                  </div>
                  
                  <div className="border-t border-dashed pt-4 font-medium flex justify-between">
                    <span>Total Amount</span>
                    <span>₹{(total > 500 ? total : total + 40).toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="text-[#388e3c] font-medium">
                    You will save ₹{discount.toLocaleString('en-IN')} on this order
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-sm shadow-sm">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-[#878787] mr-2 flex-shrink-0" />
                <p className="text-xs text-[#878787]">
                  Safe and Secure Payments. Easy returns. 100% Authentic products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
