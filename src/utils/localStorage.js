/**
 * localStorage utility functions
 * Simple helpers to manage data persistence in localStorage
 */

// Keys used in localStorage
export const STORAGE_KEYS = {
  PRODUCTS: 'bidmaster_products',
  USERS: 'bidmaster_users',
  CURRENT_USER: 'bidmaster_current_user',
  BIDS: 'bidmaster_bids',
  REVIEWS: 'bidmaster_reviews',
  WALLETS: 'bidmaster_wallets', // User wallet balances
};

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Parsed data or default value
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Data to save
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all BidMaster data from localStorage
 */
export const clearAllStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};

