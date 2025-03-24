import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  User, ShoppingCart, ChevronDown, Search, Menu, 
  Bell, HeadphonesIcon, Truck, Download, TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import SearchBar from "./search-bar";

const Header = () => {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-[#2874f0] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Search Section */}
          <div className="flex items-center flex-grow md:flex-grow-0">
            <Link href="/" className="mr-4 flex flex-col items-center">
              <img 
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png" 
                alt="Flipkart" 
                className="h-5" 
              />
              <span className="text-xs italic text-[#ffe500] flex items-center">
                Explore <span className="text-white mx-1">Plus</span>
                <img 
                  src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/plus_aef861.png" 
                  alt="Plus" 
                  className="h-3 ml-1"
                />
              </span>
            </Link>
            
            <div className="relative flex-grow max-w-xl hidden md:block">
              <SearchBar />
            </div>
          </div>
          
          {/* Navigation Section */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white text-sm font-medium flex items-center">
                    <User className="mr-1" size={16} />
                    {user.name || user.username}
                    <ChevronDown className="ml-1" size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex px-2 py-1.5">
                    <User className="mr-2 h-4 w-4" />
                    <p className="text-sm font-medium">Hi, {user.name || user.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Rewards</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">Admin Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-white text-[#2874f0] hover:bg-gray-100 px-10 py-1 h-auto font-medium text-sm rounded-sm">
                  Login
                </Button>
              </Link>
            )}
            
            <Link href="#" className="text-white text-sm font-medium">
              Become a Seller
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white text-sm font-medium flex items-center">
                  More
                  <ChevronDown className="ml-1" size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notification Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HeadphonesIcon className="mr-2 h-4 w-4" />
                  <span>24x7 Customer Care</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Advertise</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download App</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/cart" className="text-white text-sm font-medium flex items-center">
              <ShoppingCart className="mr-1" size={16} />
              Cart
            </Link>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
        
        {/* Mobile Search (Only visible on small screens) */}
        <div className="mt-2 relative md:hidden">
          <SearchBar />
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-[#212121] shadow-md">
          <div className="container mx-auto px-4 py-2">
            <ul className="space-y-3 py-2">
              {user ? (
                <>
                  <li className="px-2 py-1.5 border-b border-gray-100">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <p className="text-sm font-medium">Hi, {user.name || user.username}</p>
                    </div>
                  </li>
                  <li>
                    <Link href="/profile" className="block px-2 py-1.5">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="block px-2 py-1.5">
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="block px-2 py-1.5">
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin" className="block px-2 py-1.5">
                      Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="block w-full text-left px-2 py-1.5">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/auth" className="block px-2 py-1.5">
                    Login
                  </Link>
                </li>
              )}
              <li className="border-t border-gray-100">
                <Link href="/cart" className="flex items-center px-2 py-1.5">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                </Link>
              </li>
              <li>
                <Link href="#" className="block px-2 py-1.5">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-2 py-1.5">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Preferences
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-2 py-1.5">
                  <HeadphonesIcon className="mr-2 h-4 w-4" />
                  24x7 Customer Care
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-2 py-1.5">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-2 py-1.5">
                  <Download className="mr-2 h-4 w-4" />
                  Download App
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
