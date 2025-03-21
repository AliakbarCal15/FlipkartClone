import React from 'react';
import { CartItem, Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface PriceSummaryProps {
  cartItems: (CartItem & { product: Product })[];
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ 
  cartItems, 
  onPlaceOrder, 
  isPlacingOrder 
}) => {
  // Calculate price details
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  const totalDiscountPrice = cartItems.reduce((sum, item) => {
    const discountedPrice = item.product.discountPrice || item.product.price;
    return sum + (discountedPrice * item.quantity);
  }, 0);
  
  const totalDiscount = totalPrice - totalDiscountPrice;
  const deliveryCharges = totalDiscountPrice >= 500 ? 0 : 40;
  const packagingFee = 69;
  const totalAmount = totalDiscountPrice + deliveryCharges + packagingFee;

  return (
    <div className="bg-white rounded shadow p-4 sticky top-20">
      <h3 className="font-medium border-b pb-3 mb-3">Price Details</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span className="text-flipGreen">- {formatPrice(totalDiscount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Charges</span>
          {deliveryCharges === 0 ? (
            <span className="text-flipGreen">FREE</span>
          ) : (
            <span>{formatPrice(deliveryCharges)}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span>Secured Packaging Fee</span>
          <span>{formatPrice(packagingFee)}</span>
        </div>
        <div className="flex justify-between font-medium text-base border-t border-dashed border-gray-200 pt-3 mt-3">
          <span>Total Amount</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
        <p className="text-flipGreen font-medium">
          You will save {formatPrice(totalDiscount)} on this order
        </p>
      </div>

      <Button 
        className="w-full mt-6 bg-flipOrange hover:bg-flipOrange/90"
        onClick={onPlaceOrder}
        disabled={isPlacingOrder || cartItems.length === 0}
      >
        {isPlacingOrder ? 'PROCESSING...' : 'PLACE ORDER'}
      </Button>

      <div className="mt-6 flex items-center justify-center">
        <img 
          src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/payment-method_69e7ec.svg" 
          alt="Payment Methods" 
          className="h-6" 
        />
      </div>
    </div>
  );
};

export default PriceSummary;
