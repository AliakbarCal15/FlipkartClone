import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Banner {
  id: number;
  image: string;
  alt: string;
}

interface MainCarouselProps {
  banners: Banner[];
  isLoading: boolean;
}

const MainCarousel: React.FC<MainCarouselProps> = ({ banners, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-slide functionality
  useEffect(() => {
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => 
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    };
    
    if (banners.length > 0) {
      startAutoSlide();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners.length]);
  
  const goToSlide = (index: number) => {
    if (index < 0) {
      setCurrentIndex(banners.length - 1);
    } else if (index >= banners.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(index);
    }
  };
  
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
  };

  if (isLoading) {
    return (
      <div className="mb-4">
        <Skeleton className="h-32 md:h-64 w-full" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative mb-4 overflow-hidden rounded shadow"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex transition-transform duration-500 ease-in-out h-32 md:h-64"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full flex-shrink-0">
            <img 
              src={banner.image} 
              alt={banner.alt} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:shadow-md"
        onClick={() => goToSlide(currentIndex - 1)}
      >
        <ChevronLeft className="h-4 w-4 text-flipBlue" />
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:shadow-md"
        onClick={() => goToSlide(currentIndex + 1)}
      >
        <ChevronRight className="h-4 w-4 text-flipBlue" />
      </button>
      
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
        {banners.map((_, index) => (
          <button 
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default MainCarousel;
