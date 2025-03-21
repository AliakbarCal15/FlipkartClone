import React from 'react';
import { Link } from 'wouter';
import { Order } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  // Fetch order items
  const { data: orderItems, isLoading: itemsLoading } = useQuery({
    queryKey: [`/api/orders/${order.id}/items`],
  });

  return (
    <div className="border border-gray-200 rounded p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <span className="text-flipTextLight text-sm">Order ID: OD{String(order.id).padStart(9, '0')}</span>
          <p className="text-xs text-flipTextLight mt-1">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <Link href={`/order-confirmation/${order.id}`}>
          <Button variant="link" className="text-flipBlue text-sm p-0 h-auto">
            View Details
          </Button>
        </Link>
      </div>
      
      {itemsLoading ? (
        <div className="pt-3 animate-pulse">
          <div className="flex">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded mt-1" />
              <Skeleton className="h-3 w-16 rounded mt-1" />
            </div>
            <div className="flex flex-col items-end">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-3 w-24 rounded mt-1" />
              <Skeleton className="h-3 w-32 rounded mt-1" />
            </div>
          </div>
        </div>
      ) : orderItems && orderItems.length > 0 ? (
        <div className="space-y-4 pt-3">
          {orderItems.map((item: any) => (
            <div key={item.id} className="flex">
              <div className="w-16 h-16">
                <img 
                  src={item.product.image} 
                  alt={item.product.title} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium">{item.product.title}</h4>
                <p className="text-xs text-flipTextLight mt-0.5">
                  {item.product.brand}, Qty: {item.quantity}
                </p>
                <p className="text-xs text-flipTextLight mt-0.5">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-medium text-sm ${
                  order.status === 'DELIVERED' ? 'text-flipGreen' : 
                  order.status === 'CANCELLED' ? 'text-red-500' : 'text-flipBlue'
                }`}>
                  {order.status}
                </span>
                <span className="text-xs text-flipTextLight">
                  {order.status === 'DELIVERED' 
                    ? `on ${formatDate(new Date(order.orderDate.getTime() + 4*24*60*60*1000))}` 
                    : order.status === 'CANCELLED'
                    ? `on ${formatDate(new Date(order.orderDate.getTime() + 1*24*60*60*1000))}`
                    : 'Expected by ' + formatDate(new Date(order.orderDate.getTime() + 4*24*60*60*1000))}
                </span>
                {order.status === 'DELIVERED' && (
                  <Button 
                    variant="link" 
                    className="text-flipBlue text-xs mt-1 p-0 h-auto"
                    onClick={() => window.alert('Review functionality not implemented in this demo')}
                  >
                    RATE & REVIEW PRODUCT
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-3 text-center text-sm text-gray-500">
          <p>No items found in this order.</p>
        </div>
      )}
      
      <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
        <div className="text-sm font-medium">
          Total: {formatPrice(order.totalAmount)}
        </div>
        <div className="flex space-x-2">
          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => window.alert('Cancel order functionality not implemented in this demo')}
            >
              Cancel
            </Button>
          )}
          <Link href={`/order-confirmation/${order.id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-flipBlue text-flipBlue hover:bg-blue-50"
            >
              <ExternalLink className="h-3 w-3 mr-1" /> 
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
