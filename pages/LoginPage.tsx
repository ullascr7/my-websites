import React, { useState } from 'react';
import { AUTH_CREDS } from '../constants';
import { MockApi } from '../services/mockApi';
import { User } from '../types';
import { Lock, Smartphone, ArrowRight, Mail, MapPin, User as UserIcon, Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'customer' | 'developer'>('customer');
  const [step, setStep] = useState<'login' | 'register'>('login');
  
  // Login State
  const [phone, setPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  
  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone) {
      setError('Please enter your phone number');
      setLoading(false);
      return;
    }

    const res = await MockApi.login(phone);
    if (res.success && res.data) {
      onLogin(res.data);
    } else {
      // If user not found, switch to Registration step
      setStep('register');
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!regName || !regEmail || !regAddress) {
      setError('Please fill in all details to continue.');
      setLoading(false);
      return;
    }

    const res = await MockApi.registerCustomer({
      phone,
      name: regName,
      email: regEmail,
      address: regAddress
    });

    if (res.success && res.data) {
      onLogin(res.data);
    } else {
      setError('Registration failed. Try again.');
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (adminEmail === AUTH_CREDS.email && adminPass === AUTH_CREDS.password) {
      const res = await MockApi.login(adminEmail, adminPass);
      if (res.success && res.data) {
        onLogin(res.data);
      } else {
        setError('System error.');
      }
    } else {
      setError('Invalid Developer Credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transition-all">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${mode === 'developer' ? 'bg-slate-900 text-white' : 'bg-brand-100 text-brand-600'}`}>
            {mode === 'developer' ? <Shield size={24} /> : <Smartphone size={24} />}
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Unified Marketplace</h2>
          <p className="text-slate-500 mt-2">
            {mode === 'developer' ? 'Developer Access Portal' : step === 'register' ? 'Complete Profile' : 'Customer Login'}
          </p>
        </div>

        {/* CUSTOMER LOGIN FLOW */}
        {mode === 'customer' && step === 'login' && (
          <form onSubmit={handleCustomerLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="Enter 10-digit number"
                  pattern="[0-9]*"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Continue'}
              {!loading && <ArrowRight size={20} className="ml-2" />}
            </button>
          </form>
        )}

        {/* REGISTRATION FLOW */}
        {mode === 'customer' && step === 'register' && (
          <form onSubmit={handleRegistration} className="space-y-4 animate-fade-in">
             <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
               New number detected! Please provide delivery details.
             </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                <textarea 
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none min-h-[80px]"
                  placeholder="House No, Street, City, Zip Code"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? 'Creating Profile...' : 'Complete & Login'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep('login')}
              className="w-full text-slate-500 text-sm hover:underline"
            >
              Back to Phone Entry
            </button>
          </form>
        )}

        {/* DEVELOPER LOGIN FLOW */}
        {mode === 'developer' && (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center animate-shake">
            {error}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
          <button 
            onClick={() => {
              setMode(mode === 'customer' ? 'developer' : 'customer');
              setStep('login');
              setError('');
            }}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
          >
            {mode === 'customer' ? 'Switch to Developer Login' : 'Switch to Customer Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
