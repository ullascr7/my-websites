import { User, Gender, ShoppingMindset, Product, Order, ApiResponse, CartItem } from '../types';
import { MOCK_PRODUCTS, AUTH_CREDS } from '../constants';

const STORAGE_KEYS = {
  USER: 'um_user',
  ORDERS: 'um_orders',
  PRODUCTS: 'um_products'
};

// Simulate async API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockApi = {
  // Admin Login (Email/Pass) or Customer Login (Phone check)
  async login(identifier: string, password?: string): Promise<ApiResponse<User>> {
    await delay(500);
    
    // 1. Admin Login Check
    if (identifier === AUTH_CREDS.email && password === AUTH_CREDS.password) {
      const user: User = {
        id: 'u_admin_001',
        email: AUTH_CREDS.email,
        name: 'Developer Admin',
        gender: Gender.Unspecified,
        mindset: ShoppingMindset.Unspecified,
        onboardingCompleted: false,
        isAdmin: true,
        preferredCategories: []
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { success: true, data: user };
    }

    // 2. Customer Phone Login Check
    const isPhone = /^\d+$/.test(identifier);
    if (isPhone) {
      if (identifier === '9999999999') {
         const user: User = {
          id: 'u_demo_customer',
          email: 'demo@example.com',
          phone: identifier,
          address: '123 Demo St, Tech City',
          name: 'Demo Customer',
          gender: Gender.Men,
          mindset: ShoppingMindset.Medium,
          onboardingCompleted: true,
          isAdmin: false,
          preferredCategories: ['Electronics']
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return { success: true, data: user };
      }
      return { success: false, error: 'User not found' };
    }

    return { success: false, error: 'Invalid credentials' };
  },

  async registerCustomer(details: { phone: string; email: string; address: string; name: string }): Promise<ApiResponse<User>> {
    await delay(800);
    const user: User = {
      id: `u_${Date.now()}`,
      ...details,
      gender: Gender.Unspecified,
      mindset: ShoppingMindset.Unspecified,
      onboardingCompleted: false,
      isAdmin: false,
      preferredCategories: []
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { success: true, data: user };
  },

  async updateUserPreferences(gender: Gender, mindset: ShoppingMindset, categories: string[] = []): Promise<ApiResponse<User>> {
    await delay(600);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) return { success: false, error: 'User not found' };

    const user: User = JSON.parse(storedUser);
    user.gender = gender;
    user.mindset = mindset;
    user.preferredCategories = categories;
    user.onboardingCompleted = true;

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { success: true, data: user };
  },

  async getProducts(
    userGender: Gender, 
    userMindset: ShoppingMindset, 
    category?: string, 
    preferredCategories: string[] = [],
    ignoreFilters: boolean = false
  ): Promise<ApiResponse<Product[]>> {
    await delay(400);
    
    let allProducts: Product[] = [];
    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    
    if (storedProducts) {
      allProducts = JSON.parse(storedProducts);
    } else {
      allProducts = [...MOCK_PRODUCTS];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
    }

    if (ignoreFilters) {
      return { success: true, data: [...allProducts].reverse() };
    }
    
    let filtered = allProducts.filter(p => 
      p.gender === 'Unisex' || p.gender === userGender || userGender === Gender.Unspecified
    );

    if (category && category !== 'All') {
      if (category === 'Clothes') {
        filtered = filtered.filter(p => p.category === 'Clothes' || p.category === 'Accessories');
      } else {
        filtered = filtered.filter(p => p.category === category);
      }
    } else if (preferredCategories && preferredCategories.length > 0) {
      filtered = filtered.filter(p => {
        if (preferredCategories.includes('Clothes')) {
          if (p.category === 'Clothes' || p.category === 'Accessories') return true;
        }
        return preferredCategories.includes(p.category);
      });
    }

    filtered.sort((a, b) => {
      const scoreA = getMindsetScore(a, userMindset);
      const scoreB = getMindsetScore(b, userMindset);
      return scoreB - scoreA;
    });

    return { success: true, data: filtered };
  },

  async addProduct(product: Product): Promise<ApiResponse<Product>> {
    await delay(600);
    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : [...MOCK_PRODUCTS];
    const newProduct = { ...product, id: `p_${Date.now()}` };
    allProducts.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
    return { success: true, data: newProduct };
  },

  async updateProduct(product: Product): Promise<ApiResponse<Product>> {
    await delay(500);
    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : [...MOCK_PRODUCTS];
    
    const index = allProducts.findIndex(p => p.id === product.id);
    if (index !== -1) {
      allProducts[index] = product;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
      return { success: true, data: product };
    }
    return { success: false, error: 'Product not found' };
  },

  async deleteProduct(productId: string): Promise<ApiResponse<boolean>> {
    await delay(400);
    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : [...MOCK_PRODUCTS];
    
    const filtered = allProducts.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return { success: true, data: true };
  },

  async deleteProducts(productIds: string[]): Promise<ApiResponse<boolean>> {
    await delay(400);
    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : [...MOCK_PRODUCTS];
    const filtered = allProducts.filter(p => !productIds.includes(p.id));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return { success: true, data: true };
  },

  async createOrder(user: User, items: CartItem[]): Promise<ApiResponse<Order>> {
    await delay(800);
    
    const customerDetails = {
      name: user.name,
      phone: user.phone || 'N/A',
      email: user.email,
      address: user.address || 'Address not provided'
    };

    // Calculate total based on quantity
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order: Order = {
      id: `ord_${Date.now()}`,
      userId: user.id,
      customerDetails,
      userGenderSnapshot: user.gender,
      userMindsetSnapshot: user.mindset,
      items,
      total,
      status: 'Pending',
      date: new Date().toISOString()
    };

    const existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    existingOrders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));

    return { success: true, data: order };
  },

  async getOrders(userId?: string): Promise<ApiResponse<Order[]>> {
    await delay(300);
    const orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    
    if (userId) {
      const userOrders = orders.filter(o => o.userId === userId).reverse();
      return { success: true, data: userOrders };
    }
    
    return { success: true, data: orders.reverse() };
  },

  async updateOrderStatus(orderId: string, status: 'Approved' | 'Cancelled'): Promise<ApiResponse<boolean>> {
    await delay(400);
    const orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return { success: true, data: true };
    }
    return { success: false, error: 'Order not found' };
  },
  
  // New: Simulation of URL scraping/importing
  async fetchProductMetadata(url: string): Promise<ApiResponse<Partial<Product>>> {
    await delay(1500); // Simulate network crawl
    
    const lowerUrl = url.toLowerCase();
    
    let data: Partial<Product> = {
      name: 'Imported Item',
      description: 'Imported from external link. Please verify details.',
      // Default fallback image (Unsplash)
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      price: 0,
      category: 'Clothes',
      rating: 4.5
    };

    // 0. URL SLUG EXTRACTION
    // Try to get a better name from the URL itself (Flipkart/Amazon slug)
    let extractedName = '';
    
    // Flipkart: flipkart.com/product-name-slug/p/id...
    if (lowerUrl.includes('flipkart.com')) {
        try {
            const matches = url.match(/flipkart\.com\/([^\/]+)\/p\//);
            if (matches && matches[1]) {
                extractedName = matches[1].replace(/-/g, ' ');
            }
        } catch(e) {}
        data.brand = 'Flipkart Select';
    } 
    // Amazon: amazon.in/product-name/dp/id...
    else if (lowerUrl.includes('amazon') || lowerUrl.includes('amzn')) {
        try {
            const matches = url.match(/\/([^\/]+)\/dp\//);
            if (matches && matches[1]) {
                extractedName = matches[1].replace(/-/g, ' ');
            }
        } catch(e) {}
        data.brand = 'Amazon Import';
    }

    if (extractedName) {
        // Title case the extracted name
        data.name = extractedName.replace(/\b\w/g, l => l.toUpperCase());
    }

    // Combine URL and Extracted Name for keyword search
    // This allows us to catch "poco" in the name even if the URL structure is weird
    const searchString = (lowerUrl + ' ' + extractedName.toLowerCase());

    // --- SMART IMAGE MATCHING USING UNSPLASH ---
    // Using Unsplash guarantees images load, unlike scraping e-commerce sites directly which blocks hotlinking.

    // 1. ELECTRONICS: COMPUTERS & LAPTOPS
    if (searchString.match(/macbook|laptop|notebook|thinkpad|zenbook|dell|hp|lenovo|acer|asus|chromebook|gaming laptop/)) {
         data.category = 'Electronics';
         data.name = data.name === 'Imported Item' ? 'Premium Laptop' : data.name;
         // Unsplash Laptop Image
         data.imageUrl = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'; 
         data.price = 45000;
         if (searchString.includes('macbook')) {
            data.brand = 'Apple';
            data.imageUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80';
         }
    } 
    // 2. ELECTRONICS: PHONES
    else if (searchString.match(/iphone|samsung|galaxy|pixel|oneplus|redmi|xiaomi|realme|oppo|vivo|mobile|phone|smartphone|poco|infinix|tecno|motorola|moto|nothing|iqoo|nokia|rog phone/)) {
        data.category = 'Electronics';
        data.name = data.name === 'Imported Item' ? 'Smartphone 5G' : data.name;
        // Unsplash Generic Smartphone
        data.imageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'; 
        data.price = 15999;

        if (searchString.includes('iphone')) {
            data.brand = 'Apple';
            data.imageUrl = 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80';
            data.price = 79900;
        } else if (searchString.includes('samsung')) {
            data.brand = 'Samsung';
            data.imageUrl = 'https://images.unsplash.com/photo-1610945265078-38584e12e8dc?auto=format&fit=crop&w=800&q=80';
        }
    }
    // 3. ELECTRONICS: AUDIO
    else if (searchString.match(/headphone|earphone|airpods|buds|sony|jbl|bose|audio|speaker|soundbar|boat|noise/)) {
        data.category = 'Electronics';
        data.name = data.name === 'Imported Item' ? 'Wireless Audio Gear' : data.name;
        data.price = 2499;
        // Unsplash Headphones
        data.imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
        if (searchString.includes('airpods') || searchString.includes('buds')) {
             data.imageUrl = 'https://images.unsplash.com/photo-1572569028738-411a097746fc?auto=format&fit=crop&w=800&q=80'; // Earbuds
        }
    } 
    // 4. ELECTRONICS: WATCHES
    else if (searchString.match(/watch|smartwatch|band|fitness tracker/)) {
        data.category = 'Electronics';
        data.name = data.name === 'Imported Item' ? 'Smartwatch' : data.name;
        data.price = 3499;
        // Unsplash Smartwatch
        data.imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    }
    // 5. ELECTRONICS: CAMERAS
    else if (searchString.match(/camera|dslr|lens|action cam|gopro/)) {
         data.category = 'Electronics';
         data.name = data.name === 'Imported Item' ? 'Digital Camera' : data.name;
         data.price = 45000;
         // Unsplash Camera
         data.imageUrl = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
    }

    // 6. FASHION: ETHNIC (Sarees/Kurta)
    else if (searchString.match(/saree|sari|ethnic|kurta|kurti|lehenga|dupatta/)) {
        data.category = 'Clothes';
        data.name = data.name === 'Imported Item' ? 'Ethnic Wear' : data.name;
        data.price = 2999;
        // Unsplash Ethnic/Traditional Wear
        data.imageUrl = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
    }
    // 7. FASHION: TOPWEAR
    else if (searchString.match(/shirt|t-shirt|polo|tee|top|hoodie|jacket|sweatshirt|blazer/)) {
         data.category = 'Clothes';
         data.name = data.name === 'Imported Item' ? 'Fashion Topwear' : data.name;
         data.price = 899;
         // Unsplash T-Shirt
         data.imageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80';
        if (searchString.includes('jacket') || searchString.includes('hoodie')) {
             data.price = 1999;
             // Unsplash Jacket
             data.imageUrl = 'https://images.unsplash.com/photo-1551028919-ac66e6a39d44?auto=format&fit=crop&w=800&q=80';
        }
    }
    // 8. FASHION: BOTTOMWEAR
    else if (searchString.match(/jeans|denim|pant|trouser|legging|jogger|shorts/)) {
         data.category = 'Clothes';
         data.name = data.name === 'Imported Item' ? 'Stylish Bottomwear' : data.name;
         data.price = 1299;
         // Unsplash Jeans
         data.imageUrl = 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=800&q=80';
    }
    
    // 9. ACCESSORIES: FOOTWEAR
    else if (searchString.match(/shoe|sneaker|boot|sandal|footwear|slipper|slide|heel|flat/)) {
        data.category = 'Accessories';
        data.name = data.name === 'Imported Item' ? 'Trendy Footwear' : data.name;
        data.price = 1899;
        // Unsplash Sneakers
        data.imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
        if (searchString.includes('boot')) {
            // Unsplash Boots
            data.imageUrl = 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80';
        }
    }
    // 10. ACCESSORIES: BAGS
    else if (searchString.match(/bag|backpack|purse|wallet|luggage|suitcase|handbag/)) {
        data.category = 'Accessories';
        data.name = data.name === 'Imported Item' ? 'Fashion Accessory' : data.name;
        data.price = 1199;
        // Unsplash Backpack
        data.imageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';
    }

    // Attempt to guess platform branding if not already set by specific rules
    if (!data.brand) {
        if (lowerUrl.includes('flipkart')) data.brand = 'Flipkart Select';
        else if (lowerUrl.includes('amazon')) data.brand = 'Amazon Import';
        else if (lowerUrl.includes('myntra')) data.brand = 'Myntra Fashion';
    }

    return { success: true, data };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

function getMindsetScore(product: Product, userMindset: ShoppingMindset): number {
  if (product.mindsetTier === userMindset) return 10;
  if (userMindset === ShoppingMindset.Branded) {
    if (product.mindsetTier === ShoppingMindset.Medium) return 5;
    if (product.mindsetTier === ShoppingMindset.Cheapest) return 1;
  }
  if (userMindset === ShoppingMindset.Cheapest) {
    if (product.mindsetTier === ShoppingMindset.Medium) return 5;
    if (product.mindsetTier === ShoppingMindset.Branded) return 0;
  }
  if (userMindset === ShoppingMindset.Medium) return 5;
  return 0;
}