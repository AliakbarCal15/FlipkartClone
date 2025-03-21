import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Search, ShoppingCart, ChevronDown, User, Package, Heart, Gift, PlusCircle, Bell, Headphones, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { CartItem } from '@shared/schema';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });
  
  const cartCount = cartItems?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page (not implemented in this demo)
      toast({
        title: 'Search',
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-flipBlue py-2 px-4 md:px-16 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and search */}
          <div className="flex items-center flex-1">
            <div className="mr-4">
              <Link href="/" className="text-white text-xl md:text-2xl font-bold italic">
                Flipkart
                <div className="flex items-center text-xs font-normal italic">
                  <span className="text-flipYellow">Explore</span>
                  <span className="text-white ml-1">Plus</span>
                  <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/plus_aef861.png" alt="Plus" className="h-3 ml-1" />
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex bg-white rounded flex-1 max-w-2xl">
              <input 
                type="text" 
                placeholder="Search for products, brands and more" 
                className="py-2 px-4 w-full rounded text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="px-4 text-flipBlue">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {/* Login Button */}
            <div className="relative group">
              {user ? (
                <Button 
                  variant="ghost" 
                  className="text-white p-0 flex items-center gap-1 hover:bg-transparent"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium text-sm">{user.name || user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-white text-flipBlue px-9 py-1 font-medium text-sm rounded shadow-sm hover:shadow-md"
                >
                  Login
                </Button>
              )}
              
              {/* Dropdown for both logged in and logged out users */}
              <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-sm hidden group-hover:block z-20">
                <div className="p-4">
                  {user ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-800 font-medium">Hello, {user.name || user.username}</span>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <Link href="/profile" className="text-gray-800 hover:text-flipBlue">My Profile</Link>
                        </li>
                        <li className="flex items-center space-x-3">
                          <PlusCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">Flipkart Plus Zone</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-gray-500" />
                          <Link href="/orders" className="text-gray-800 hover:text-flipBlue">Orders</Link>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">Wishlist</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Gift className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">Rewards</span>
                        </li>
                        <li>
                          <Button 
                            variant="outline" 
                            className="w-full mt-2 text-flipBlue border-flipBlue"
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                          >
                            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                          </Button>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-800 font-medium">New Customer?</span>
                        <Link href="/auth" className="text-flipBlue font-medium">Sign Up</Link>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">My Profile</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <PlusCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">Flipkart Plus Zone</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">Orders</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">Wishlist</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Gift className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-800">Rewards</span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Become a Seller */}
            <a href="#" className="hidden md:block text-white font-medium text-sm">Become a Seller</a>

            {/* More dropdown */}
            <div className="relative group hidden md:block">
              <button className="text-white font-medium text-sm flex items-center">
                More
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-sm hidden group-hover:block z-20">
                <ul className="py-2">
                  <li className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-800">Notification Preferences</span>
                  </li>
                  <li className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50">
                    <Headphones className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-800">24x7 Customer Care</span>
                  </li>
                  <li className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <span className="text-gray-800">Advertise</span>
                  </li>
                  <li className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50">
                    <Download className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-800">Download App</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cart */}
            <Link href="/checkout" className="text-white font-medium text-sm flex items-center">
              <div className="relative">
                <ShoppingCart className="h-5 w-5 mr-1" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-flipOrange text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              Cart
            </Link>
          </nav>
        </div>
        
        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-2 flex bg-white rounded w-full">
          <input 
            type="text" 
            placeholder="Search for products, brands and more" 
            className="py-2 px-4 w-full rounded text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="px-4 text-flipBlue">
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
