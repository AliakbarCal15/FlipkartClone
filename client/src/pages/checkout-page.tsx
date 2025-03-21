import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layouts/main-layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  CheckCircle2,
  Truck,
  Shield,
  MapPin,
  Home,
  Briefcase,
} from "lucide-react";

type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
    discountPercentage: number;
    thumbnail: string;
  };
};

type CartWithItems = {
  cart: {
    id: number;
  };
  items: CartItem[];
};

// Form schemas
const addressSchema = z.object({
  name: z.string().min(3, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  pincode: z.string().min(6, "Pincode is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  addressType: z.enum(["home", "work"], {
    required_error: "Please select an address type",
  }),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(["cod", "card", "upi"], {
    required_error: "Please select a payment method",
  }),
});

type AddressFormValues = z.infer<typeof addressSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

enum CheckoutStep {
  ADDRESS = 0,
  PAYMENT = 1,
  REVIEW = 2,
}

const CheckoutPage = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.ADDRESS);
  const [address, setAddress] = useState<AddressFormValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  
  // Fetch cart data
  const { data: cartData, isLoading } = useQuery<CartWithItems>({
    queryKey: ["/api/cart"],
  });
  
  // Address form
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: user?.name || "",
      phone: "",
      pincode: "",
      address: "",
      city: "",
      state: "",
      addressType: "home",
    },
  });
  
  // Payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "cod",
    },
  });
  
  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: {
      totalAmount: number;
      shippingAddress: string;
      paymentMethod: string;
    }) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.order.id} has been confirmed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      navigate("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate totals
  const calculateTotals = () => {
    if (!cartData?.items || cartData.items.length === 0) {
      return { totalItems: 0, subtotal: 0, discount: 0, deliveryCharge: 0, total: 0 };
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
    
    const deliveryCharge = subtotal - discount > 500 ? 0 : 40;
    const total = subtotal - discount + deliveryCharge;
    
    return {
      totalItems,
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      deliveryCharge,
      total: Math.round(total),
    };
  };
  
  const { totalItems, subtotal, discount, deliveryCharge, total } = calculateTotals();
  
  // Handle address form submission
  const onAddressSubmit = (data: AddressFormValues) => {
    setAddress(data);
    setCurrentStep(CheckoutStep.PAYMENT);
  };
  
  // Handle payment form submission
  const onPaymentSubmit = (data: PaymentFormValues) => {
    setPaymentMethod(data.paymentMethod);
    setCurrentStep(CheckoutStep.REVIEW);
  };
  
  // Handle place order
  const handlePlaceOrder = () => {
    if (!address || !paymentMethod) {
      toast({
        title: "Missing information",
        description: "Please complete all steps before placing an order",
        variant: "destructive",
      });
      return;
    }
    
    const shippingAddress = `${address.name}, ${address.address}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`;
    
    placeOrderMutation.mutate({
      totalAmount: total,
      shippingAddress,
      paymentMethod,
    });
  };
  
  // Format address for display
  const formatAddress = (addr: AddressFormValues) => {
    return (
      <div className="text-sm">
        <p className="font-medium">{addr.name}</p>
        <p>{addr.address}</p>
        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
        <p>Phone: {addr.phone}</p>
        <p className="mt-1 inline-block px-2 py-0.5 bg-gray-100 rounded text-xs uppercase">
          {addr.addressType}
        </p>
      </div>
    );
  };
  
  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI';
      default:
        return method;
    }
  };
  
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
  
  // If cart is empty
  if (!cartData?.items || cartData.items.length === 0) {
    navigate("/cart");
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-medium mb-6">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column - Checkout Steps */}
          <div className="w-full lg:w-8/12">
            <div className="bg-white rounded-sm shadow-sm mb-4">
              {/* Step indicators */}
              <div className="border-b">
                <div className="flex p-4">
                  {[
                    { name: "LOGIN", icon: CheckCircle2, completed: true },
                    { name: "DELIVERY ADDRESS", icon: MapPin, completed: currentStep > CheckoutStep.ADDRESS },
                    { name: "PAYMENT OPTIONS", icon: CreditCard, completed: currentStep > CheckoutStep.PAYMENT },
                    { name: "REVIEW ORDER", icon: CheckCircle2, completed: false },
                  ].map((step, index) => (
                    <div key={index} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          step.completed ? "bg-[#2874f0] text-white" : "bg-[#f0f0f0] text-[#2874f0]"
                        }`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs mt-1 ${currentStep === index ? "font-medium" : ""}`}>
                          {step.name}
                        </span>
                      </div>
                      {index < 3 && (
                        <div className={`absolute top-5 left-[55%] w-[90%] h-0.5 ${
                          step.completed ? "bg-[#2874f0]" : "bg-[#f0f0f0]"
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Step content */}
              <div className="p-6">
                {currentStep === CheckoutStep.ADDRESS && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">Delivery Address</h2>
                    <Form {...addressForm}>
                      <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your 10-digit phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input placeholder="6-digit pincode" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={addressForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address (House No, Building, Street, Area)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter your full address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addressForm.control}
                          name="addressType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Address Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="home" />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center">
                                      <Home className="h-4 w-4 mr-1" />
                                      Home
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="work" />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center">
                                      <Briefcase className="h-4 w-4 mr-1" />
                                      Work
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white px-8 py-2"
                          >
                            CONTINUE
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
                
                {currentStep === CheckoutStep.PAYMENT && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">Payment Options</h2>
                    <Form {...paymentForm}>
                      <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                        <FormField
                          control={paymentForm.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-sm cursor-pointer hover:bg-gray-50">
                                    <FormControl>
                                      <RadioGroupItem value="cod" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer flex-grow">
                                      <div className="flex items-center justify-between">
                                        <span>Cash on Delivery</span>
                                        <span className="text-xs text-[#388e3c]">Available</span>
                                      </div>
                                    </FormLabel>
                                  </FormItem>
                                  
                                  <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-sm cursor-pointer hover:bg-gray-50">
                                    <FormControl>
                                      <RadioGroupItem value="card" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer flex-grow">
                                      <div className="flex items-center justify-between">
                                        <span>Credit / Debit / ATM Card</span>
                                        <span className="text-xs text-[#388e3c]">Offers Available</span>
                                      </div>
                                    </FormLabel>
                                  </FormItem>
                                  
                                  <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-sm cursor-pointer hover:bg-gray-50">
                                    <FormControl>
                                      <RadioGroupItem value="upi" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer flex-grow">
                                      <span>UPI / Google Pay / PhonePe</span>
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex pt-4 space-x-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setCurrentStep(CheckoutStep.ADDRESS)}
                          >
                            BACK
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white px-8 py-2"
                          >
                            CONTINUE
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
                
                {currentStep === CheckoutStep.REVIEW && address && paymentMethod && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">Review Your Order</h2>
                    
                    <div className="space-y-6">
                      <div className="border rounded-sm p-4">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-[#2874f0]" />
                          DELIVERY ADDRESS
                        </h3>
                        {formatAddress(address)}
                      </div>
                      
                      <div className="border rounded-sm p-4">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-[#2874f0]" />
                          PAYMENT METHOD
                        </h3>
                        <p className="text-sm">{formatPaymentMethod(paymentMethod)}</p>
                      </div>
                      
                      <div className="border rounded-sm p-4">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-[#2874f0]" />
                          ORDER SUMMARY
                        </h3>
                        <div className="space-y-4">
                          {cartData.items.map((item) => {
                            const discountedPrice = item.product.price - (item.product.price * (item.product.discountPercentage / 100));
                            
                            return (
                              <div key={item.id} className="flex py-2">
                                <div className="w-16 h-16 flex-shrink-0">
                                  <img
                                    src={item.product.thumbnail}
                                    alt={item.product.title}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="ml-4 flex-grow">
                                  <p className="text-sm mb-1 line-clamp-1">{item.product.title}</p>
                                  <p className="text-xs text-[#878787]">Quantity: {item.quantity}</p>
                                  <p className="text-sm font-medium mt-1">
                                    ₹{Math.round(discountedPrice * item.quantity).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex pt-6 space-x-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(CheckoutStep.PAYMENT)}
                      >
                        BACK
                      </Button>
                      <Button 
                        className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white px-8 py-2"
                        onClick={handlePlaceOrder}
                        disabled={placeOrderMutation.isPending}
                      >
                        {placeOrderMutation.isPending ? "PROCESSING..." : "PLACE ORDER"}
                      </Button>
                    </div>
                  </div>
                )}
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
                    <span className={deliveryCharge === 0 ? "text-[#388e3c]" : ""}>
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-dashed pt-4 font-medium flex justify-between">
                    <span>Total Amount</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
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

export default CheckoutPage;
