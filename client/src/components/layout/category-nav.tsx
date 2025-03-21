import React from 'react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@shared/schema';

interface CategoryNavProps {
  categories: Category[];
  isLoading: boolean;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ categories, isLoading }) => {
  return (
    <nav className="bg-white shadow-sm py-2 px-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center space-x-8">
          {isLoading ? (
            // Skeleton loading state
            Array(9).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center min-w-[80px] py-1">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-12 h-3 mt-1" />
              </div>
            ))
          ) : (
            // Actual categories
            categories.map((category) => (
              <Link key={category.id} href={`/category/${category.id}`}>
                <div className="flex flex-col items-center min-w-[80px] py-1 cursor-pointer">
                  <img src={category.image} alt={category.name} className="w-16 h-16" />
                  <span className="text-xs mt-1 font-medium">{category.name}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
