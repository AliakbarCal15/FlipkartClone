import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
import MainLayout from "@/components/layouts/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  ShoppingCart,
  CloudLightning,
  Heart,
  Share2,
  ChevronRight,
  MapPin,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Package,
  Tag
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/product-grid";

const ProductDetailPage = () => {
  const [match, params] = useRoute("/product/:id");
  const productId = match ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading: isProductLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Fetch product reviews
  const { data: reviews, isLoading: isReviewsLoading } = useQuery<(Review & { user: { name: string } })[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart/items", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle add to cart click
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to add items to cart",
        variant: "destructive",
      });
      return;
    }
    
    if (product) {
      addToCartMutation.mutate({
        productId: product.id,
        quantity,
      });
    }
  };
  
  // Handle buy now click
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to make a purchase",
        variant: "destructive",
      });
      return;
    }
    
    if (product) {
      addToCartMutation.mutate(
        {
          productId: product.id,
          quantity,
        },
        {
          onSuccess: () => {
            window.location.href = "/checkout";
          },
        }
      );
    }
  };
  
  if (isProductLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="bg-white p-4 rounded-sm shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/5">
                <Skeleton className="w-full h-96" />
                <div className="flex mt-4 gap-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <Skeleton key={index} className="w-20 h-20" />
                  ))}
                </div>
              </div>
              <div className="w-full md:w-3/5">
                <Skeleton className="w-3/4 h-8 mb-2" />
                <Skeleton className="w-1/2 h-6 mb-4" />
                <Skeleton className="w-1/4 h-6 mb-2" />
                <Skeleton className="w-full h-24 mb-4" />
                <div className="flex gap-4 mb-4">
                  <Skeleton className="w-40 h-12" />
                  <Skeleton className="w-40 h-12" />
                </div>
                <Skeleton className="w-full h-40" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="bg-[#2874f0]">Go to Homepage</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  const discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
  const formattedDiscountedPrice = Math.floor(discountedPrice).toLocaleString('en-IN');
  const formattedOriginalPrice = Math.floor(product.price).toLocaleString('en-IN');
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        {/* Product Details */}
        <div className="bg-white p-4 rounded-sm shadow-sm mb-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Images */}
            <div className="w-full md:w-2/5 sticky top-20 self-start">
              <div className="border border-gray-200 p-2 flex items-center justify-center h-96 mb-4">
                <img 
                  src={product.images[selectedImageIndex] || product.thumbnail} 
                  alt={product.title} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`w-20 h-20 border cursor-pointer flex-shrink-0 ${selectedImageIndex === index ? 'border-[#2874f0]' : 'border-gray-200'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} view ${index + 1}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex mt-4 gap-4">
                <Button 
                  className="w-1/2 py-6 rounded-sm text-white bg-[#ff9f00] hover:bg-[#ff9f00]/90"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {addToCartMutation.isPending ? "ADDING..." : "ADD TO CART"}
                </Button>
                <Button 
                  className="w-1/2 py-6 rounded-sm text-white bg-[#fb641b] hover:bg-[#fb641b]/90"
                  onClick={handleBuyNow}
                  disabled={addToCartMutation.isPending}
                >
                  <CloudLightning className="mr-2 h-5 w-5" />
                  BUY NOW
                </Button>
              </div>
            </div>
            
            {/* Right Column - Info */}
            <div className="w-full md:w-3/5">
              <nav className="text-[#878787] text-xs mb-2">
                Home <ChevronRight className="inline h-3 w-3" /> 
                {product.category} <ChevronRight className="inline h-3 w-3" /> 
                {product.brand} <ChevronRight className="inline h-3 w-3" /> 
                {product.title}
              </nav>
              
              <h1 className="text-xl font-medium text-[#212121] mb-1">{product.title}</h1>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#388e3c] text-white text-xs py-0.5 px-1.5 rounded flex items-center">
                  {product.rating} <Star className="h-3 w-3 ml-0.5 fill-white" />
                </span>
                <span className="text-[#878787] text-sm">
                  {reviews?.length || 0} Ratings & Reviews
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-[#388e3c] text-xs font-medium">Special Price</span>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-medium">₹{formattedDiscountedPrice}</span>
                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-sm text-[#878787] line-through">₹{formattedOriginalPrice}</span>
                      <span className="text-sm text-[#388e3c]">{product.discountPercentage}% off</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <h2 className="font-medium text-[#212121] mb-2">Available offers</h2>
                <ul className="space-y-2">
                  <li className="flex">
                    <Tag className="h-5 w-5 mr-2 text-[#388e3c]" />
                    <div>
                      <span className="font-medium text-[#212121]">Bank Offer</span>
                      <span> 10% off on SBI Credit Card, up to ₹1500 on orders of ₹5000 and above</span>
                      <span className="text-[#2874f0] text-xs font-medium ml-1 cursor-pointer">T&C</span>
                    </div>
                  </li>
                  <li className="flex">
                    <Tag className="h-5 w-5 mr-2 text-[#388e3c]" />
                    <div>
                      <span className="font-medium text-[#212121]">Bank Offer</span>
                      <span> 5% Cashback on Flipkart Axis Bank Card</span>
                      <span className="text-[#2874f0] text-xs font-medium ml-1 cursor-pointer">T&C</span>
                    </div>
                  </li>
                  <li className="flex">
                    <Tag className="h-5 w-5 mr-2 text-[#388e3c]" />
                    <div>
                      <span className="font-medium text-[#212121]">Special Price</span>
                      <span> Get extra {product.discountPercentage}% off (price inclusive of discount)</span>
                      <span className="text-[#2874f0] text-xs font-medium ml-1 cursor-pointer">T&C</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-8 py-4 border-t border-b border-gray-200">
                <div>
                  <p className="text-[#878787] text-sm mb-1">Delivery</p>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-[#2874f0] mr-2" />
                    <div>
                      <div className="flex items-center mb-1">
                        <input
                          type="text"
                          placeholder="Enter delivery pincode"
                          className="border-none text-sm p-0 focus:outline-none"
                        />
                        <span className="text-[#2874f0] text-sm font-medium cursor-pointer">Check</span>
                      </div>
                      <p className="text-xs text-[#212121]">Delivery by 3 days, if ordered today</p>
                      <p className="text-xs text-[#388e3c]">Free delivery on order above ₹499</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-[#878787] text-sm mb-1">Quantity</p>
                  <div className="flex items-center border border-gray-300 w-24">
                    <button 
                      className="px-2 py-1 border-r border-gray-300 text-[#212121]"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center border-none p-1 text-sm focus:outline-none"
                      min="1"
                    />
                    <button 
                      className="px-2 py-1 border-l border-gray-300 text-[#212121]"
                      onClick={() => setQuantity(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-[#878787] text-sm mb-1">Services</p>
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-[#2874f0] mr-2" />
                    <div>
                      <p className="text-xs text-[#212121]">10 Days Replacement Policy</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="py-4">
                <div className="flex gap-12 mb-4">
                  <div>
                    <p className="text-[#878787] text-sm mb-1">Seller</p>
                    <div className="flex items-center">
                      <p className="text-[#2874f0] text-sm font-medium mr-2">{product.brand} Official Store</p>
                      <span className="bg-[#2874f0] text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                        4.5 <Star className="h-3 w-3 ml-0.5 fill-white" />
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#f0f0f0] p-3 rounded flex gap-3">
                    <div className="flex items-center">
                      <img
                        src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/supermart_logo_web_expanded.png"
                        alt="Flipkart Assured"
                        className="h-8"
                      />
                    </div>
                    <p className="text-xs text-[#212121]">
                      <span className="font-medium">Flipkart Assured</span><br />
                      Quality checked by our team
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col items-center">
                    <Truck className="h-10 w-10 text-[#2874f0]" />
                    <p className="text-xs text-[#212121] mt-1">Free Delivery</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Package className="h-10 w-10 text-[#2874f0]" />
                    <p className="text-xs text-[#212121] mt-1">10 Days Replacement</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <BadgeCheck className="h-10 w-10 text-[#2874f0]" />
                    <p className="text-xs text-[#212121] mt-1">Warranty Policy</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="h-10 w-10 text-[#2874f0]" />
                    <p className="text-xs text-[#212121] mt-1">Secure Transaction</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 py-4 border-t border-gray-200">
                <button className="flex items-center text-[#212121]">
                  <Heart className="h-5 w-5 mr-1" />
                  SAVE FOR LATER
                </button>
                
                <button className="flex items-center text-[#212121]">
                  <Share2 className="h-5 w-5 mr-1" />
                  SHARE
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Description and Reviews */}
        <div className="bg-white rounded-sm shadow-sm mb-4">
          <Tabs defaultValue="description">
            <TabsList className="w-full rounded-none justify-start p-0 h-auto bg-white border-b">
              <TabsTrigger value="description" className="rounded-none py-4 px-6 data-[state=active]:text-[#2874f0] data-[state=active]:border-b-2 data-[state=active]:border-[#2874f0]">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-none py-4 px-6 data-[state=active]:text-[#2874f0] data-[state=active]:border-b-2 data-[state=active]:border-[#2874f0]">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none py-4 px-6 data-[state=active]:text-[#2874f0] data-[state=active]:border-b-2 data-[state=active]:border-[#2874f0]">
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <h2 className="text-lg font-medium text-[#212121] mb-4">Description</h2>
              <p className="text-sm text-[#212121] whitespace-pre-line">{product.description}</p>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6">
              <h2 className="text-lg font-medium text-[#212121] mb-4">Specifications</h2>
              <table className="w-full">
                <tbody>
                  <tr className="bg-[#f9f9f9]">
                    <td className="py-2 px-4 text-sm text-[#878787] w-1/3">Brand</td>
                    <td className="py-2 px-4 text-sm">{product.brand}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm text-[#878787] w-1/3">Category</td>
                    <td className="py-2 px-4 text-sm">{product.category}</td>
                  </tr>
                  <tr className="bg-[#f9f9f9]">
                    <td className="py-2 px-4 text-sm text-[#878787] w-1/3">In Stock</td>
                    <td className="py-2 px-4 text-sm">{product.stock} units</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm text-[#878787] w-1/3">Rating</td>
                    <td className="py-2 px-4 text-sm">{product.rating} out of 5</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <h2 className="text-lg font-medium text-[#212121] mb-4">Ratings & Reviews</h2>
              
              {isReviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="w-full">
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <Card key={review.id} className="border-none shadow-none">
                          <CardContent className="p-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-[#388e3c] text-white text-xs py-0.5 px-1.5 rounded flex items-center">
                                {review.rating} <Star className="h-3 w-3 ml-0.5 fill-white" />
                              </span>
                              <span className="font-medium text-sm">{review.user.name}</span>
                            </div>
                            <p className="text-sm text-[#212121]">{review.comment}</p>
                            <div className="flex items-center mt-2 text-xs text-[#878787]">
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-[#878787]">No reviews yet</p>
                  )}
                </>
              )}
              
              {user && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Add a Review</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Rating</label>
                      <select className="border border-gray-300 rounded p-2 w-full">
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Comment</label>
                      <textarea 
                        className="border border-gray-300 rounded p-2 w-full"
                        rows={4}
                        placeholder="Write your review..."
                      ></textarea>
                    </div>
                    <Button className="bg-[#2874f0]">Submit Review</Button>
                  </form>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Similar Products */}
        <ProductGrid
          title="Similar Products"
          category={product.category}
          limit={5}
          viewAllLink={`/category/${product.category}`}
        />
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
