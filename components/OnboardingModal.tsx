import React, { useState } from 'react';
import { Gender, ShoppingMindset } from '../types';
import { User as UserIcon, CheckCircle, TrendingUp, DollarSign, Tag, ShoppingBag, Smartphone, Shirt, X } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (gender: Gender, mindset: ShoppingMindset, categories: string[]) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [gender, setGender] = useState<Gender | null>(null);
  const [mindset, setMindset] = useState<ShoppingMindset | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleNext = () => {
    if (step === 1 && gender) {
      setStep(2);
    } else if (step === 2 && mindset) {
      setStep(3);
    } else if (step === 3 && categories.length > 0) {
      if (gender && mindset) onComplete(gender, mindset, categories);
    }
  };

  const handleSkip = () => {
    // Apply safe defaults: Unspecified gender, Medium mindset, no specific category filters
    onComplete(Gender.Unspecified, ShoppingMindset.Medium, []);
  };

  const OptionCard = ({ 
    selected, 
    onClick, 
    icon: Icon, 
    title, 
    desc 
  }: { 
    selected: boolean, 
    onClick: () => void, 
    icon: any, 
    title: string, 
    desc: string 
  }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 mb-3 border rounded-xl text-left transition-all duration-200 flex items-center group
        ${selected 
          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-500 shadow-md' 
          : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
        }`}
    >
      <div className={`p-3 rounded-full mr-4 ${selected ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className={`font-semibold ${selected ? 'text-brand-900' : 'text-slate-800'}`}>{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      {selected && <CheckCircle className="ml-auto text-brand-600" size={20} />}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up relative">
        
        {/* Skip Button (Top Right) */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
          title="Skip Personalization"
        >
          <X size={20} />
        </button>

        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 w-full">
          <div 
            className="h-full bg-brand-500 transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>

        <div className="p-8">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Who are you shopping for?</h2>
                <p className="text-slate-500">We'll customize your size guides and recommendations.</p>
              </div>
              <div className="space-y-4">
                <OptionCard 
                  selected={gender === Gender.Men}
                  onClick={() => setGender(Gender.Men)}
                  icon={UserIcon}
                  title="Men"
                  desc="Apparel, accessories, and gear for men."
                />
                <OptionCard 
                  selected={gender === Gender.Women}
                  onClick={() => setGender(Gender.Women)}
                  icon={UserIcon}
                  title="Women"
                  desc="Fashion, beauty, and styles for women."
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">What's your shopping mindset?</h2>
                <p className="text-slate-500">We'll prioritize products that match your goals.</p>
              </div>
              <div className="space-y-3">
                <OptionCard 
                  selected={mindset === ShoppingMindset.Branded}
                  onClick={() => setMindset(ShoppingMindset.Branded)}
                  icon={TrendingUp}
                  title="Branded & Premium"
                  desc="I want top quality and famous labels."
                />
                <OptionCard 
                  selected={mindset === ShoppingMindset.Medium}
                  onClick={() => setMindset(ShoppingMindset.Medium)}
                  icon={Tag}
                  title="Best Value (Medium)"
                  desc="I want a balance of quality and price."
                />
                <OptionCard 
                  selected={mindset === ShoppingMindset.Cheapest}
                  onClick={() => setMindset(ShoppingMindset.Cheapest)}
                  icon={DollarSign}
                  title="Budget Conscious"
                  desc="I'm looking for the lowest prices."
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">What interests you?</h2>
                <p className="text-slate-500">Select all that apply to personalize your menu.</p>
              </div>
              <div className="space-y-3">
                <OptionCard 
                  selected={categories.includes('Clothes')}
                  onClick={() => toggleCategory('Clothes')}
                  icon={Shirt}
                  title="Clothes"
                  desc="Trendy apparel and accessories."
                />
                <OptionCard 
                  selected={categories.includes('Electronics')}
                  onClick={() => toggleCategory('Electronics')}
                  icon={Smartphone}
                  title="Electronics"
                  desc="Gadgets, devices, and tech gear."
                />
                <OptionCard 
                  selected={categories.includes('Groceries')}
                  onClick={() => toggleCategory('Groceries')}
                  icon={ShoppingBag}
                  title="Groceries"
                  desc="Daily essentials and fresh food."
                />
              </div>
            </>
          )}

          <div className="mt-8">
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !gender) || 
                (step === 2 && !mindset) || 
                (step === 3 && categories.length === 0)
              }
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                ${((step === 1 && !gender) || (step === 2 && !mindset) || (step === 3 && categories.length === 0))
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30'
                }`}
            >
              {step === 3 ? 'Personalize My Feed' : 'Continue'}
            </button>
            
            <div className="mt-4 flex flex-col items-center gap-2">
               <button 
                onClick={handleSkip} 
                className="text-slate-500 text-sm hover:text-slate-800 hover:underline"
               >
                 Skip personalization
               </button>
               <p className="text-xs text-center text-slate-400">
                You can change these preferences anytime in Settings.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};