import React from 'react';
import { Link } from 'wouter';
import { Product } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

interface BudgetBuysProps {
  products: Product[];
  isLoading: boolean;
}

const BudgetBuys: React.FC<BudgetBuysProps> = ({ products, isLoading }) => {
  return (
    <section className="bg-white rounded shadow mb-4 p-4">
      <h2 className="text-xl font-medium mb-4">Budget Buys</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded p-3 flex flex-col items-center">
              <Skeleton className="h-28 w-28 rounded-md mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map(product => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="flip-card bg-gray-50 rounded p-3 flex flex-col items-center text-center cursor-pointer transition-transform hover:shadow-md hover:-translate-y-1">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="h-28 w-28 object-contain mb-3" 
                />
                <h3 className="font-medium text-sm">{product.title}</h3>
                <p className="text-flipGreen text-sm font-medium">
                  {product.discountPrice 
                    ? `Under ${formatPrice(product.discountPrice)}`
                    : `Under ${formatPrice(product.price)}`
                  }
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default BudgetBuys;
