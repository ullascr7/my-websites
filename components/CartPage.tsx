import React from 'react';
import { CartItem } from '../types';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: () => void;
  onContinueShopping: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ 
  cart, 
  onUpdateQuantity, 
  onRemove, 
  onPlaceOrder,
  onContinueShopping 
}) => {
  
  const totalMRP = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
  const totalSellingPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = totalMRP - totalSellingPrice;
  const deliveryFee = totalSellingPrice > 1000 ? 0 : 99;
  const finalAmount = totalSellingPrice + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={80} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={onContinueShopping}
          className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Cart Items */}
        <div className="lg:w-2/3">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                 <h2 className="text-lg font-semibold text-slate-800">Shopping Cart ({cart.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 flex gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 border border-slate-100 rounded-lg overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base sm:text-lg font-medium text-slate-900">{item.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{item.brand} • {item.category}</p>
                          <div className="mt-2 flex items-baseline gap-2">
                             <span className="text-lg font-bold text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                             {item.originalPrice && (
                               <>
                                 <span className="text-sm text-slate-400 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                                 <span className="text-sm font-bold text-green-600">
                                   {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% Off
                                 </span>
                               </>
                             )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-6">
                         {/* Quantity Controls */}
                         <div className="flex items-center gap-4">
                           <button 
                             onClick={() => onUpdateQuantity(item.id, -1)}
                             className="w-10 h-10 rounded-full border border-slate-400 flex items-center justify-center text-slate-900 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                             disabled={item.quantity <= 1}
                             title="Decrease Quantity"
                           >
                             <Minus size={18} />
                           </button>
                           
                           <span className="w-8 text-center font-bold text-lg text-slate-900">{item.quantity}</span>
                           
                           <button 
                             onClick={() => onUpdateQuantity(item.id, 1)}
                             className="w-10 h-10 rounded-full border border-slate-400 flex items-center justify-center text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                             title="Increase Quantity"
                           >
                             <Plus size={18} />
                           </button>
                         </div>

                         <button 
                           onClick={() => onRemove(item.id)}
                           className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-wide flex items-center ml-auto sm:ml-0"
                         >
                           <Trash2 size={18} className="mr-1.5" /> Remove
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 text-slate-600">
             <ShieldCheck className="text-brand-600" />
             <span className="text-sm font-medium">Safe and Secure Payments. 100% Authentic Products.</span>
           </div>
        </div>

        {/* Right Side: Price Details */}
        <div className="lg:w-1/3">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
             <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-500 uppercase tracking-wide text-sm">Price Details</h3>
             </div>
             <div className="p-6 space-y-4">
               <div className="flex justify-between text-slate-700">
                 <span>Price ({cart.length} items)</span>
                 <span>₹{totalMRP.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between text-green-600">
                 <span>Discount</span>
                 <span>- ₹{discount.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between text-slate-700">
                 <span>Delivery Charges</span>
                 <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                   {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                 </span>
               </div>
               
               <div className="pt-4 border-t border-dashed border-slate-300">
                 <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Amount</span>
                    <span className="text-lg font-bold text-slate-900">₹{finalAmount.toLocaleString('en-IN')}</span>
                 </div>
               </div>
             </div>

             <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={onPlaceOrder}
                  className="w-full bg-[#fb641b] hover:bg-[#e85d19] text-white text-lg font-bold py-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center"
                >
                  Place Order <ArrowRight size={20} className="ml-2" />
                </button>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};