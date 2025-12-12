import React, { useState, useEffect } from 'react';
import { User, Gender, ShoppingMindset, Product, CartItem } from './types';
import { MockApi } from './services/mockApi';
import { LoginPage } from './pages/LoginPage';
import { Marketplace } from './pages/Marketplace';
import { SettingsPage } from './pages/SettingsPage';
import { OrdersPage } from './pages/OrdersPage'; 
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AIAssistant } from './components/AIAssistant';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CartPage } from './components/CartPage';
import { CheckCircle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'market' | 'settings' | 'admin' | 'orders' | 'details' | 'cart'>('market');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('um_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedCart = localStorage.getItem('um_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    setLoading(false);
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('um_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogin = (u: User) => {
    setUser(u);
    setView('market');
  };

  const handleLogout = () => {
    MockApi.logout();
    setUser(null);
    setView('market');
    setSelectedProduct(null);
    setCart([]);
  };

  const handleOnboardingComplete = async (gender: Gender, mindset: ShoppingMindset, categories: string[]) => {
    if (!user) return;
    const res = await MockApi.updateUserPreferences(gender, mindset, categories);
    if (res.success && res.data) {
      setUser(res.data);
    }
  };
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // --- Cart Handlers ---

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Optional: Show toast here
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleBuyNow = (product: Product) => {
    // Check if in cart, if not add it, then go to cart
    const existing = cart.find(item => item.id === product.id);
    if (!existing) {
       handleAddToCart(product);
    }
    setView('cart');
  };

  const handlePlaceOrder = async () => {
    if (!user?.address && !user?.isAdmin) {
       alert("Please update your shipping address in settings before ordering.");
       setView('settings');
       return;
    }
    
    if (cart.length === 0) return;

    const res = await MockApi.createOrder(user!, cart);
    if (res.success) {
      setCart([]); // Clear cart
      setOrderSuccess(true); // Show success modal
    } else {
      alert("Order failed. Please try again.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        setView={(v) => {
            setView(v as any);
            setSelectedProduct(null);
        }} 
        currentView={view}
        cartItemCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />
      
      <main className="animate-fade-in">
        {view === 'market' && (
          <Marketplace 
            user={user} 
            onNavigateToOrders={() => setView('orders')} 
            onProductClick={handleProductClick}
            // Temporarily mapping old prop to new handler (Marketplace has internal buying logic to replace)
            // Ideally Marketplace should use handleAddToCart directly
            onAddToCart={handleAddToCart} 
          />
        )}
        {view === 'settings' && <SettingsPage user={user} onUpdateUser={setUser} />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'orders' && (
          <OrdersPage 
            user={user} 
            onNavigateHome={() => setView('market')} 
            onProductClick={handleProductClick}
          />
        )}
        {view === 'details' && selectedProduct && (
          <ProductDetailsPage 
            product={selectedProduct}
            onBack={() => setView('market')}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}
        {view === 'cart' && (
          <CartPage 
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={handleRemoveFromCart}
            onPlaceOrder={handlePlaceOrder}
            onContinueShopping={() => setView('market')}
          />
        )}
      </main>

      {/* Onboarding Logic */}
      {user && !user.onboardingCompleted && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Success Modal (Global) */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
               <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">Order Placed!</h3>
            <p className="text-center text-slate-500 mb-6">
              Your order is pending approval. Track status in My Orders.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => { setOrderSuccess(false); setView('orders'); }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center"
              >
                Go to My Orders <ArrowRight size={18} className="ml-2" />
              </button>
              <button 
                onClick={() => { setOrderSuccess(false); setView('market'); }}
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Widget */}
      <AIAssistant />
    </div>
  );
};

export default App;