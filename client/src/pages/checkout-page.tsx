import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Address, CartItem, InsertOrder, Product } from '@shared/schema';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import CheckoutForm from '@/components/checkout/checkout-form';
import PriceSummary from '@/components/checkout/price-summary';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CheckoutPage = () => {
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Get cart items
  const { data: cartItems, isLoading: cartLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
  });

  // Get user addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['/api/addresses'],
  });

  // Set default address as selected when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress.id);
    }
  }, [addresses]);

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const res = await apiRequest('POST', '/api/orders', orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      navigate(`/order-confirmation/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Failed to place order',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast({
        title: 'Address required',
        description: 'Please select a delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty',
        variant: 'destructive',
      });
      return;
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    const orderData: InsertOrder = {
      addressId: selectedAddress,
      totalAmount,
      paymentMethod,
    };

    placeOrderMutation.mutate(orderData);
  };

  // If cart is empty after loading, redirect to homepage
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty',
        variant: 'default',
      });
      navigate('/');
    }
  }, [cartLoading, cartItems, navigate]);

  if (cartLoading || addressesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-flipGray">
        <Header />
        <main className="max-w-7xl mx-auto p-4 flex-1 w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-flipBlue animate-spin" />
            <p className="mt-4 text-gray-600">Loading your checkout information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-flipGray">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CheckoutForm 
              addresses={addresses || []} 
              cartItems={cartItems || []} 
              selectedAddress={selectedAddress}
              paymentMethod={paymentMethod}
              onAddressChange={setSelectedAddress}
              onPaymentMethodChange={setPaymentMethod}
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={placeOrderMutation.isPending}
            />
          </div>
          <div>
            <PriceSummary 
              cartItems={cartItems || []} 
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={placeOrderMutation.isPending}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
