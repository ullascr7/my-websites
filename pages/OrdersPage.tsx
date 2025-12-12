import React, { useEffect, useState } from 'react';
import { User, Order, Product } from '../types';
import { MockApi } from '../services/mockApi';
import { Package, Clock, XCircle, CheckCircle, MapPin, ArrowRight } from 'lucide-react';

interface OrdersPageProps {
  user: User;
  onNavigateHome: () => void;
  onProductClick: (product: Product) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ user, onNavigateHome, onProductClick }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await MockApi.getOrders(user.id);
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  const handleCancelOrder = async (orderId: string) => {
    // Removed window.confirm to make cancellation automatic/immediate upon click
    const res = await MockApi.updateOrderStatus(orderId, 'Cancelled');
    if (res.success) {
      fetchOrders();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
           <p className="text-slate-500">Track and manage your recent purchases.</p>
        </div>
        <button 
          onClick={onNavigateHome}
          className="text-brand-600 font-medium hover:underline flex items-center"
        >
          Continue Shopping <ArrowRight size={16} className="ml-1"/>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No orders yet</h3>
          <p className="text-slate-500 mb-6">Looks like you haven't bought anything yet.</p>
          <button 
            onClick={onNavigateHome}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
             <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               {/* Order Header */}
               <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order Placed</div>
                    <div className="text-slate-900 font-medium">{new Date(order.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Amount</div>
                    <div className="text-slate-900 font-bold">₹{order.total.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order ID</div>
                    <div className="text-slate-500 font-mono text-sm">#{order.id.split('_')[1]}</div>
                  </div>
                  <div className="sm:ml-auto">
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border
                      ${order.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                      {order.status === 'Approved' && <CheckCircle size={14} className="mr-1.5" />}
                      {order.status === 'Cancelled' && <XCircle size={14} className="mr-1.5" />}
                      {order.status === 'Pending' && <Clock size={14} className="mr-1.5" />}
                      {order.status}
                    </div>
                  </div>
               </div>
               
               {/* Order Body */}
               <div className="p-6">
                 <div className="flex flex-col md:flex-row gap-6">
                   {/* Items */}
                   <div className="flex-grow space-y-4">
                     {order.items.map((item, idx) => (
                       <div key={idx} className="flex items-start group cursor-pointer" onClick={() => onProductClick(item)}>
                         <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 group-hover:border-brand-400 transition-colors relative">
                           <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover object-center" />
                           {item.quantity > 1 && (
                             <span className="absolute bottom-0 right-0 bg-slate-900 text-white text-xs px-1.5 py-0.5 font-bold rounded-tl-md">
                               x{item.quantity}
                             </span>
                           )}
                         </div>
                         <div className="ml-4 flex-1">
                           <h4 className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">{item.name}</h4>
                           <p className="text-sm text-slate-500">{item.brand}</p>
                           <div className="flex justify-between items-center mt-1">
                              <p className="text-sm font-medium text-slate-900">₹{item.price.toLocaleString('en-IN')}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   {/* Actions & Details */}
                   <div className="md:w-64 flex-shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2 flex items-center">
                          <MapPin size={14} className="mr-1 text-slate-400"/> Shipping To
                        </h5>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {order.customerDetails?.address || 'Address not available'}
                        </p>
                      </div>
                      
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      
                      {order.status === 'Approved' && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100">
                          Estimated Delivery: 3-5 Business Days
                        </div>
                      )}
                   </div>
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};