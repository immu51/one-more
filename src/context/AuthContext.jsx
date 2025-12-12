/**
 * AuthContext - Mock authentication context
 * Manages user authentication state using localStorage
 * Provides login, logout, and user state to all components
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, getFromStorage, saveToStorage, removeFromStorage } from '../utils/localStorage.js';

// Create the context
const AuthContext = createContext();

/**
 * AuthProvider component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  // Get initial user from localStorage if exists
  const [user, setUser] = useState(() => {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
  });

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (customer/admin)
   * @returns {object} { success: boolean, message: string }
   */
  const login = (email, password, role = 'customer') => {
    // Get all users from storage
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    
    // Find user by email
    let foundUser = users.find(u => u.email === email);

    // If user doesn't exist and role is customer, create new user
    if (!foundUser && role === 'customer') {
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password, // In real app, hash this
        name: email.split('@')[0], // Use email prefix as name
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveToStorage(STORAGE_KEYS.USERS, users);
      foundUser = newUser;
    }

    // For mock auth: accept any password if user exists, or create new user
    if (foundUser) {
      // Update role if provided
      if (role && foundUser.role !== role) {
        foundUser.role = role;
        const updatedUsers = users.map(u => 
          u.id === foundUser.id ? foundUser : u
        );
        saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
      }

      // Initialize wallet balance if not exists
      const wallets = getFromStorage(STORAGE_KEYS.WALLETS, {});
      if (!wallets[foundUser.id]) {
        wallets[foundUser.id] = 0; // Default wallet balance
        saveToStorage(STORAGE_KEYS.WALLETS, wallets);
      }

      // Save current user to localStorage
      const currentUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      };
      saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      setUser(currentUser);
      return { success: true, message: 'Login successful!' };
    }

    // If admin login and user doesn't exist, create admin
    if (role === 'admin') {
      const newAdmin = {
        id: `admin-${Date.now()}`,
        email,
        password,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      users.push(newAdmin);
      saveToStorage(STORAGE_KEYS.USERS, users);
      const currentUser = {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
      };
      saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      setUser(currentUser);
      return { success: true, message: 'Admin login successful!' };
    }

    return { success: false, message: 'Login failed. Please try again.' };
  };

  /**
   * Register function
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   * @returns {object} { success: boolean, message: string }
   */
  const register = (email, password, name) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already registered!' };
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // In real app, hash this
      name,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);

    // Initialize wallet balance for new user
    const wallets = getFromStorage(STORAGE_KEYS.WALLETS, {});
    wallets[newUser.id] = 0; // Default wallet balance
    saveToStorage(STORAGE_KEYS.WALLETS, wallets);

    // Auto-login after registration
    const currentUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    setUser(currentUser);

    return { success: true, message: 'Registration successful!' };
  };

  /**
   * Logout function
   * Removes user from state and localStorage
   */
  const logout = () => {
    removeFromStorage(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
  };

  // Provide context value to children
  const value = {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

