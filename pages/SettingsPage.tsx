import React, { useState } from 'react';
import { User, Gender, ShoppingMindset } from '../types';
import { MockApi } from '../services/mockApi';
import { Save } from 'lucide-react';

interface SettingsPageProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser }) => {
  const [gender, setGender] = useState<Gender>(user.gender);
  const [mindset, setMindset] = useState<ShoppingMindset>(user.mindset);
  const [categories, setCategories] = useState<string[]>(user.preferredCategories || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    const res = await MockApi.updateUserPreferences(gender, mindset, categories);
    if (res.success && res.data) {
      onUpdateUser(res.data);
      setMessage('Preferences updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const allCategories = ['Clothes', 'Electronics', 'Groceries'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Personalization Settings</h2>
          <p className="text-sm text-slate-500">Update how we curate your feed.</p>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Gender Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Who are you shopping for?</label>
            <div className="grid grid-cols-2 gap-4">
              {[Gender.Men, Gender.Women].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all
                    ${gender === g 
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500' 
                      : 'border-slate-200 text-slate-600 hover:border-brand-200'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Mindset Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Shopping Mindset</label>
            <div className="space-y-3">
              {[
                { val: ShoppingMindset.Branded, label: 'Branded (Premium)', desc: 'Focus on luxury and top brands' },
                { val: ShoppingMindset.Medium, label: 'Medium (Best Value)', desc: 'Balance of quality and price' },
                { val: ShoppingMindset.Cheapest, label: 'Cheapest (Budget)', desc: 'Lowest price priority' },
              ].map((opt) => (
                <div 
                  key={opt.val}
                  onClick={() => setMindset(opt.val)}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all
                    ${mindset === opt.val 
                      ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' 
                      : 'border-slate-200 hover:border-brand-200'
                    }`}
                >
                  <input 
                    type="radio" 
                    checked={mindset === opt.val} 
                    onChange={() => setMindset(opt.val)}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className={`block text-sm font-medium ${mindset === opt.val ? 'text-brand-900' : 'text-slate-900'}`}>
                      {opt.label}
                    </span>
                    <span className="block text-xs text-slate-500">{opt.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Interested Categories</label>
            <div className="grid grid-cols-3 gap-3">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all
                    ${categories.includes(cat)
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                      : 'border-slate-200 text-slate-600 hover:border-brand-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">{message}</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};