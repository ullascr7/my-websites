import React from 'react';
import { ShoppingBag, Settings, LogOut, LayoutDashboard, ShieldCheck, Package, ShoppingCart } from 'lucide-react';
import { User, CartItem } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  setView: (view: 'market' | 'settings' | 'admin' | 'orders' | 'cart') => void;
  currentView: string;
  cartItemCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, setView, currentView, cartItemCount }) => {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => setView('market')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-lg flex items-center justify-center text-white mr-2 shadow-sm group-hover:shadow-md transition-all">
              <ShoppingBag size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">Unified<span className="text-brand-600">Market</span></span>
              {user.isAdmin && (
                <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Developer Mode</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user.isAdmin && (
              <button 
                onClick={() => setView('admin')}
                className={`flex items-center px-3 py-2 rounded-lg transition-all border
                  ${currentView === 'admin' 
                    ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' 
                    : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'}`}
                title="Admin Dashboard"
              >
                <LayoutDashboard size={18} className="mr-2" />
                <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
              </button>
            )}
            
            {!user.isAdmin && (
              <>
                <button
                  onClick={() => setView('orders')}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all border
                    ${currentView === 'orders' 
                      ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' 
                      : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'}`}
                  title="My Orders"
                >
                  <Package size={18} className="mr-2" />
                  <span className="text-sm font-medium hidden sm:inline">My Orders</span>
                </button>
                
                <button
                  onClick={() => setView('cart')}
                  className={`relative flex items-center px-3 py-2 rounded-lg transition-all border
                    ${currentView === 'cart' 
                      ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' 
                      : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'}`}
                  title="Cart"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  <span className="text-sm font-medium hidden sm:inline">Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </>
            )}
            
            <button 
              onClick={() => setView('settings')}
              className={`p-2 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1">
                   {user.isAdmin && <ShieldCheck size={12} className="text-brand-600" />}
                   <div className="text-sm font-medium text-slate-900">{user.name}</div>
                </div>
                <div className="text-xs text-slate-500 capitalize">{user.mindset} Mindset</div>
              </div>
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};