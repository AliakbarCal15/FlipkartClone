import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Order, OrderItem, Product } from '@shared/schema';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { formatDate, formatPrice } from '@/lib/utils';

const OrderConfirmationPage = () => {
  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id);
  const [_, navigate] = useLocation();

  const { data: order, isLoading } = useQuery<Order & { address: any }>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !isNaN(orderId),
  });

  const { data: orderItems, isLoading: itemsLoading } = useQuery<(OrderItem & { product: Product })[]>({
    queryKey: [`/api/orders/${orderId}/items`],
    enabled: !isNaN(orderId),
  });

  if (isNaN(orderId)) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-flipGray">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 flex-1 w-full">
        <div className="bg-white rounded shadow p-6 text-center">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="bg-gray-200 h-16 w-16 rounded-full mx-auto mb-4"></div>
              <div className="bg-gray-200 h-6 w-1/3 mx-auto mb-2"></div>
              <div className="bg-gray-200 h-4 w-1/2 mx-auto mb-6"></div>
              <div className="bg-gray-100 p-4 rounded max-w-md mx-auto mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="bg-gray-200 h-4 w-24"></div>
                    <div className="bg-gray-200 h-4 w-24"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 h-4 w-24"></div>
                    <div className="bg-gray-200 h-4 w-24"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 h-4 w-24"></div>
                    <div className="bg-gray-200 h-4 w-24"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <div className="bg-gray-200 h-10 w-32 rounded"></div>
                <div className="bg-gray-200 h-10 w-32 rounded"></div>
              </div>
            </div>
          ) : order ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-flipGreen text-white w-16 h-16 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-xl font-medium mb-1">Order Placed Successfully!</h2>
              <p className="text-flipTextLight mb-4">Your order has been placed successfully. We'll send you a confirmation email shortly.</p>
              
              <div className="bg-gray-50 p-4 rounded max-w-md mx-auto mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-flipTextLight">Order Number:</span>
                  <span className="font-medium">OD{String(order.id).padStart(9, '0')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-flipTextLight">Order Date:</span>
                  <span>{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-flipTextLight">Total Amount:</span>
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/orders')}
                  className="border-flipBlue text-flipBlue"
                >
                  View Orders
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-flipBlue hover:bg-flipBlue/90"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-medium">Order not found</h2>
              <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-flipBlue hover:bg-flipBlue/90 mt-4"
              >
                Return to Home
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
