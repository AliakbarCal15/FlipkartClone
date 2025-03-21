import React, { useState } from 'react';
import { Product, Review } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap, Tag, CheckCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductDetailProps {
  product: Product;
  reviews: Review[];
  reviewsLoading: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  addToCartLoading: boolean;
  buyNowLoading: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  reviews, 
  reviewsLoading,
  onAddToCart,
  onBuyNow,
  addToCartLoading,
  buyNowLoading
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [pincode, setPincode] = useState('');
  
  // Create dummy image array (in a real app, this would come from the product)
  const images = [product.image, product.image, product.image];
  
  // Calculate effective price and discount
  const actualPrice = product.price;
  const discountPrice = product.discountPrice || product.price;
  const discountPercentage = product.discountPercentage || Math.round((1 - (discountPrice / actualPrice)) * 100);
  
  // Calculate average rating
  const averageRating = reviews.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  // Calculate rating distribution
  const ratingDistribution = Array(5).fill(0);
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating - 1]++;
    }
  });
  
  // Convert to percentages
  const ratingPercentages = ratingDistribution.map(count => 
    reviews.length ? (count / reviews.length) * 100 : 0
  ).reverse();

  return (
    <section className="bg-white rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Product Images Section */}
        <div className="border-r border-gray-200 pr-4">
          <div className="sticky top-20">
            <div className="flex">
              {/* Thumbnails */}
              <div className="w-16 space-y-2 mr-3">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`border p-1 cursor-pointer ${
                      selectedImage === index ? 'border-flipBlue' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.title} thumbnail ${index + 1}`} className="w-full" />
                  </div>
                ))}
              </div>
              
              {/* Main Image */}
              <div className="flex-1 flex items-center justify-center p-6">
                <img 
                  src={images[selectedImage]} 
                  alt={product.title} 
                  className="max-h-80 object-contain" 
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex mt-6 space-x-3">
              <Button 
                className="flex-1 bg-flipOrange hover:bg-flipOrange/90 text-white rounded-sm flex items-center justify-center"
                onClick={onAddToCart}
                disabled={addToCartLoading}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> 
                {addToCartLoading ? 'ADDING...' : 'ADD TO CART'}
              </Button>
              <Button 
                className="flex-1 bg-flipBlue hover:bg-flipBlue/90 text-white rounded-sm flex items-center justify-center"
                onClick={onBuyNow}
                disabled={buyNowLoading}
              >
                <Zap className="mr-2 h-5 w-5" /> 
                {buyNowLoading ? 'PROCESSING...' : 'BUY NOW'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product Info Section */}
        <div className="product-info">
          <nav className="text-xs text-flipTextLight mb-2">
            Home &gt; {product.categoryId} &gt; {product.brand} &gt; {product.title}
          </nav>
          
          <h1 className="text-xl font-medium mb-1">{product.title}</h1>
          
          {/* Ratings & Reviews */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-flipGreen text-white text-xs px-1.5 py-0.5 rounded">{product.rating} ★</span>
            <span className="text-flipTextLight text-sm">{product.reviewCount} Ratings & {reviews.length} Reviews</span>
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Flipkart Assured" className="h-5" />
          </div>
          
          {/* Price */}
          <div className="mt-3">
            <div className="flex items-center">
              <span className="text-3xl font-medium">{formatPrice(discountPrice)}</span>
              {discountPrice < actualPrice && (
                <>
                  <span className="line-through text-flipTextLight ml-3">{formatPrice(actualPrice)}</span>
                  <span className="text-flipGreen ml-3">{discountPercentage}% off</span>
                </>
              )}
            </div>
            <p className="text-xs text-flipTextLight mt-1">+ ₹69 Secured Packaging Fee</p>
          </div>
          
          {/* Offers */}
          <div className="mt-4">
            <h3 className="font-medium mb-2">Available offers</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Tag className="text-flipGreen mt-0.5 mr-2 h-4 w-4" />
                <div>
                  <span className="font-medium">Bank Offer</span> 10% off on HDFC Bank Credit Card and EMI Transactions, up to ₹1,500, on orders of ₹5,000 and above <span className="text-flipBlue">T&C</span>
                </div>
              </li>
              <li className="flex items-start">
                <Tag className="text-flipGreen mt-0.5 mr-2 h-4 w-4" />
                <div>
                  <span className="font-medium">Special Price</span> Get extra ₹{Math.round(actualPrice * 0.1)} off (price inclusive of discount) <span className="text-flipBlue">T&C</span>
                </div>
              </li>
              <li className="flex items-start">
                <Tag className="text-flipGreen mt-0.5 mr-2 h-4 w-4" />
                <div>
                  <span className="font-medium">No cost EMI ₹{Math.round(discountPrice / 12)}/month.</span> Standard EMI also available <span className="text-flipBlue">View Plans</span>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Delivery */}
          <div className="mt-6 pb-4 border-b border-gray-200">
            <div className="flex">
              <div className="w-24 text-flipTextLight">Delivery</div>
              <div>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    placeholder="Enter pincode" 
                    className="border border-gray-300 p-1 text-sm w-32"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  <Button 
                    variant="link" 
                    className="text-flipBlue text-sm font-medium ml-2 p-0 h-auto"
                  >
                    Check
                  </Button>
                </div>
                <p className="text-xs text-flipTextLight mt-1">
                  Delivery by {formatDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000))} | Free Delivery
                </p>
              </div>
            </div>
          </div>
          
          {/* Highlights & Specs */}
          <div className="mt-4 space-y-6">
            <div className="flex">
              <div className="w-24 text-flipTextLight">Highlights</div>
              <div className="flex-1">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-24 text-flipTextLight">Warranty</div>
              <div className="text-sm text-flipTextDark">1 Year Manufacturer Warranty</div>
            </div>
          </div>
          
          {/* Seller Info */}
          <div className="mt-6 pb-6 border-b border-gray-200">
            <div className="flex">
              <div className="w-24 text-flipTextLight">Seller</div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-sm">RetailNet</span>
                  <span className="bg-flipBlue text-white text-xs px-1.5 py-0.5 rounded ml-2">4.7 ★</span>
                </div>
                <ul className="text-xs text-flipTextDark mt-1">
                  <li>7 day replacement policy</li>
                  <li>GST invoice available</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Customer Reviews */}
          <div className="mt-6">
            <Tabs defaultValue="ratings">
              <TabsList>
                <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>
              <TabsContent value="ratings">
                <div className="pt-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <span className="text-2xl font-medium">{averageRating}</span>
                        <span className="text-xl text-flipTextDark">★</span>
                      </div>
                      <p className="text-xs text-flipTextLight">{product.reviewCount} Ratings &</p>
                      <p className="text-xs text-flipTextLight">{reviews.length} Reviews</p>
                    </div>
                    
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating, index) => (
                        <div key={rating} className="flex items-center mb-1">
                          <span className="text-xs w-6">{rating}★</span>
                          <div className="flex-1 bg-gray-200 h-2 rounded-sm overflow-hidden">
                            <div 
                              className="bg-flipGreen h-full" 
                              style={{ width: `${ratingPercentages[index]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review Cards */}
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="border-b border-gray-200 pb-4 animate-pulse">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-8 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                          </div>
                          <Skeleton className="h-16 w-full mt-2 rounded" />
                          <div className="mt-2 flex items-center">
                            <Skeleton className="h-3 w-24 rounded mr-4" />
                            <Skeleton className="h-3 w-16 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4">
                          <div className="flex items-center space-x-2">
                            <span className="bg-flipGreen text-white text-xs px-1.5 py-0.5 rounded">{review.rating}★</span>
                            <h4 className="font-medium">Great product!</h4>
                          </div>
                          <p className="text-sm text-flipTextDark mt-2">
                            {review.comment || "The customer didn't write a review, but gave a rating."}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-flipTextLight">
                            <span>User ID: {review.userId} | {formatDate(review.createdAt)}</span>
                            <span className="ml-4">Certified Buyer</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm">
                            <button className="flex items-center mr-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              {Math.floor(Math.random() * 100)}
                            </button>
                            <button className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
                              </svg>
                              {Math.floor(Math.random() * 30)}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="specifications">
                <div className="space-y-4 pt-4">
                  <h3 className="font-medium">General</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-sm text-gray-600 w-1/3">Brand</td>
                          <td className="py-2 text-sm">{product.brand}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-sm text-gray-600">Model</td>
                          <td className="py-2 text-sm">{product.title}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm text-gray-600">Category</td>
                          <td className="py-2 text-sm">Category {product.categoryId}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
