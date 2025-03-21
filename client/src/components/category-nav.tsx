import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import CategoryItem from "./ui/category-item";
import { CATEGORIES } from "@/lib/constants";
import { useEffect, useState } from "react";

const CategoryNav = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  useEffect(() => {
    if (data) {
      setCategories(data);
    } else if (!isLoading && !error) {
      // Fallback to constant data if API doesn't return anything
      setCategories(CATEGORIES.map((cat, index) => ({
        id: index + 1,
        name: cat.name,
        image: cat.image,
        createdAt: new Date()
      })));
    }
  }, [data, isLoading, error]);
  
  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm sticky top-16 z-40">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto py-2 px-4 no-scrollbar">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center px-4 py-1 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="w-16 h-3 bg-gray-200 mt-2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="bg-white shadow-sm sticky top-16 z-40">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto py-2 px-4 no-scrollbar">
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
