import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "./ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface ProductGridProps {
  title: string;
  category?: string;
  limit?: number;
  viewAllLink?: string;
}

const ProductGrid = ({ title, category, limit = 10, viewAllLink }: ProductGridProps) => {
  const queryParams: { limit: number; category?: string } = { limit };
  if (category) queryParams.category = category;
  
  const { data, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", queryParams],
  });
  
  if (isLoading) {
    return (
      <section className="bg-white p-4 mb-2">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-28" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4 mt-4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
              <Skeleton className="h-3 w-2/3 mt-1" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (!data || data.length === 0) {
    return null;
  }
  
  return (
    <section className="bg-white p-4 mb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-[#212121]">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <button className="bg-[#2874f0] text-white px-4 py-1.5 text-sm font-medium rounded-sm">
              VIEW ALL
            </button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
