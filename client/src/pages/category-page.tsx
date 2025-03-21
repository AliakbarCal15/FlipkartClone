import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import MainLayout from "@/components/layouts/main-layout";
import ProductCard from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import {
  Filter,
  X,
  Star,
  SortAsc,
  SortDesc,
  Truck,
  ShieldCheck,
  ChevronDown,
  Home
} from "lucide-react";
import { Link } from "wouter";

const CategoryPage = () => {
  const [match, params] = useRoute("/category/:category");
  const category = match ? decodeURIComponent(params.category) : "";
  
  const [sortOption, setSortOption] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filtersMobileOpen, setFiltersMobileOpen] = useState(false);
  
  // Fetch products in category
  const { data: products, isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${category}`],
    enabled: !!category,
  });
  
  // Fetch all categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Get unique brands from products
  const getBrands = () => {
    if (!products) return [];
    const brands = products.map(product => product.brand);
    return Array.from(new Set(brands));
  };
  
  const brands = getBrands();
  
  // Handle brand selection
  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedBrands([]);
    setSortOption("popularity");
  };
  
  // Apply filters and sorting
  const getFilteredProducts = () => {
    if (!products) return [];
    
    let filtered = [...products];
    
    // Filter by price
    filtered = filtered.filter(product => {
      const price = product.price - (product.price * (product.discountPercentage / 100));
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }
    
    // Sort products
    switch (sortOption) {
      case "popularity":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "priceLowToHigh":
        filtered.sort((a, b) => {
          const priceA = a.price - (a.price * (a.discountPercentage / 100));
          const priceB = b.price - (b.price * (b.discountPercentage / 100));
          return priceA - priceB;
        });
        break;
      case "priceHighToLow":
        filtered.sort((a, b) => {
          const priceA = a.price - (a.price * (a.discountPercentage / 100));
          const priceB = b.price - (b.price * (b.discountPercentage / 100));
          return priceB - priceA;
        });
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "discount":
        filtered.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
    }
    
    return filtered;
  };
  
  const filteredProducts = getFilteredProducts();
  
  // Loading state
  if (isProductsLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/4 md:pr-4 mb-4 md:mb-0">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-14 w-full mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <Skeleton key={index} className="h-60 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-4">
          <Link href="/">
            <span className="text-[#878787] hover:text-[#2874f0] cursor-pointer flex items-center">
              <Home className="h-3.5 w-3.5 mr-1" />
              Home
            </span>
          </Link>
          <span className="mx-2 text-[#878787]">/</span>
          <span className="font-medium">{category}</span>
        </div>
        
        <div className="flex flex-wrap">
          {/* Filters - Desktop */}
          <div className="hidden md:block md:w-1/4 md:pr-6">
            <div className="bg-white rounded-sm shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-lg">Filters</h2>
                <button 
                  onClick={resetFilters}
                  className="text-[#2874f0] text-sm hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">PRICE</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 100000]}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    step={1000}
                    className="mb-4"
                  />
                  <div className="flex justify-between">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">BRANDS</h3>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <Label 
                        htmlFor={`brand-${brand}`}
                        className="ml-2 cursor-pointer text-sm"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">CUSTOMER RATINGS</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center">
                      <Checkbox id={`rating-${rating}`} />
                      <Label 
                        htmlFor={`rating-${rating}`}
                        className="ml-2 cursor-pointer text-sm flex items-center"
                      >
                        {rating}
                        <Star className="h-3 w-3 ml-1 fill-current text-amber-500" />
                        & Above
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium mb-3">AVAILABILITY</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="exclude-out-of-stock" />
                    <Label 
                      htmlFor="exclude-out-of-stock"
                      className="ml-2 cursor-pointer text-sm"
                    >
                      Exclude Out of Stock
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Listing */}
          <div className="w-full md:w-3/4">
            {/* Sort Bar */}
            <div className="bg-white rounded-sm shadow-sm p-3 mb-4 flex flex-wrap items-center justify-between">
              <div className="flex items-center">
                <h1 className="font-medium text-lg mr-4">{category}</h1>
                <span className="text-[#878787] text-sm">({filteredProducts.length} products)</span>
              </div>
              
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-sm mr-2">Sort By:</span>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border-none bg-transparent text-sm font-medium cursor-pointer focus:outline-none"
                >
                  <option value="popularity">Popularity</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="discount">Discount</option>
                </select>
                
                {/* Mobile Filter Button */}
                <Button 
                  variant="outline" 
                  className="md:hidden ml-2"
                  onClick={() => setFiltersMobileOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
            
            {/* No Products Message */}
            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-sm shadow-sm p-12 text-center">
                <div className="mb-4">
                  <Filter className="h-16 w-16 mx-auto text-[#878787]" />
                </div>
                <h2 className="text-lg font-medium mb-2">No Products Found</h2>
                <p className="text-[#878787] mb-6">Try changing your filters or search criteria</p>
                <Button 
                  className="bg-[#2874f0]" 
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            )}
            
            {/* Product Grid */}
            {filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Filters - Mobile Drawer */}
        {filtersMobileOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
            <div className="absolute right-0 top-0 bottom-0 bg-white w-80 overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-medium text-lg">Filters</h2>
                <button 
                  onClick={() => setFiltersMobileOpen(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <h3 className="font-medium mb-3">PRICE</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 100000]}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100000}
                      step={1000}
                      className="mb-4"
                    />
                    <div className="flex justify-between">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">BRANDS</h3>
                  <div className="space-y-2">
                    {brands.map(brand => (
                      <div key={brand} className="flex items-center">
                        <Checkbox
                          id={`mobile-brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <Label 
                          htmlFor={`mobile-brand-${brand}`}
                          className="ml-2 cursor-pointer text-sm"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">CUSTOMER RATINGS</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center">
                        <Checkbox id={`mobile-rating-${rating}`} />
                        <Label 
                          htmlFor={`mobile-rating-${rating}`}
                          className="ml-2 cursor-pointer text-sm flex items-center"
                        >
                          {rating}
                          <Star className="h-3 w-3 ml-1 fill-current text-amber-500" />
                          & Above
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={resetFilters}
                  >
                    CLEAR ALL
                  </Button>
                  <Button 
                    className="flex-1 bg-[#2874f0]"
                    onClick={() => setFiltersMobileOpen(false)}
                  >
                    APPLY
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
