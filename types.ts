
export enum Gender {
  Men = 'Men',
  Women = 'Women',
  Unspecified = 'Unspecified'
}

export enum ShoppingMindset {
  Branded = 'Branded',
  Medium = 'Medium',
  Cheapest = 'Cheapest',
  Unspecified = 'Unspecified'
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  address?: string;
  name: string;
  gender: Gender;
  mindset: ShoppingMindset;
  onboardingCompleted: boolean;
  isAdmin: boolean;
  preferredCategories: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  gender: Gender | 'Unisex';
  mindsetTier: ShoppingMindset;
  category: string;
  imageUrl: string;
  rating: number;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  userGenderSnapshot: Gender;
  userMindsetSnapshot: ShoppingMindset;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Cancelled';
  date: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}