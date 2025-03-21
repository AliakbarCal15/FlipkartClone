import { useState, useEffect, useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: ReactNode[];
  autoplay?: boolean;
  interval?: number;
}

const Carousel = ({ children, autoplay = true, interval = 4000 }: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = children.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Setup autoplay
  useEffect(() => {
    if (autoplay) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, interval);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplay, interval]);

  // Pause autoplay on hover
  const pauseAutoplay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Resume autoplay when not hovering
  const resumeAutoplay = () => {
    if (autoplay && !timerRef.current) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, interval);
    }
  };

  return (
    <div 
      className="carousel relative overflow-hidden"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
      ref={carouselRef}
    >
      <div 
        className="carousel-inner flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {children.map((slide, index) => (
          <div key={index} className="carousel-item flex-none w-full">
            {slide}
          </div>
        ))}
      </div>
      
      <button 
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center z-10"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="text-xl text-[#212121]" />
      </button>
      
      <button 
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center z-10"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="text-xl text-[#212121]" />
      </button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentSlide ? "bg-[#2874f0]" : "bg-white bg-opacity-50"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
