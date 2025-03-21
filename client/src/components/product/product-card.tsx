import React from 'react';
import { Link } from 'wouter';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Determine brand display text
  const brandText = product.brand.split(',').map(b => b.trim()).join(', ');
  
  return (
    <Link href={`/product/${product.id}`}>
      <div className="flip-card flex flex-col items-center text-center p-2 cursor-pointer transition-transform hover:shadow-md hover:-translate-y-1">
        <img 
          src={product.image} 
          alt={product.title} 
          className="h-36 w-36 object-contain mb-4" 
        />
        <h3 className="font-medium text-sm">{product.title}</h3>
        
        {product.discountPrice ? (
          <p className="text-flipGreen text-sm font-medium mt-1">
            From ₹{product.discountPrice.toLocaleString()}
          </p>
        ) : product.discountPercentage ? (
          <p className="text-flipGreen text-sm font-medium mt-1">
            Min. {product.discountPercentage}% Off
          </p>
        ) : (
          <p className="text-flipGreen text-sm font-medium mt-1">
            From ₹{product.price.toLocaleString()}
          </p>
        )}
        
        <p className="text-flipTextLight text-xs">{brandText}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
