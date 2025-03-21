import { Link } from "wouter";
import { Category } from "@shared/schema";

interface CategoryItemProps {
  category: Category;
  size?: "small" | "medium" | "large";
}

const CategoryItem = ({ category, size = "medium" }: CategoryItemProps) => {
  const { name, image } = category;
  
  const imageSizes = {
    small: "w-12 h-12",
    medium: "w-16 h-16",
    large: "w-20 h-20"
  };
  
  return (
    <Link href={`/category/${name}`}>
      <div className="category-item flex-shrink-0 flex flex-col items-center px-4 py-1 hover:text-[#2874f0] cursor-pointer">
        <img src={image} alt={name} className={`${imageSizes[size]}`} />
        <span className="text-xs font-medium mt-1">{name}</span>
      </div>
    </Link>
  );
};

export default CategoryItem;
