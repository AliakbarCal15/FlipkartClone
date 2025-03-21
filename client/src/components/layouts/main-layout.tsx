import { ReactNode } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CategoryNav from "@/components/category-nav";

interface MainLayoutProps {
  children: ReactNode;
  hideCategories?: boolean;
}

const MainLayout = ({ children, hideCategories = false }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f1f3f6] font-roboto">
      <Header />
      {!hideCategories && <CategoryNav />}
      <main className="flex-grow pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
