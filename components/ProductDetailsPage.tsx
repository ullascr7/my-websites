import React, { useState } from 'react';
import { Product, ShoppingMindset } from '../types';
import { ShoppingCart, Zap, Star, Tag, ChevronRight, MapPin, ShieldCheck, RotateCcw } from 'lucide-react';

interface ProductDetailsPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product, onBack, onAddToCart, onBuyNow }) => {
  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');

  // Calculate discount percentage
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleCheckPincode = () => {
    if (pincode.length === 6) {
      setDeliveryMessage(`Delivery by ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`);
    } else {
      setDeliveryMessage('Please enter a valid 6-digit pincode');
    }
  };

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Breadcrumbs / Back */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-slate-500 flex items-center bg-slate-50 border-b border-slate-200">
        <button onClick={onBack} className="hover:text-brand-600 hover:underline mr-2 font-medium">
          Home
        </button>
        <ChevronRight size={14} className="mx-1" />
        <span>{product.category}</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="truncate max-w-[200px] text-slate-800 font-medium">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Image & Action Buttons */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white relative group">
                <div className="aspect-[4/5] flex items-center justify-center p-4">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Heart/Favorite Icon could go here */}
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => onAddToCart(product)}
                  className="flex-1 bg-[#ff9f00] hover:bg-[#f39700] text-white py-4 rounded-sm font-bold text-lg shadow-sm flex items-center justify-center uppercase tracking-wide transition-colors"
                >
                  <ShoppingCart size={20} className="mr-2 fill-white" />
                  Add to Cart
                </button>
                <button 
                  onClick={() => onBuyNow(product)}
                  className="flex-1 bg-[#fb641b] hover:bg-[#e85d19] text-white py-4 rounded-sm font-bold text-lg shadow-sm flex items-center justify-center uppercase tracking-wide transition-colors"
                >
                  <Zap size={20} className="mr-2 fill-white" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Details */}
          <div className="lg:col-span-7">
            
            {/* Title & Rating */}
            <h1 className="text-xl sm:text-2xl font-medium text-slate-900 mb-2 leading-snug">
              {product.name} <span className="text-slate-500 font-normal text-lg">({product.brand})</span>
            </h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold flex items-center">
                {product.rating} <Star size={12} className="ml-1 fill-white" />
              </div>
              <span className="text-slate-500 text-sm font-medium">1,240 Ratings & 156 Reviews</span>
              {product.mindsetTier === ShoppingMindset.Branded && (
                 <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="h-5" />
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-green-600 text-sm font-bold mb-1">Special price</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-slate-500 line-through text-lg">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-green-600 font-bold text-lg">{discount}% off</span>
                  </>
                )}
              </div>
            </div>

            {/* Offers */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Available offers</h3>
              <div className="space-y-2">
                <div className="flex items-start text-sm text-slate-700">
                  <Tag size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><span className="font-bold">Bank Offer</span> 5% Unlimited Cashback on Axis Bank Credit Card</span>
                </div>
                <div className="flex items-start text-sm text-slate-700">
                  <Tag size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><span className="font-bold">Bank Offer</span> 10% Off on SBI Credit Cards, up to ₹1500. On orders of ₹5000 and above</span>
                </div>
                <div className="flex items-start text-sm text-slate-700">
                  <Tag size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><span className="font-bold">Special Price</span> Get extra 20% off (price inclusive of cashback/coupon)</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center py-4 border-t border-slate-100 mb-6">
              <div className="text-slate-500 font-medium w-24">Delivery</div>
              <div className="flex-1">
                 <div className="flex items-center border-b-2 border-brand-500 pb-1 w-full sm:w-64">
                    <MapPin size={18} className="text-brand-600 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Enter Delivery Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g,'').slice(0,6))}
                      className="flex-1 outline-none text-slate-900 font-medium bg-transparent"
                    />
                    <button 
                      onClick={handleCheckPincode}
                      className="text-brand-600 font-bold text-sm hover:text-brand-800"
                    >
                      Check
                    </button>
                 </div>
                 {deliveryMessage && (
                   <div className="text-sm mt-1">
                     {deliveryMessage.includes('Delivery') ? (
                       <span className="text-slate-900 font-semibold">{deliveryMessage}</span>
                     ) : (
                       <span className="text-red-500">{deliveryMessage}</span>
                     )}
                     {deliveryMessage.includes('Delivery') && <span className="text-slate-500 text-xs ml-2">| Free</span>}
                   </div>
                 )}
              </div>
            </div>

            {/* Highlights / Specs */}
            <div className="flex gap-4 py-4 border-t border-slate-100">
               <div className="text-slate-500 font-medium w-24 flex-shrink-0">Highlights</div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700">
                  <li className="list-disc ml-4">Brand: {product.brand}</li>
                  <li className="list-disc ml-4">Category: {product.category}</li>
                  <li className="list-disc ml-4">Ideal For: {product.gender}</li>
                  <li className="list-disc ml-4">Type: {product.mindsetTier} Collection</li>
                  <li className="list-disc ml-4">Quality: Premium Finish</li>
                  <li className="list-disc ml-4">Return Policy: 7 Days</li>
               </div>
            </div>

            {/* Seller Info */}
            <div className="flex gap-4 py-4 border-t border-slate-100 mb-4">
              <div className="text-slate-500 font-medium w-24 flex-shrink-0">Seller</div>
              <div className="text-sm">
                <div className="font-medium text-brand-600">UnifiedRetail Corp</div>
                <div className="flex items-center gap-4 mt-1 text-slate-500">
                  <span className="bg-brand-50 text-brand-700 px-1.5 rounded text-xs font-bold border border-brand-200">4.9 ★</span>
                  <span>7 Days Replacement Policy</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border rounded-lg p-4 bg-slate-50 mt-4">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                Product Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {product.description || "Experience premium quality with this selection. Designed for modern lifestyles, this product combines functionality with aesthetic appeal. Perfect for daily use or special occasions."}
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="flex items-center justify-center p-4 border border-slate-100 rounded-lg text-center">
                 <ShieldCheck className="text-slate-400 mb-2" />
                 <span className="text-xs text-slate-500">1 Year Warranty</span>
               </div>
               <div className="flex items-center justify-center p-4 border border-slate-100 rounded-lg text-center">
                 <RotateCcw className="text-slate-400 mb-2" />
                 <span className="text-xs text-slate-500">7 Day Returns</span>
               </div>
               <div className="flex items-center justify-center p-4 border border-slate-100 rounded-lg text-center">
                 <ShieldCheck className="text-slate-400 mb-2" />
                 <span className="text-xs text-slate-500">GST Invoice Available</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};