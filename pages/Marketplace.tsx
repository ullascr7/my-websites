import React, { useEffect, useState } from 'react';
import { User, Product, ShoppingMindset } from '../types';
import { MockApi } from '../services/mockApi';
import { ProductCard } from '../components/ProductCard';
import { Sliders, Search, Shirt, Smartphone, ShoppingBasket, Eye, EyeOff } from 'lucide-react';

interface MarketplaceProps {
  user: User;
  onNavigateToOrders: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ user, onNavigateToOrders, onProductClick, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [devViewAll, setDevViewAll] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const res = await MockApi.getProducts(
        user.gender, 
        user.mindset, 
        selectedCategory,
        user.preferredCategories,
        devViewAll
      );
      if (res.success && res.data) {
        setProducts(res.data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [user.gender, user.mindset, selectedCategory, user.preferredCategories, devViewAll]);

  const categories = [
    { id: 'Clothes', label: 'Clothes', icon: Shirt, color: 'bg-rose-100 text-rose-600 border-rose-200' },
    { id: 'Electronics', label: 'Electronics', icon: Smartphone, color: 'bg-sky-100 text-sky-600 border-sky-200' },
    { id: 'Groceries', label: 'Groceries', icon: ShoppingBasket, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Category Selection Hero */}
      <div className="mb-8 relative">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-slate-900">What are you shopping for today?</h2>
          
          {/* Developer Toggle */}
          {user.isAdmin && (
            <button
              onClick={() => setDevViewAll(!devViewAll)}
              className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                ${devViewAll 
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              {devViewAll ? <Eye size={14} className="mr-1.5" /> : <EyeOff size={14} className="mr-1.5" />}
              {devViewAll ? 'Dev Mode: Showing All' : 'Dev Mode: Personalized'}
            </button>
          )}
        </div>

        <div className={`grid grid-cols-3 gap-4 transition-opacity duration-300 ${devViewAll ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isActive ? 'All' : cat.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300
                  ${isActive 
                    ? `${cat.color} ring-2 ring-offset-2 ring-brand-500 shadow-md transform scale-[1.02]` 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-brand-200 hover:shadow-sm'
                  }`}
              >
                <div className={`p-3 rounded-full mb-3 ${isActive ? 'bg-white/50' : 'bg-slate-100'}`}>
                  <Icon size={32} />
                </div>
                <span className={`font-semibold ${isActive ? 'text-inherit' : 'text-slate-700'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3 border border-white/10">
            {devViewAll ? 'Developer View' : `${user.mindset} Edition`}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {devViewAll 
              ? 'All Products (Raw Feed)' 
              : (selectedCategory === 'All' ? 'Curated Picks' : `Top ${selectedCategory}`) + ` for ${user.gender === 'Unspecified' ? 'You' : user.gender}`
            }
          </h1>
          <p className="text-slate-300">
            {devViewAll 
              ? 'Ignoring gender, mindset, and category filters. Newest items first.'
              : `Showing ${selectedCategory === 'All' ? ' your personalized feed' : ` ${selectedCategory.toLowerCase()}`} prioritizing ${user.mindset} options.`
            }
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Sliders size={16} />
          <span>Filters: {devViewAll ? 'Disabled' : `${selectedCategory === 'All' ? 'Personalized' : selectedCategory} + ${user.mindset}`}</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-slate-200 rounded-xl h-96"></div>
          ))}
        </div>
      ) : (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  userMindset={user.mindset}
                  onAddToCart={onAddToCart}
                  onClick={onProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">No products found for your preferences.</p>
              <button onClick={() => setSelectedCategory('All')} className="mt-4 text-brand-600 font-medium hover:underline">
                View All Categories
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};