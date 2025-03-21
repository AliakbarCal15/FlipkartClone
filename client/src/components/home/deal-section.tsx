import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import ProductCard from '@/components/product/product-card';
import { Product } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface DealSectionProps {
  products: Product[];
  isLoading: boolean;
}

const DealSection: React.FC<DealSectionProps> = ({ products, isLoading }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 34,
    seconds: 23
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        
        if (hours < 0) {
          // Reset to a new day's worth of deals
          return {
            hours: 23,
            minutes: 59,
            seconds: 59
          };
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white rounded shadow mb-4 p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <h2 className="text-xl font-medium">Deals of the Day</h2>
        <div className="flex items-center text-sm">
          <Clock className="mr-1 h-4 w-4" />
          <span>
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')} Left
          </span>
        </div>
        <Button 
          variant="default" 
          className="bg-flipBlue hover:bg-flipBlue/90 text-white text-sm rounded-sm"
        >
          VIEW ALL
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center p-2">
              <Skeleton className="h-36 w-36 rounded-md mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DealSection;
