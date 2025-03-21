import { Link } from "wouter";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  size?: "small" | "medium" | "large";
}

const ProductCard = ({ product, size = "medium" }: ProductCardProps) => {
  const { id, title, price, discountPercentage, rating, brand, thumbnail } = product;
  
  const discountedPrice = price - (price * (discountPercentage / 100));
  
  // Different sizes for different layouts
  const cardClasses = {
    small: "w-full max-w-[150px]",
    medium: "w-full md:w-56",
    large: "w-full md:w-64",
  };
  
  const imageClasses = {
    small: "h-28 w-28",
    medium: "h-40 w-32", 
    large: "h-48 w-40",
  };
  
  return (
    <Link href={`/product/${id}`}>
      <div className={`product-card transition-all duration-200 text-center p-2 bg-white hover:shadow-md hover:-translate-y-[2px] cursor-pointer ${cardClasses[size]}`}>
        <img
          src={thumbnail}
          alt={title}
          className={`${imageClasses[size]} object-contain mx-auto`}
        />
        <h3 className="mt-3 text-sm font-medium text-[#212121] truncate">{title}</h3>
        
        <div className="flex flex-col items-center mt-1">
          <p className="text-[#388e3c] text-sm font-medium">
            {discountPercentage > 0 
              ? `₹${discountedPrice.toFixed(0)} `
              : `₹${price.toFixed(0)}`}
            
            {discountPercentage > 0 && (
              <span className="text-xs text-[#878787] line-through ml-1">
                ₹{price.toFixed(0)}
              </span>
            )}
            
            {discountPercentage > 0 && (
              <span className="text-xs text-[#388e3c] ml-1">
                {discountPercentage}% off
              </span>
            )}
          </p>
          
          {rating > 0 && (
            <div className="flex items-center mt-1">
              <span className="bg-[#388e3c] text-white text-xs py-0.5 px-1.5 rounded flex items-center">
                {rating} ★
              </span>
            </div>
          )}
          
          <p className="text-[#878787] text-xs mt-0.5">{brand}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
