import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Address, CartItem, Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

interface CheckoutFormProps {
  addresses: Address[];
  cartItems: (CartItem & { product: Product })[];
  selectedAddress: number | null;
  paymentMethod: string;
  onAddressChange: (addressId: number) => void;
  onPaymentMethodChange: (method: string) => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
}

const addressSchema = z.object({
  name: z.string().min(3, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  addressLine: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode required"),
  addressType: z.enum(["HOME", "WORK"]).default("HOME"),
  isDefault: z.boolean().default(false),
});

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  addresses, 
  cartItems, 
  selectedAddress,
  paymentMethod,
  onAddressChange,
  onPaymentMethodChange,
  onPlaceOrder,
  isPlacingOrder
}) => {
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      addressType: "HOME",
      isDefault: false,
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addressSchema>) => {
      const res = await apiRequest('POST', '/api/addresses', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      setAddressDialogOpen(false);
      onAddressChange(data.id);
      form.reset();
      toast({
        title: 'Address added',
        description: 'Your new address has been added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add address',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      await apiRequest('DELETE', `/api/cart/${cartItemId}`);
      return cartItemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item removed',
        description: 'Product has been removed from your cart',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove item',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number, quantity: number }) => {
      const res = await apiRequest('PATCH', `/api/cart/${cartItemId}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update quantity',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const onAddressSubmit = (data: z.infer<typeof addressSchema>) => {
    addAddressMutation.mutate(data);
  };

  const handleRemoveItem = (cartItemId: number) => {
    removeFromCartMutation.mutate(cartItemId);
  };

  const handleQuantityChange = (cartItemId: number, quantity: number) => {
    updateQuantityMutation.mutate({ cartItemId, quantity });
  };

  return (
    <>
      {/* Delivery Address Section */}
      <div className="bg-white rounded shadow mb-4 p-4">
        <div className="flex justify-between mb-4">
          <h3 className="font-medium">Delivery Address</h3>
          <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="link" 
                className="text-flipBlue p-0 h-auto"
              >
                ADD NEW
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddressSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="addressLine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street, Apartment 45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Bangalore" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Karnataka" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="560034" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="addressType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Type</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="HOME" id="home" />
                              <Label htmlFor="home">Home</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="WORK" id="work" />
                              <Label htmlFor="work">Work</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              id="isDefault"
                            />
                            <Label htmlFor="isDefault">Make this my default address</Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-flipBlue hover:bg-flipBlue/90"
                    disabled={addAddressMutation.isPending}
                  >
                    {addAddressMutation.isPending ? 'Adding...' : 'Add Address'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div 
                key={address.id} 
                className={`border rounded-sm p-3 ${
                  selectedAddress === address.id 
                    ? 'border-flipBlue bg-blue-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <input 
                    type="radio" 
                    name="address" 
                    id={`address-${address.id}`} 
                    checked={selectedAddress === address.id}
                    onChange={() => onAddressChange(address.id)}
                  />
                  <label htmlFor={`address-${address.id}`} className="font-medium">
                    {address.name}
                  </label>
                  <span className="bg-gray-200 text-flipTextDark text-xs px-1.5 rounded">
                    {address.addressType}
                  </span>
                  {address.isDefault && (
                    <span className="bg-flipBlue text-white text-xs px-1.5 rounded">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-sm text-flipTextDark">
                  {address.addressLine}, {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-sm text-flipTextDark mt-1">Phone: {address.phone}</p>
                <div className="mt-3 flex items-center text-sm">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-3 text-flipTextDark"
                  >
                    <Edit className="h-3 w-3 mr-1" /> EDIT
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-flipTextDark hover:bg-transparent hover:text-red-500 p-0"
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> REMOVE
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-gray-300 rounded-sm p-6 flex flex-col items-center justify-center">
              <Plus className="h-8 w-8 text-flipBlue mb-2" />
              <p className="text-sm text-gray-600 mb-3">No saved addresses</p>
              <Button 
                variant="outline" 
                className="border-flipBlue text-flipBlue"
                onClick={() => setAddressDialogOpen(true)}
              >
                Add New Address
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded shadow mb-4 p-4">
        <h3 className="font-medium border-b pb-3 mb-3">Order Summary</h3>
        
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex border-b border-gray-100 pb-4">
              <div className="w-20 h-20 p-2 flex-shrink-0">
                <img 
                  src={item.product.image} 
                  alt={item.product.title} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium">{item.product.title}</h4>
                <p className="text-xs text-flipTextLight mt-1">
                  {item.product.brand}
                </p>
                <p className="text-xs text-flipTextLight mt-1">
                  Seller: RetailNet
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-medium">
                    {formatPrice(item.product.discountPrice || item.product.price)}
                  </span>
                  {item.product.discountPrice && (
                    <>
                      <span className="line-through text-flipTextLight ml-2 text-xs">
                        {formatPrice(item.product.price)}
                      </span>
                      <span className="text-flipGreen ml-2 text-xs">
                        {item.product.discountPercentage || Math.round((1 - (item.product.discountPrice / item.product.price)) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <span>Qty:</span>
                  <select 
                    className="border border-gray-300 rounded-sm px-1 py-0.5"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    disabled={updateQuantityMutation.isPending}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  variant="link" 
                  className="text-flipBlue p-0 h-auto"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removeFromCartMutation.isPending}
                >
                  REMOVE
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Payment Options */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <h3 className="font-medium border-b pb-3 mb-3">Payment Options</h3>
        
        <div className="flex">
          {/* Payment Methods */}
          <div className="w-64 border-r border-gray-200 pr-4">
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={onPaymentMethodChange}
              className="space-y-1"
            >
              <div className={`p-3 flex items-center ${paymentMethod === 'UPI' ? 'bg-blue-50 border-l-4 border-flipBlue' : ''}`}>
                <RadioGroupItem value="UPI" id="upi" className="mr-3" />
                <Label htmlFor="upi">UPI</Label>
              </div>
              <div className={`p-3 flex items-center ${paymentMethod === 'CARDS' ? 'bg-blue-50 border-l-4 border-flipBlue' : ''}`}>
                <RadioGroupItem value="CARDS" id="cards" className="mr-3" />
                <Label htmlFor="cards">Credit/Debit Card</Label>
              </div>
              <div className={`p-3 flex items-center ${paymentMethod === 'NETBANKING' ? 'bg-blue-50 border-l-4 border-flipBlue' : ''}`}>
                <RadioGroupItem value="NETBANKING" id="netbanking" className="mr-3" />
                <Label htmlFor="netbanking">Net Banking</Label>
              </div>
              <div className={`p-3 flex items-center ${paymentMethod === 'COD' ? 'bg-blue-50 border-l-4 border-flipBlue' : ''}`}>
                <RadioGroupItem value="COD" id="cod" className="mr-3" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Payment Details */}
          <div className="flex-1 pl-4">
            {paymentMethod === 'UPI' && (
              <div className="payment-upi">
                <p className="text-sm mb-3">Pay using UPI Apps</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-gray-200 rounded p-2 flex flex-col items-center text-center">
                    <img src="https://rukminim1.flixcart.com/www/96/96/promos/02/07/2019/9e5599cc-1974-4c47-9409-ef8b21124ad2.png" alt="PhonePe" className="h-12 w-12 mb-1" />
                    <span className="text-xs">PhonePe</span>
                  </div>
                  <div className="border border-gray-200 rounded p-2 flex flex-col items-center text-center">
                    <img src="https://rukminim1.flixcart.com/www/96/96/promos/03/07/2019/92eaecad-f4f1-4100-9303-aa10aa4b18f0.png" alt="Google Pay" className="h-12 w-12 mb-1" />
                    <span className="text-xs">Google Pay</span>
                  </div>
                  <div className="border border-gray-200 rounded p-2 flex flex-col items-center text-center">
                    <img src="https://rukminim1.flixcart.com/www/96/96/promos/04/07/2019/c5f08c8a-f5f5-486c-a01e-bf77e095ab05.png" alt="Paytm" className="h-12 w-12 mb-1" />
                    <span className="text-xs">Paytm</span>
                  </div>
                </div>
                <p className="text-sm mt-4 mb-2">Or pay using UPI ID</p>
                <div className="flex mb-3">
                  <Input placeholder="Enter UPI ID" className="flex-1 text-sm" />
                  <Button 
                    className="bg-flipBlue hover:bg-flipBlue/90 ml-2"
                    size="sm"
                  >
                    VERIFY
                  </Button>
                </div>
                <Button 
                  className="w-full bg-flipOrange hover:bg-flipOrange/90"
                  onClick={onPlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? 'PROCESSING...' : 'PLACE ORDER'}
                </Button>
              </div>
            )}
            
            {paymentMethod === 'CARDS' && (
              <div className="payment-cards">
                <p className="text-sm mb-3">Pay using Credit or Debit Card</p>
                <div className="space-y-4">
                  <Input placeholder="Card Number" className="text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Valid through (MM/YY)" className="text-sm" />
                    <Input placeholder="CVV" className="text-sm" type="password" />
                  </div>
                  <Input placeholder="Name on Card" className="text-sm" />
                  <Button 
                    className="w-full bg-flipOrange hover:bg-flipOrange/90"
                    onClick={onPlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'PROCESSING...' : 'PLACE ORDER'}
                  </Button>
                </div>
              </div>
            )}
            
            {paymentMethod === 'NETBANKING' && (
              <div className="payment-netbanking">
                <p className="text-sm mb-3">Pay using Net Banking</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="border border-gray-200 rounded p-2 flex flex-col items-center text-center">
                    <img src="https://logo.clearbit.com/hdfcbank.com" alt="HDFC" className="h-12 w-12 mb-1" />
                    <span className="text-xs">HDFC</span>
                  </div>
                  <div className="border border-gray-200 rounded p-2 flex flex-col items-center text-center">
                    <img src="https://logo.clearbit.com/icicibank.com" alt="ICICI" className="h-12 w-12 mb-1" />
                    <span className="text-xs">ICICI</span>
                  </div>
                  <div className="border border-gray-200 rounded p-2 flex flex-col items-center text-center">
                    <img src="https://logo.clearbit.com/sbi.co.in" alt="SBI" className="h-12 w-12 mb-1" />
                    <span className="text-xs">SBI</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-flipOrange hover:bg-flipOrange/90"
                  onClick={onPlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? 'PROCESSING...' : 'PLACE ORDER'}
                </Button>
              </div>
            )}
            
            {paymentMethod === 'COD' && (
              <div className="payment-cod">
                <p className="text-sm mb-3">Cash on Delivery</p>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
                  <p className="text-sm">
                    Cash handling charges of ₹40 are applicable for this order.
                  </p>
                </div>
                <Button 
                  className="w-full bg-flipOrange hover:bg-flipOrange/90"
                  onClick={onPlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? 'PROCESSING...' : 'PLACE ORDER'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;
