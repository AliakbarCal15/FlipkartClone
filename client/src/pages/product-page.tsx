import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Product, Review } from '@shared/schema';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductDetail from '@/components/product/product-detail';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const ProductPage = () => {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id);
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !isNaN(productId),
  });
  
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !isNaN(productId),
  });
  
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/cart', { productId, quantity: 1 });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Added to cart',
        description: 'Product has been added to your cart',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add to cart',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const buyNowMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/cart', { productId, quantity: 1 });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      navigate('/checkout');
    },
    onError: (error) => {
      toast({
        title: 'Failed to proceed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your cart',
        variant: 'default',
      });
      navigate('/auth');
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to proceed with purchase',
        variant: 'default',
      });
      navigate('/auth');
      return;
    }
    buyNowMutation.mutate();
  };

  if (isNaN(productId)) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-flipGray">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 flex-1 w-full">
        {productLoading ? (
          <div className="bg-white p-8 rounded shadow animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
                <div className="h-32 bg-gray-200 rounded mt-6"></div>
              </div>
            </div>
          </div>
        ) : product ? (
          <ProductDetail 
            product={product} 
            reviews={reviews || []} 
            reviewsLoading={reviewsLoading}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            addToCartLoading={addToCartMutation.isPending}
            buyNowLoading={buyNowMutation.isPending}
          />
        ) : (
          <div className="bg-white p-8 rounded shadow text-center">
            <h2 className="text-xl font-medium text-gray-800">Product not found</h2>
            <p className="text-gray-600 mt-2">The product you're looking for doesn't exist or has been removed.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductPage;
