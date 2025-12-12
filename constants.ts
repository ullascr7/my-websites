import { Product, Gender, ShoppingMindset } from './types';

export const MOCK_PRODUCTS: Product[] = [
  // Branded Items
  {
    id: 'p1',
    name: 'Luxury Wool Blazer',
    brand: 'Armani',
    price: 18999,
    originalPrice: 24000,
    gender: Gender.Men,
    mindsetTier: ShoppingMindset.Branded,
    category: 'Clothes',
    imageUrl: 'https://picsum.photos/400/500?random=1',
    rating: 4.9,
    description: 'A premium wool blend blazer featuring a tailored fit, notch lapels, and a silk lining. Perfect for formal occasions and business meetings.'
  },
  {
    id: 'p2',
    name: 'Designer Handbag',
    brand: 'Gucci',
    price: 85000,
    gender: Gender.Women,
    mindsetTier: ShoppingMindset.Branded,
    category: 'Accessories',
    imageUrl: 'https://picsum.photos/400/500?random=2',
    rating: 5.0,
    description: 'Iconic leather handbag with signature hardware. Features a spacious interior compartment and detachable shoulder strap.'
  },
  {
    id: 'p3',
    name: 'Pro Noise-Cancelling Headphones',
    brand: 'Bose',
    price: 24990,
    gender: Gender.Unspecified, // Unisex
    mindsetTier: ShoppingMindset.Branded,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/500?random=3',
    rating: 4.8,
    description: 'Industry-leading noise cancellation technology with 24-hour battery life and immersive audio quality.'
  },
  
  // Medium Items
  {
    id: 'p4',
    name: 'Everyday Chino Pants',
    brand: 'Uniqlo',
    price: 2499,
    gender: Gender.Men,
    mindsetTier: ShoppingMindset.Medium,
    category: 'Clothes',
    imageUrl: 'https://picsum.photos/400/500?random=4',
    rating: 4.5,
    description: 'Comfortable stretch cotton chinos designed for everyday wear. Wrinkle-resistant fabric keeps you looking sharp all day.'
  },
  {
    id: 'p5',
    name: 'Floral Summer Dress',
    brand: 'H&M Premium',
    price: 3299,
    gender: Gender.Women,
    mindsetTier: ShoppingMindset.Medium,
    category: 'Clothes',
    imageUrl: 'https://picsum.photos/400/500?random=5',
    rating: 4.3,
    description: 'Lightweight floral print dress made from sustainable viscose. Features a V-neck and flutter sleeves.'
  },
  {
    id: 'p6',
    name: 'Bluetooth Speaker',
    brand: 'JBL',
    price: 5999,
    gender: Gender.Unspecified,
    mindsetTier: ShoppingMindset.Medium,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/500?random=6',
    rating: 4.6,
    description: 'Portable waterproof speaker with powerful bass and up to 12 hours of playtime. Ideal for outdoor parties.'
  },

  // Budget Items
  {
    id: 'p7',
    name: 'Basic White Tee 3-Pack',
    brand: 'Generic',
    price: 799,
    gender: Gender.Men,
    mindsetTier: ShoppingMindset.Cheapest,
    category: 'Clothes',
    imageUrl: 'https://picsum.photos/400/500?random=7',
    rating: 4.0,
    description: 'Soft combed cotton t-shirts in a convenient 3-pack. Breathable fabric suitable for layering or casual wear.'
  },
  {
    id: 'p8',
    name: 'Canvas Tote Bag',
    brand: 'NoBrand',
    price: 299,
    gender: Gender.Women,
    mindsetTier: ShoppingMindset.Cheapest,
    category: 'Accessories',
    imageUrl: 'https://picsum.photos/400/500?random=8',
    rating: 3.9,
    description: 'Eco-friendly canvas tote bag with reinforced stitching. Spacious enough for grocery shopping or carrying books.'
  },
  {
    id: 'p9',
    name: 'Wired Earbuds',
    brand: 'BasicTech',
    price: 399,
    gender: Gender.Unspecified,
    mindsetTier: ShoppingMindset.Cheapest,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/500?random=9',
    rating: 4.1,
    description: 'Simple and reliable wired earphones with a built-in microphone. Compatible with standard 3.5mm audio jacks.'
  },

  // Grocery Items
  {
    id: 'p10',
    name: 'Organic Truffle Oil',
    brand: 'Gourmet',
    price: 1499,
    gender: Gender.Unspecified,
    mindsetTier: ShoppingMindset.Branded,
    category: 'Groceries',
    imageUrl: 'https://picsum.photos/400/500?random=10',
    rating: 4.8,
    description: 'Authentic Italian white truffle oil. A few drops add a luxurious aroma to pasta, risotto, and salads.'
  },
  {
    id: 'p11',
    name: 'Family Pack Pasta',
    brand: 'Barilla',
    price: 350,
    gender: Gender.Unspecified,
    mindsetTier: ShoppingMindset.Medium,
    category: 'Groceries',
    imageUrl: 'https://picsum.photos/400/500?random=11',
    rating: 4.5,
    description: '1kg pack of premium durum wheat semolina pasta. Cooks to perfect al dente texture in 10 minutes.'
  },
  {
    id: 'p12',
    name: 'Instant Noodles 5-Pack',
    brand: 'NoodleKing',
    price: 120,
    gender: Gender.Unspecified,
    mindsetTier: ShoppingMindset.Cheapest,
    category: 'Groceries',
    imageUrl: 'https://picsum.photos/400/500?random=12',
    rating: 4.2,
    description: 'Quick and easy instant noodles with masala flavor. Ready to eat in just 2 minutes.'
  }
];

export const AUTH_CREDS = {
  email: 'ullas9011@gmail.com',
  password: 'ullasakash@72'
};

export const ADMIN_NOTICE = "New pending order — includes user_gender and user_price_mindset. Approve to order from supplier.";
export const CUSTOMER_NOTICE = "Order received — we review and confirm within 12 hours. You’ll get tracking details after processing.";