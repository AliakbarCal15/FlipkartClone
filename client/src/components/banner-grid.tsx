import { Link } from "wouter";

interface BannerGridProps {
  banners?: {
    image: string;
    link: string;
    title?: string;
  }[];
}

const BannerGrid = ({ banners }: BannerGridProps) => {
  // Default banners if none provided
  const defaultBanners = [
    {
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=300&fit=crop",
      link: "/electronics",
      title: "Electronics Sale"
    },
    {
      image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=300&fit=crop",
      link: "/fashion",
      title: "Fashion Sale"
    }
  ];
  
  const displayBanners = banners || defaultBanners;
  
  return (
    <div className="flex flex-wrap mb-2">
      {displayBanners.map((banner, index) => (
        <div key={index} className="w-full md:w-1/2 p-0.5">
          <Link href={banner.link}>
            <img 
              src={banner.image}
              alt={banner.title || `Banner ${index + 1}`}
              className="w-full h-40 object-cover cursor-pointer"
            />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default BannerGrid;
