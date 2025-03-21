import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import CategoryNav from '@/components/layout/category-nav';
import MainCarousel from '@/components/home/main-carousel';
import DealSection from '@/components/home/deal-section';
import BudgetBuys from '@/components/home/budget-buys';
import { useQuery } from '@tanstack/react-query';
import { Category, Product } from '@shared/schema';

const HomePage = () => {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: dealProducts, isLoading: dealsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/deals'],
  });

  const { data: budgetProducts, isLoading: budgetLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/budget'],
  });

  const { data: banners, isLoading: bannersLoading } = useQuery<{id: number, image: string, alt: string}[]>({
    queryKey: ['/api/banners'],
  });

  return (
    <div className="min-h-screen flex flex-col bg-flipGray">
      <Header />
      <CategoryNav categories={categories || []} isLoading={categoriesLoading} />
      
      <main className="max-w-7xl mx-auto p-4 flex-1 w-full">
        <MainCarousel banners={banners || []} isLoading={bannersLoading} />
        <DealSection products={dealProducts || []} isLoading={dealsLoading} />
        <BudgetBuys products={budgetProducts || []} isLoading={budgetLoading} />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
