import React, { useEffect, useState } from 'react';
import { Order, ShoppingMindset, Product, Gender } from '../types';
import { MockApi } from '../services/mockApi';
import { ADMIN_NOTICE } from '../constants';
import { Package, Clock, CheckCircle, Plus, LayoutList, Image as ImageIcon, FileText, MapPin, Phone, Mail, XCircle, Trash2, Edit2, RotateCcw, CheckSquare, Link, DownloadCloud } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Inventory Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    brand: '',
    price: 0,
    category: 'Clothes',
    gender: Gender.Unspecified,
    mindsetTier: ShoppingMindset.Medium,
    rating: 5.0,
    description: '',
    imageUrl: 'https://picsum.photos/400/500?random=' + Math.floor(Math.random() * 100)
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Import State
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const refreshData = () => {
    setLoading(true);
    if (activeTab === 'orders') {
      MockApi.getOrders().then(res => {
        if (res.data) setOrders(res.data);
        setLoading(false);
      });
    } else {
      // Fetch all products (ignore filters = true)
      MockApi.getProducts(Gender.Unspecified, ShoppingMindset.Unspecified, undefined, [], true).then(res => {
        if (res.data) {
           setProducts(res.data);
           setSelectedIds(new Set()); // Reset selection on refresh
        }
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  // Reset image error state when URL changes
  useEffect(() => {
    setImagePreviewError(false);
  }, [productForm.imageUrl]);

  const handleApprove = async (orderId: string) => {
    const res = await MockApi.updateOrderStatus(orderId, 'Approved');
    if (res.success) refreshData();
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    setIsImporting(true);
    try {
      const res = await MockApi.fetchProductMetadata(importUrl);
      if (res.success && res.data) {
        setProductForm(prev => ({
          ...prev,
          ...res.data,
          // Reset price to 0 so user is forced to enter their own price, or keep fetched price if they want
          price: res.data.price || 0 
        }));
        setSuccessMsg("Data imported! Please review price and details below.");
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert("Could not import data. Please check the URL.");
      }
    } catch (error) {
      alert("Import failed.");
    }
    setIsImporting(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (!productForm.name || !productForm.price) {
      alert("Please fill in name and price");
      setIsProcessing(false);
      return;
    }

    let res;
    if (editingId) {
       // Update existing
       res = await MockApi.updateProduct({ ...productForm, id: editingId } as Product);
       setSuccessMsg(`Updated "${productForm.name}" successfully!`);
    } else {
       // Add new
       res = await MockApi.addProduct(productForm as Product);
       setSuccessMsg(`Added "${productForm.name}" to store!`);
    }

    if (res.success) {
      // Reset form
      setEditingId(null);
      setProductForm({
        name: '',
        brand: '',
        price: 0,
        category: 'Clothes',
        gender: Gender.Unspecified,
        mindsetTier: ShoppingMindset.Medium,
        rating: 5.0,
        description: '',
        imageUrl: 'https://picsum.photos/400/500?random=' + Math.floor(Math.random() * 100)
      });
      setImportUrl(''); // Clear import url
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert("Error saving product: " + res.error);
    }
    setIsProcessing(false);
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setProductForm(p);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProductForm({
      name: '',
      brand: '',
      price: 0,
      category: 'Clothes',
      gender: Gender.Unspecified,
      mindsetTier: ShoppingMindset.Medium,
      rating: 5.0,
      description: '',
      imageUrl: 'https://picsum.photos/400/500?random=' + Math.floor(Math.random() * 100)
    });
  };

  // Bulk Selection Logic
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length && products.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };
  
  // Individual Delete
  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setIsProcessing(true);
      const previousProducts = [...products];
      setProducts(prev => prev.filter(p => p.id !== id));

      try {
        const res = await MockApi.deleteProduct(id);
        if (res.success) {
          setSuccessMsg("Product deleted.");
          if (editingId === id) handleCancelEdit();
          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          setProducts(previousProducts);
          alert("Could not delete product: " + res.error);
        }
      } catch (err) {
        setProducts(previousProducts);
        alert("An error occurred.");
      }
      setIsProcessing(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected items? This cannot be undone.`)) {
      setIsProcessing(true);
      
      // Optimistic Update
      const previousProducts = [...products];
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      
      try {
        const idsToDelete = Array.from(selectedIds);
        const res = await MockApi.deleteProducts(idsToDelete);
        
        if (res.success) {
          setSuccessMsg(`${idsToDelete.length} items deleted successfully.`);
          setSelectedIds(new Set()); // Clear selection
          if (editingId && idsToDelete.includes(editingId)) {
            handleCancelEdit();
          }
          
          // Re-fetch to sync
          MockApi.getProducts(Gender.Unspecified, ShoppingMindset.Unspecified, undefined, [], true)
            .then(res => { if(res.data) setProducts(res.data); });
            
          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          // Revert
          setProducts(previousProducts);
          alert("Failed to delete items: " + res.error);
        }
      } catch (err) {
        setProducts(previousProducts);
        alert("An error occurred during deletion.");
        console.error(err);
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            Admin Dashboard
            <span className="ml-3 px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded-full border border-brand-200">Developer Access</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage store operations and inventory.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Clock size={16} className="mr-2" />
            Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${activeTab === 'inventory' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <LayoutList size={16} className="mr-2" />
            Inventory
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'orders' ? (
        <>
          <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg text-sm border border-yellow-200 shadow-sm mb-6 flex items-start">
            <CheckCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <span><strong className="font-semibold">System Notice:</strong> {ADMIN_NOTICE}</span>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order / Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mindset Snapshot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{order.id}</div>
                        <div className="text-xs text-slate-400 mb-2">{new Date(order.date).toLocaleDateString()}</div>
                        
                        {/* Customer Details */}
                        <div className="text-xs space-y-1 bg-slate-50 p-2 rounded border border-slate-100">
                           <div className="font-semibold text-slate-700">{order.customerDetails?.name || 'Guest'}</div>
                           <div className="flex items-center text-slate-500"><Phone size={10} className="mr-1"/> {order.customerDetails?.phone}</div>
                           <div className="flex items-center text-slate-500"><Mail size={10} className="mr-1"/> {order.customerDetails?.email}</div>
                           <div className="flex items-start text-slate-500"><MapPin size={10} className="mr-1 mt-0.5 flex-shrink-0"/> {order.customerDetails?.address}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 w-fit">
                            {order.userGenderSnapshot}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit
                            ${order.userMindsetSnapshot === ShoppingMindset.Branded ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                              order.userMindsetSnapshot === ShoppingMindset.Cheapest ? 'bg-green-100 text-green-800 border-green-200' : 
                              'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {order.userMindsetSnapshot}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span className="font-medium">{order.items.length} unique items</span>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm px-2 py-1 rounded w-fit border
                          ${order.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                          {order.status === 'Approved' && <CheckCircle size={14} className="mr-1" />}
                          {order.status === 'Cancelled' && <XCircle size={14} className="mr-1" />}
                          {order.status === 'Pending' && <Clock size={14} className="mr-1" />}
                          {order.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {order.status === 'Pending' ? (
                          <button 
                            type="button"
                            onClick={() => handleApprove(order.id)}
                            className="text-brand-600 hover:text-brand-900 font-semibold hover:underline"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">No Actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                        <Package size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium text-slate-500">No orders to review</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* INVENTORY TAB */
        <div className="space-y-8">
          <div className="max-w-2xl mx-auto">
            <div className={`bg-white p-6 rounded-xl border shadow-sm transition-colors ${editingId ? 'border-brand-300 ring-2 ring-brand-100' : 'border-slate-200'}`}>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold flex items-center ${editingId ? 'text-brand-700' : 'text-slate-900'}`}>
                   {editingId ? <Edit2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2 text-brand-600" />}
                   {editingId ? 'Edit Product Details' : 'Add New Product'}
                </h2>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-800 flex items-center">
                    <RotateCcw size={14} className="mr-1"/> Cancel Edit
                  </button>
                )}
              </div>
              
              {/* Quick Import Section */}
              {!editingId && (
                 <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                   <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                     <DownloadCloud size={16} className="mr-2 text-brand-600"/> 
                     Quick Import (Dropshipping)
                   </h3>
                   <form onSubmit={handleImport} className="flex gap-2">
                     <div className="relative flex-grow">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                          type="url" 
                          placeholder="Paste Flipkart or Amazon product link..." 
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                        />
                     </div>
                     <button 
                       type="submit" 
                       disabled={isImporting || !importUrl}
                       className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                     >
                       {isImporting ? 'Fetching...' : 'Import'}
                     </button>
                   </form>
                   <p className="text-xs text-slate-400 mt-2">
                     Automatically fetches title, description, and placeholder image. You can edit the price below.
                   </p>
                 </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={productForm.name}
                      onChange={e => setProductForm({...productForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="e.g. Vintage Denim Jacket"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                    <input 
                      type="text" 
                      value={productForm.brand}
                      onChange={e => setProductForm({...productForm, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="e.g. Levi's"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                    <textarea 
                      value={productForm.description}
                      onChange={e => setProductForm({...productForm, description: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]"
                      placeholder="Enter details about the product..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      value={productForm.category}
                      onChange={e => setProductForm({...productForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    >
                      <option value="Clothes">Clothes</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Groceries">Groceries</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={productForm.price}
                      onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="e.g. 1500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender Target</label>
                    <select 
                      value={productForm.gender}
                      onChange={e => setProductForm({...productForm, gender: e.target.value as Gender})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    >
                      <option value={Gender.Unspecified}>Unisex / Any</option>
                      <option value={Gender.Men}>Men</option>
                      <option value={Gender.Women}>Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mindset Tier</label>
                    <select 
                      value={productForm.mindsetTier}
                      onChange={e => setProductForm({...productForm, mindsetTier: e.target.value as ShoppingMindset})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    >
                      <option value={ShoppingMindset.Medium}>Medium (Standard)</option>
                      <option value={ShoppingMindset.Branded}>Branded (Premium)</option>
                      <option value={ShoppingMindset.Cheapest}>Cheapest (Budget)</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                   <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={productForm.imageUrl}
                        onChange={e => setProductForm({...productForm, imageUrl: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="https://..."
                      />
                   </div>
                   {productForm.imageUrl && !imagePreviewError && (
                     <div className="mt-3">
                       <p className="text-xs text-slate-500 mb-1 font-medium">Preview:</p>
                       <div className="h-48 w-full sm:w-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm relative">
                         <img 
                           src={productForm.imageUrl} 
                           alt="Preview" 
                           className="w-full h-full object-cover" 
                           onError={() => setImagePreviewError(true)}
                         />
                       </div>
                     </div>
                   )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className={`w-full py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70
                      ${editingId ? 'bg-brand-700 hover:bg-brand-800' : 'bg-brand-600 hover:bg-brand-700'}`}
                  >
                    {isProcessing ? 'Processing...' : (editingId ? 'Update Product Details' : 'Add Product to Store')}
                  </button>
                  {successMsg && (
                     <div className="mt-3 p-3 bg-green-50 text-green-700 text-sm text-center rounded-lg font-medium animate-fade-in">
                       {successMsg}
                     </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Product List Table */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <h3 className="font-semibold text-slate-900 flex items-center">
                 Current Inventory ({products.length})
               </h3>
               
               {/* Bulk Actions Toolbar */}
               {selectedIds.size > 0 && (
                 <div className="flex items-center space-x-3 bg-white border border-brand-200 px-3 py-1.5 rounded-lg shadow-sm animate-fade-in">
                   <span className="text-sm font-medium text-brand-700">{selectedIds.size} Selected</span>
                   <div className="h-4 w-px bg-slate-200"></div>
                   <button 
                     type="button"
                     onClick={handleBulkDelete}
                     disabled={isProcessing}
                     className="flex items-center text-sm font-semibold text-red-600 hover:text-red-800 transition-colors"
                   >
                     <Trash2 size={16} className="mr-1.5" />
                     Delete Selected
                   </button>
                 </div>
               )}
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-white">
                   <tr>
                     <th className="px-6 py-3 w-10">
                       <div className="flex items-center justify-center">
                         <input 
                           type="checkbox"
                           className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                           checked={products.length > 0 && selectedIds.size === products.length}
                           onChange={toggleSelectAll}
                         />
                       </div>
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product Info</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Targeting</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-slate-200">
                   {products.map((p) => {
                     const isSelected = selectedIds.has(p.id);
                     return (
                       <tr 
                         key={p.id} 
                         className={`transition-colors ${isSelected ? 'bg-brand-50/50' : ''} ${editingId === p.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'hover:bg-slate-50'}`}
                       >
                         <td className="px-6 py-4 cursor-pointer" onClick={() => toggleSelect(p.id)}>
                           <div className="flex items-center justify-center">
                             <input 
                               type="checkbox"
                               className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer pointer-events-none"
                               checked={isSelected}
                               readOnly
                             />
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center">
                             <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                               <img src={p.imageUrl} alt="" className="h-full w-full object-cover"/>
                             </div>
                             <div className="ml-4">
                               <div className="text-sm font-medium text-slate-900">{p.name}</div>
                               <div className="text-xs text-slate-500">{p.brand}</div>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                           {p.category}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                           ₹{p.price.toLocaleString('en-IN')}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                               <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 w-fit">{p.gender}</span>
                               <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 w-fit">{p.mindsetTier}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                           <button 
                             type="button"
                             onClick={() => handleEditClick(p)}
                             disabled={isProcessing}
                             className="text-brand-600 hover:text-brand-900 p-1 hover:bg-brand-50 rounded"
                             title="Edit"
                           >
                             <Edit2 size={16} />
                           </button>
                           <button 
                             type="button"
                             onClick={() => handleDeleteClick(p.id)}
                             disabled={isProcessing}
                             className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                             title="Delete"
                           >
                             <Trash2 size={16} />
                           </button>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};