import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Order } from '@shared/schema';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import OrderItem from '@/components/order/order-item';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';

const OrderHistoryPage = () => {
  const [_, navigate] = useLocation();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  return (
    <div className="min-h-screen flex flex-col bg-flipGray">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 flex-1 w-full">
        <div className="bg-white rounded shadow mb-4 p-4">
          <h2 className="text-xl font-medium mb-4">My Orders</h2>
          
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <div className="bg-gray-200 h-4 w-28 rounded"></div>
                      <div className="bg-gray-200 h-3 w-24 rounded mt-1"></div>
                    </div>
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                  </div>
                  
                  <div className="pt-3 flex">
                    <div className="bg-gray-200 w-16 h-16 rounded"></div>
                    <div className="ml-4 flex-1">
                      <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                      <div className="bg-gray-200 h-3 w-1/2 rounded mt-1"></div>
                      <div className="bg-gray-200 h-3 w-16 rounded mt-1"></div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-gray-200 h-4 w-16 rounded"></div>
                      <div className="bg-gray-200 h-3 w-24 rounded mt-1"></div>
                      <div className="bg-gray-200 h-3 w-32 rounded mt-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="font-medium text-lg mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-flipBlue hover:bg-flipBlue/90"
              >
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
