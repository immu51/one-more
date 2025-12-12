/**
 * Sample data for BidMaster
 * This file seeds localStorage with initial products, reviews, and a default admin user
 */

import { STORAGE_KEYS, saveToStorage, getFromStorage } from './localStorage.js';
import { appConfig } from '../config/appConfig.js';

/**
 * Initialize sample products
 * Products have: id, title, description, image, price, category, status (live/draft), createdAt
 */
export const sampleProducts = [
  {
    id: '1',
    title: 'Vintage Rolex Watch',
    description: 'Beautiful vintage Rolex watch in excellent condition. Perfect for collectors.',
    image: '/assets/images/products/vintage-watch.png',
    price: 12000,
    category: 'Electronics',
    status: 'live',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Designer Leather Handbag',
    description: 'Luxury designer handbag, brand new with tags. Limited edition.',
    image: '/assets/images/products/designer-handbag.png',
    price: 2000,
    category: 'Fashion',
    status: 'live',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Smartphone Pro Max',
    description: 'Latest flagship smartphone with all premium features. Unlocked.',
    image: '/assets/images/products/smartphone.png',
    price: 999,
    category: 'Electronics',
    status: 'live',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Antique Persian Rug',
    description: 'Handwoven antique Persian rug, 8x10 feet. Authentic and rare.',
    image: '/assets/images/products/persian-rug.png',
    price: 5000,
    category: 'Home & Decor',
    status: 'live',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RTX graphics. Perfect for gamers.',
    image: '/assets/images/products/gaming-laptop.png',
    price: 1499,
    category: 'Electronics',
    status: 'live',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Vintage Camera Collection',
    description: 'Collection of 5 vintage cameras including Leica and Canon models.',
    image: '/assets/images/products/camera-collection.png',
    price: 3500,
    category: 'Collectibles',
    status: 'live',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Sample reviews
 */
export const sampleReviews = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '/assets/images/avatars/sarah-johnson.png',
    rating: 5,
    text: 'Amazing platform! I won a beautiful watch at a great price. The bidding process was smooth and transparent.',
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: '/assets/images/avatars/michael-chen.png',
    rating: 5,
    text: 'Love the direct purchase option. Fast checkout and excellent customer service. Highly recommend!',
  },
  {
    id: '3',
    name: 'Emily Davis',
    avatar: '/assets/images/avatars/emily-davis.png',
    rating: 4,
    text: 'Great selection of products. The auction feature is exciting and the UI is very user-friendly.',
  },
];

/**
 * Initialize sample data in localStorage
 * Only seeds if data doesn't already exist
 */
export const initializeSampleData = () => {
  // Initialize products
  const existingProducts = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
  if (existingProducts.length === 0) {
    saveToStorage(STORAGE_KEYS.PRODUCTS, sampleProducts);
    console.log('✅ Sample products initialized');
  } else {
    // Check if there are any live products
    const liveProducts = existingProducts.filter(p => p.status === 'live');
    if (liveProducts.length === 0 && existingProducts.length > 0) {
      // If no live products exist, set all existing products to live
      const updatedProducts = existingProducts.map(p => ({ ...p, status: 'live' }));
      saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
      console.log('✅ Updated all products to live status');
    }
  }

  // Initialize reviews
  const existingReviews = getFromStorage(STORAGE_KEYS.REVIEWS, []);
  if (existingReviews.length === 0) {
    saveToStorage(STORAGE_KEYS.REVIEWS, sampleReviews);
    console.log('✅ Sample reviews initialized');
  }

  // Initialize default admin user
  const existingUsers = getFromStorage(STORAGE_KEYS.USERS, []);
  const adminExists = existingUsers.some(user => user.email === appConfig.admin.email);
  
  if (!adminExists) {
    const adminUser = {
      id: 'admin-1',
      email: appConfig.admin.email,
      password: appConfig.admin.password, // In real app, this would be hashed
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.USERS, [...existingUsers, adminUser]);
    console.log(`✅ Default admin user created (email: ${appConfig.admin.email}, password: ${appConfig.admin.password})`);
  }

  // Initialize bids array if it doesn't exist
  const existingBids = getFromStorage(STORAGE_KEYS.BIDS, []);
  if (existingBids.length === 0) {
    saveToStorage(STORAGE_KEYS.BIDS, []);
  }
};

