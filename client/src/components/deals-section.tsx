import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "./ui/product-card";
import SaleTimer from "./ui/sale-timer";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const DealsSection = () => {
  const { data, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { limit: 6 }],
  });
  
  if (isLoading) {
    return (
      <section className="bg-white p-4 mb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-24 ml-4" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar pb-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-48 md:w-56 mr-4">
              <div className="flex flex-col items-center">
                <Skeleton className="h-40 w-32" />
                <Skeleton className="h-4 w-24 mt-4" />
                <Skeleton className="h-4 w-16 mt-2" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
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
        <div className="flex items-center">
          <h2 className="text-xl font-medium text-[#212121]">Deals of the Day</h2>
          <div className="ml-4 flex items-center">
            <SaleTimer 
              initialHours={19} 
              initialMinutes={34} 
              initialSeconds={52} 
            />
          </div>
        </div>
        <Link href="/category/Top%20Offers">
          <button className="bg-[#2874f0] text-white px-4 py-1.5 text-sm font-medium rounded-sm">
            VIEW ALL
          </button>
        </Link>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar pb-4">
        {data.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-48 md:w-56 mr-4">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DealsSection;
