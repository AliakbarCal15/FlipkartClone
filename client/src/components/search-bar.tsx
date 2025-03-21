import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/category/${searchTerm}`);
    }
  };
  
  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex items-center bg-white rounded-sm">
        <input 
          type="text" 
          className="search-input px-4 py-2 w-full text-[#212121] text-sm rounded-l-sm focus:outline-none" 
          placeholder="Search for products, brands and more" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          type="submit"
          className="px-4 py-2 text-[#2874f0]"
          aria-label="Search"
        >
          <Search className="text-lg" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
