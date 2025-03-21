import MainLayout from "@/components/layouts/main-layout";
import MainCarousel from "@/components/main-carousel";
import DealsSection from "@/components/deals-section";
import BannerGrid from "@/components/banner-grid";
import ProductGrid from "@/components/product-grid";

const HomePage = () => {
  return (
    <MainLayout>
      <MainCarousel />
      
      <DealsSection />
      
      <BannerGrid />
      
      <ProductGrid 
        title="Best of Electronics" 
        category="Electronics"
        viewAllLink="/category/Electronics"
      />
      
      <ProductGrid 
        title="Fashion Top Picks" 
        category="Fashion"
        viewAllLink="/category/Fashion"
      />
      
      <ProductGrid 
        title="Home & Kitchen Essentials" 
        category="Home"
        viewAllLink="/category/Home"
      />
    </MainLayout>
  );
};

export default HomePage;
