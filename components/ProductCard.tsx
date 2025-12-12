import React from 'react';
import { Product, ShoppingMindset } from '../types';
import { ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  userMindset: ShoppingMindset;
  onAddToCart: (product: Product) => void;
  onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, userMindset, onAddToCart, onClick }) => {
  // Logic to determine which badge to show based on user mindset & product type
  let badgeLabel = '';
  let badgeColor = '';

  if (userMindset === ShoppingMindset.Branded && product.mindsetTier === ShoppingMindset.Branded) {
    badgeLabel = 'Premium Pick';
    badgeColor = 'bg-purple-100 text-purple-700 border-purple-200';
  } else if (userMindset === ShoppingMindset.Cheapest && product.mindsetTier === ShoppingMindset.Cheapest) {
    badgeLabel = 'Budget Pick';
    badgeColor = 'bg-green-100 text-green-700 border-green-200';
  } else if (product.mindsetTier === ShoppingMindset.Medium) {
    badgeLabel = 'Best Value';
    badgeColor = 'bg-blue-100 text-blue-700 border-blue-200';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full relative">
      <div 
        className="relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onClick && onClick(product)}
      >
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {badgeLabel && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm ${badgeColor}`}>
            {badgeLabel}
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div 
          className="cursor-pointer"
          onClick={() => onClick && onClick(product)}
        >
          <div className="text-xs text-slate-500 mb-1">{product.brand}</div>
          <h3 className="font-medium text-slate-900 mb-1 leading-tight group-hover:text-brand-600 transition-colors">{product.name}</h3>
          
          {/* Description snippet if available */}
          {product.description && (
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center mb-3 mt-auto">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-slate-600 ml-1">{product.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through ml-2">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-2 bg-slate-900 text-white rounded-full hover:bg-brand-600 transition-colors shadow-lg shadow-slate-900/10 z-10"
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};