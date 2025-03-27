import { useQuery } from "@tanstack/react-query";
import { Banner } from "@shared/schema";
import Carousel from "./ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const MainCarousel = () => {
  const { data, isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });
  
  if (isLoading) {
    return (
      <div className="carousel mb-2 bg-white">
        <Skeleton className="w-full h-64" />
      </div>
    );
  }
  
  // Fallback banners if none are found
  const banners = data?.length ? data : [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=300&fit=crop",
      link: "/electronics",
      active: true,
      createdAt: new Date()
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=300&fit=crop",
      link: "/fashion",
      active: true,
      createdAt: new Date()
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=300&fit=crop",
      link: "/offers",
      active: true,
      createdAt: new Date()
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=300&fit=crop",
      link: "/home",
      active: true,
      createdAt: new Date()
    }
  ];
  
  return (
    <div className="carousel mb-2 bg-white">
      <Carousel>
        {banners.map((banner) => (
          <Link key={banner.id} href={banner.link}>
            <img 
              src={banner.image}
              alt="Banner" 
              className="w-full h-64 object-cover object-center cursor-pointer"
              onError={(e) => {
                // Fall back to a reliable placeholder if image doesn't load
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x300/2874f0/ffffff?text=Flipkart+Special+Offers";
              }}
            />
          </Link>
        ))}
      </Carousel>
    </div>
  );
};

export default MainCarousel;
