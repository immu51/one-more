/**
 * Products page
 * Displays all products with filtering and search functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage.js';
import { useAuth } from '../context/AuthContext.jsx';

const Products = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load products from localStorage
    // Show live and hold products (hide only draft products)
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
    const visibleProducts = products.filter(p => p.status === 'live' || p.status === 'hold');
    setAllProducts(visibleProducts);
    setFilteredProducts(visibleProducts);
    setLoading(false);
  }, [isAuthenticated, navigate]);

  // Get unique categories
  const categories = [...new Set(allProducts.map(p => p.category))];

  // Filter products when filters change
  useEffect(() => {
    let filtered = [...allProducts];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    setFilteredProducts(filtered);
  }, [filters, allProducts]);

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">All Products</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.category) && (
            <button
              onClick={() => setFilters({ search: '', category: '' })}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-4">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} loading={loading} />
      </div>
    </div>
  );
};

export default Products;

