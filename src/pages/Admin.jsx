/**
 * Admin Dashboard page
 * Allows admin to add, edit, delete, and manage products
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage.js';
import Toast from '../components/Toast.jsx';
import AdminCancelOrderModal from '../components/AdminCancelOrderModal.jsx';
import OrderReceipt from '../components/OrderReceipt.jsx';
import { getProductImageFallback } from '../utils/imageHelper.js';

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    primaryImage: '',
    gallery: [],
    price: '',
    category: '',
    status: 'live',
  });
  const [imagePreviews, setImagePreviews] = useState({
    primary: null,
    gallery: [],
  });
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [cancelOrder, setCancelOrder] = useState(null); // Order to cancel (admin)
  const [printReceipt, setPrintReceipt] = useState(null); // Order to print receipt
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'bulk'
  const [bulkProducts, setBulkProducts] = useState([]); // Array of products with images
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [bulkCategorySuggestions, setBulkCategorySuggestions] = useState({}); // For bulk upload: {productIndex: suggestions}

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    // Load products and orders
    loadProducts();
    loadOrders();
  }, [isAdmin, navigate]);

  // Extract unique categories from existing products for suggestions
  useEffect(() => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    setCategorySuggestions(categories.sort());
  }, [products]);

  const loadProducts = () => {
    const allProducts = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
    setProducts(allProducts);
  };

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('bidmaster_orders') || '[]');
    // Sort by newest first
    const sortedOrders = allOrders.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    setOrders(sortedOrders);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrimaryImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image size should be less than 5MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({
        ...formData,
        primaryImage: base64String,
      });
      setImagePreviews({
        ...imagePreviews,
        primary: base64String,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: `${file.name} is not an image file`, type: 'error' });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: `${file.name} is larger than 5MB`, type: 'error' });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Convert all files to base64
    const promises = validFiles.map(file => 
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      })
    );

    Promise.all(promises).then(base64Images => {
      const newGallery = [...formData.gallery, ...base64Images];
      setFormData({
        ...formData,
        gallery: newGallery,
      });
      setImagePreviews({
        ...imagePreviews,
        gallery: [...imagePreviews.gallery, ...base64Images],
      });
      setToast({ message: `${validFiles.length} image(s) added to gallery`, type: 'success' });
    });

    // Reset file input
    e.target.value = '';
  };

  const handleRemoveGalleryImage = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.gallery.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      gallery: newGallery,
    });
    setImagePreviews({
      ...imagePreviews,
      gallery: newPreviews,
    });
  };

  const handleSetPrimaryFromGallery = (index) => {
    const galleryImage = formData.gallery[index];
    setFormData({
      ...formData,
      primaryImage: galleryImage,
    });
    setImagePreviews({
      ...imagePreviews,
      primary: imagePreviews.gallery[index],
    });
  };

  const handlePrimaryImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({
      ...formData,
      primaryImage: url,
    });
    if (url) {
      setImagePreviews({
        ...imagePreviews,
        primary: url,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form - require at least primaryImage
    if (!formData.title || !formData.description || !formData.primaryImage) {
      setToast({ message: 'Please fill in all required fields and upload/enter a primary image', type: 'error' });
      return;
    }

    // Convert to compatible format (support both old and new structure)
    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      // Keep backward compatibility - if no primaryImage but has image, use image
      primaryImage: formData.primaryImage || formData.image || '',
      gallery: formData.gallery || [],
      // Keep old image field for backward compatibility
      image: formData.primaryImage || formData.image || '',
    };

    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...productData,
            }
          : p
      );
      saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
      setToast({ message: 'Product updated successfully!', type: 'success' });
    } else {
      // Create new product
      const newProduct = {
        id: `product-${Date.now()}`,
        ...productData,
        createdAt: new Date().toISOString(),
      };
      const updatedProducts = [...products, newProduct];
      saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
      setToast({ message: 'Product added successfully!', type: 'success' });
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      primaryImage: '',
      gallery: [],
      price: '',
      category: '',
      status: 'live',
    });
    setImagePreviews({
      primary: null,
      gallery: [],
    });
    setEditingProduct(null);
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Support both old (image) and new (primaryImage + gallery) structure
    const primaryImage = product.primaryImage || product.image || '';
    const gallery = product.gallery || [];
    setFormData({
      title: product.title,
      description: product.description,
      primaryImage: primaryImage,
      gallery: gallery,
      image: primaryImage, // Keep for backward compatibility
      price: product.price || product.buyNowPrice || '',
      category: product.category,
      status: product.status,
    });
    setImagePreviews({
      primary: primaryImage,
      gallery: gallery,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
      setToast({ message: 'Product deleted successfully!', type: 'success' });
      loadProducts();
    }
  };

  const handleToggleStatus = (productId) => {
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        // Cycle through: live -> draft -> hold -> live
        let newStatus = 'live';
        if (p.status === 'live') {
          newStatus = 'draft';
        } else if (p.status === 'draft') {
          newStatus = 'hold';
        } else {
          newStatus = 'live';
        }
        return { ...p, status: newStatus };
      }
      return p;
    });
    saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
    setToast({ message: 'Product status updated!', type: 'success' });
    loadProducts();
  };

  const handleHoldStock = (productId) => {
    const updatedProducts = products.map((p) =>
      p.id === productId
        ? { ...p, status: 'hold' }
        : p
    );
    saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
    setToast({ message: 'Product stock held successfully!', type: 'success' });
    loadProducts();
  };

  if (!isAdmin) {
    return null;
  }

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const allOrders = JSON.parse(localStorage.getItem('bidmaster_orders') || '[]');
    const updatedOrders = allOrders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        // Add deliveredAt timestamp when status changes to delivered
        if (newStatus === 'delivered' && !order.deliveredAt) {
          updatedOrder.deliveredAt = new Date().toISOString();
        }
        return updatedOrder;
      }
      return order;
    });
    localStorage.setItem('bidmaster_orders', JSON.stringify(updatedOrders));
    loadOrders();
    setToast({ message: 'Order status updated successfully!', type: 'success' });
  };

  const handleAdminCancelOrder = (order) => {
    setCancelOrder(order);
  };

  const handleAdminCancelConfirm = () => {
    loadOrders();
    setCancelOrder(null);
  };

  const getProductById = (productId) => {
    return products.find(p => p.id === productId);
  };

  // Bulk Upload Functions
  const handleBulkImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: `${file.name} is not an image file`, type: 'error' });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: `${file.name} is larger than 5MB`, type: 'error' });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setToast({ message: 'No valid images selected', type: 'error' });
      return;
    }

    // Convert files to base64 and create product objects
    const newProducts = [];
    for (const file of validFiles) {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      newProducts.push({
        id: `temp-${Date.now()}-${Math.random()}`,
        primaryImage: base64String,
        gallery: [],
        image: base64String, // Keep for backward compatibility
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), // Use filename as default title
        description: '',
        price: '',
        category: '',
        status: 'live',
      });
    }

    setBulkProducts([...bulkProducts, ...newProducts]);
    setToast({ message: `${validFiles.length} image(s) added!`, type: 'success' });
    
    // Reset file input
    e.target.value = '';
  };

  const handleBulkProductChange = (index, field, value) => {
    const updated = [...bulkProducts];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    // Keep image field in sync with primaryImage for backward compatibility
    if (field === 'primaryImage') {
      updated[index].image = value;
    }
    setBulkProducts(updated);
  };

  const handleBulkGalleryUpload = async (e, productIndex) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: `${file.name} is not an image file`, type: 'error' });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: `${file.name} is larger than 5MB`, type: 'error' });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Convert to base64
    const promises = validFiles.map(file => 
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      })
    );

    Promise.all(promises).then(base64Images => {
      const updated = [...bulkProducts];
      const currentGallery = updated[productIndex].gallery || [];
      updated[productIndex] = {
        ...updated[productIndex],
        gallery: [...currentGallery, ...base64Images],
      };
      setBulkProducts(updated);
      setToast({ message: `${validFiles.length} image(s) added to gallery`, type: 'success' });
    });

    e.target.value = '';
  };

  const handleRemoveBulkGalleryImage = (productIndex, imageIndex) => {
    const updated = [...bulkProducts];
    const gallery = updated[productIndex].gallery || [];
    updated[productIndex] = {
      ...updated[productIndex],
      gallery: gallery.filter((_, i) => i !== imageIndex),
    };
    setBulkProducts(updated);
  };

  const handleSetBulkPrimaryFromGallery = (productIndex, imageIndex) => {
    const updated = [...bulkProducts];
    const gallery = updated[productIndex].gallery || [];
    updated[productIndex] = {
      ...updated[productIndex],
      primaryImage: gallery[imageIndex],
      image: gallery[imageIndex], // Keep for backward compatibility
    };
    setBulkProducts(updated);
  };

  const handleRemoveBulkProduct = (index) => {
    const updated = bulkProducts.filter((_, i) => i !== index);
    setBulkProducts(updated);
  };

  const handleBulkSubmit = () => {
    if (bulkProducts.length === 0) {
      setToast({ message: 'No products to add', type: 'error' });
      return;
    }

    // Validate all products
    const invalidProducts = bulkProducts.filter(
      p => !p.title || !p.description || !p.price || !p.category || !p.image
    );

    if (invalidProducts.length > 0) {
      setToast({ 
        message: `Please fill all fields for ${invalidProducts.length} product(s)`, 
        type: 'error' 
      });
      return;
    }

    // Create new products
    const newProducts = bulkProducts.map((product, index) => ({
      id: `product-${Date.now()}-${index}`,
      title: product.title,
      description: product.description,
      primaryImage: product.primaryImage || product.image || '',
      gallery: product.gallery || [],
      image: product.primaryImage || product.image || '', // Keep for backward compatibility
      price: parseFloat(product.price) || 0,
      category: product.category,
      status: product.status || 'live',
      createdAt: new Date().toISOString(),
    }));

    // Add to storage
    const updatedProducts = [...products, ...newProducts];
    saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
    setToast({ 
      message: `Successfully added ${newProducts.length} products!`, 
      type: 'success' 
    });
    
    // Reset bulk form
    setBulkProducts([]);
    loadProducts();
  };

  const handleClearBulk = () => {
    setBulkProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Orders ({orders.length})
            </button>
          </div>
        </div>

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <>
            {/* Upload Mode Toggle */}
            {!editingProduct && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex gap-4 items-center">
                  <span className="text-sm font-semibold text-gray-700">Upload Mode:</span>
                  <button
                    onClick={() => {
                      setUploadMode('single');
                      setBulkProducts([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      uploadMode === 'single'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Single Product
                  </button>
                  <button
                    onClick={() => {
                      setUploadMode('bulk');
                      setEditingProduct(null);
                      setFormData({
                        title: '',
                        description: '',
                        image: '',
                        price: '',
                        category: '',
                        status: 'live',
                      });
                      setImagePreview(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      uploadMode === 'bulk'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Bulk Upload
                  </button>
                </div>
              </div>
            )}

            {/* Single Product Form */}
            {uploadMode === 'single' && (
              <>
            {/* Add/Edit Product Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Primary Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Image (Main/Thumbnail) *
                    </label>
                    
                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Primary Image from Computer
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePrimaryImageUpload}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, GIF (Max 5MB)
                      </p>
                    </div>

                    {/* Or URL Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Enter Primary Image URL
                      </label>
                      <input
                        type="url"
                        name="primaryImageUrl"
                        value={formData.primaryImage && !formData.primaryImage.startsWith('data:') ? formData.primaryImage : ''}
                        onChange={handlePrimaryImageUrlChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* Primary Image Preview */}
                    {imagePreviews.primary && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Image Preview
                        </label>
                        <div className="relative w-full h-64 border-2 border-primary-500 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={imagePreviews.primary}
                            alt="Primary Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/500x300?text=Invalid+Image';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreviews({ ...imagePreviews, primary: null });
                              setFormData({ ...formData, primaryImage: '' });
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                            aria-label="Remove primary image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            Primary
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gallery Images Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Images (Additional Photos)
                    </label>
                    
                    {/* Multiple File Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Multiple Gallery Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImageUpload}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select multiple images (Max 5MB per image, Max 10 images)
                      </p>
                    </div>

                    {/* Gallery Preview */}
                    {imagePreviews.gallery.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gallery Images ({imagePreviews.gallery.length})
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {imagePreviews.gallery.map((img, index) => (
                            <div key={index} className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={img}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-32 object-contain"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/200x200?text=Invalid';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                aria-label="Remove image"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryFromGallery(index)}
                                className="absolute bottom-1 left-1 bg-primary-600 text-white px-2 py-0.5 rounded text-xs font-semibold hover:bg-primary-700 transition-colors"
                              >
                                Set Primary
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={(e) => {
                        handleChange(e);
                        setShowCategorySuggestions(true);
                      }}
                      onFocus={() => setShowCategorySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Type or select category"
                      required
                    />
                    {/* Category Suggestions Dropdown */}
                    {showCategorySuggestions && categorySuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {categorySuggestions
                          .filter(cat => 
                            !formData.category || 
                            cat.toLowerCase().includes(formData.category.toLowerCase())
                          )
                          .map((category, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, category });
                                setShowCategorySuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm"
                            >
                              {category}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="live">Live</option>
                      <option value="draft">Draft</option>
                      <option value="hold">Stock Hold</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                          title: '',
                          description: '',
                          primaryImage: '',
                          gallery: [],
                          price: '',
                          category: '',
                          status: 'live',
                        });
                        setImagePreviews({
                          primary: null,
                          gallery: [],
                        });
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            </>)}

            {/* Bulk Upload Form */}
            {uploadMode === 'bulk' && !editingProduct && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Bulk Upload Products</h2>
                
                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Multiple Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select multiple images at once (Max 5MB per image)
                  </p>
                </div>

                {/* Bulk Products Grid */}
                {bulkProducts.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Products ({bulkProducts.length})
                      </h3>
                      <button
                        onClick={handleClearBulk}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto p-2">
                      {bulkProducts.map((product, index) => {
                        const primaryImg = product.primaryImage || product.image || '';
                        const gallery = product.gallery || [];
                        return (
                        <div key={product.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          {/* Primary Image Preview */}
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Primary Image
                            </label>
                            <div className="relative w-full h-48 border-2 border-primary-500 rounded-lg overflow-hidden bg-white">
                              {primaryImg ? (
                                <>
                                  <img
                                    src={primaryImg}
                                    alt={product.title}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                                    }}
                                  />
                                  <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                                    Primary
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No primary image
                                </div>
                              )}
                              <button
                                onClick={() => handleRemoveBulkProduct(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                aria-label="Remove product"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Gallery Images */}
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Gallery Images ({gallery.length})
                            </label>
                            {gallery.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {gallery.map((img, imgIndex) => (
                                  <div key={imgIndex} className="relative border border-gray-300 rounded overflow-hidden bg-white">
                                    <img
                                      src={img}
                                      alt={`Gallery ${imgIndex + 1}`}
                                      className="w-full h-16 object-contain"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/100x100?text=Invalid';
                                      }}
                                    />
                                    <button
                                      onClick={() => handleRemoveBulkGalleryImage(index, imgIndex)}
                                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                      aria-label="Remove gallery image"
                                    >
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleSetBulkPrimaryFromGallery(index, imgIndex)}
                                      className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-xs py-0.5 hover:bg-primary-700 transition-colors"
                                    >
                                      Set Primary
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleBulkGalleryUpload(e, index)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Add more images to gallery
                            </p>
                          </div>

                          {/* Form Fields */}
                          <div className="space-y-3">
                            {/* Title */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Title *
                              </label>
                              <input
                                type="text"
                                value={product.title}
                                onChange={(e) => handleBulkProductChange(index, 'title', e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Product title"
                                required
                              />
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Description *
                              </label>
                              <textarea
                                value={product.description}
                                onChange={(e) => handleBulkProductChange(index, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Product description"
                                required
                              />
                            </div>

                            {/* Price and Category */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Price (₹) *
                                </label>
                                <input
                                  type="number"
                                  value={product.price}
                                  onChange={(e) => handleBulkProductChange(index, 'price', e.target.value)}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="0"
                                  required
                                />
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Category *
                                </label>
                                <input
                                  type="text"
                                  value={product.category}
                                  onChange={(e) => {
                                    handleBulkProductChange(index, 'category', e.target.value);
                                    setBulkCategorySuggestions({
                                      ...bulkCategorySuggestions,
                                      [index]: true,
                                    });
                                  }}
                                  onFocus={() => {
                                    setBulkCategorySuggestions({
                                      ...bulkCategorySuggestions,
                                      [index]: true,
                                    });
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      setBulkCategorySuggestions({
                                        ...bulkCategorySuggestions,
                                        [index]: false,
                                      });
                                    }, 200);
                                  }}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="Type or select category"
                                  required
                                />
                                {/* Category Suggestions Dropdown for Bulk */}
                                {bulkCategorySuggestions[index] && categorySuggestions.length > 0 && (
                                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {categorySuggestions
                                      .filter(cat => 
                                        !product.category || 
                                        cat.toLowerCase().includes(product.category.toLowerCase())
                                      )
                                      .map((category, catIdx) => (
                                        <button
                                          key={catIdx}
                                          type="button"
                                          onClick={() => {
                                            handleBulkProductChange(index, 'category', category);
                                            setBulkCategorySuggestions({
                                              ...bulkCategorySuggestions,
                                              [index]: false,
                                            });
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-primary-50 hover:text-primary-700 transition-colors text-xs"
                                        >
                                          {category}
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={product.status}
                                onChange={(e) => handleBulkProductChange(index, 'status', e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="live">Live</option>
                                <option value="draft">Draft</option>
                                <option value="hold">Stock Hold</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                {bulkProducts.length > 0 && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBulkSubmit}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                      Add {bulkProducts.length} Product{bulkProducts.length > 1 ? 's' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearBulk}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {bulkProducts.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Select multiple images to start bulk upload</p>
                  </div>
                )}
              </div>
            )}

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">All Products ({products.length})</h2>
              {products.length === 0 ? (
                <p className="text-gray-500">No products yet. Add your first product above!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="relative">
                              <img
                                src={product.primaryImage || product.image}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  const imageUrl = product.primaryImage || product.image;
                                  const fallbackUrl = getProductImageFallback(imageUrl);
                                  if (e.target.src !== fallbackUrl) {
                                    e.target.src = fallbackUrl;
                                  }
                                }}
                              />
                              {product.gallery && product.gallery.length > 0 && (
                                <div className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                  +{product.gallery.length}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{product.title}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                product.status === 'live'
                                  ? 'bg-green-100 text-green-800'
                                  : product.status === 'hold'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {product.status === 'hold' ? 'Stock Hold' : product.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-semibold">
                            ₹{product.price || product.buyNowPrice || 0}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleEdit(product)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(product.id)}
                                className={`px-3 py-1 rounded text-sm ${
                                  product.status === 'live'
                                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                                    : product.status === 'hold'
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                              >
                                {product.status === 'live' ? 'Draft' : product.status === 'hold' ? 'Release' : 'Live'}
                              </button>
                              <button
                                onClick={() => handleHoldStock(product.id)}
                                className={`px-3 py-1 rounded text-sm ${
                                  product.status === 'hold'
                                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                                disabled={product.status === 'hold'}
                              >
                                Hold Stock
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">All Customer Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const product = getProductById(order.productId);
                  return (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {order.productTitle}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Order ID: {order.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            Placed on: {new Date(order.createdAt).toLocaleString()}
                          </p>
                          {order.updatedAt && (
                            <p className="text-sm text-gray-500">
                              Updated: {new Date(order.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600">₹{order.totalPrice}</p>
                          <p className="text-sm text-gray-500">
                            {order.quantity} × ₹{order.unitPrice}
                          </p>
                        </div>
                      </div>

                      {/* Payment Information */}
                      {order.paymentMethod && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-2">Payment Information:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Payment Method:</span>{' '}
                              <span className={`font-semibold capitalize ${
                                order.paymentMethod === 'cod' ? 'text-orange-600' :
                                order.paymentMethod === 'wallet' ? 'text-blue-600' :
                                order.paymentMethod === 'online' ? 'text-green-600' :
                                'text-gray-800'
                              }`}>
                                {order.paymentMethod === 'cod' && '💵 Cash on Delivery'}
                                {order.paymentMethod === 'wallet' && '💳 Wallet'}
                                {order.paymentMethod === 'online' && (
                                  order.paymentDetails?.app 
                                    ? `🌐 ${order.paymentDetails.app === 'paytm' ? 'Paytm' : order.paymentDetails.app === 'phonepe' ? 'PhonePe' : order.paymentDetails.app === 'googlepay' ? 'Google Pay' : 'Online Payment'}`
                                    : '🌐 Online Payment'
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment Status:</span>{' '}
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                              </span>
                            </div>
                            {order.paymentDetails?.transactionId && (
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Transaction ID:</span>{' '}
                                <span className="font-mono text-xs font-medium">{order.paymentDetails.transactionId}</span>
                              </div>
                            )}
                            {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Payable on Delivery:</span>{' '}
                                <span className="font-bold text-orange-600">₹{order.totalPrice}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Customer Details */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Customer Details:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>{' '}
                            <span className="font-medium">{order.deliveryDetails.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>{' '}
                            <span className="font-medium">{order.deliveryDetails.phone}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Address:</span>{' '}
                            <span className="font-medium">
                              {order.deliveryDetails.address}, {order.deliveryDetails.city} - {order.deliveryDetails.pincode}
                            </span>
                          </div>
                          {order.deliveryDetails.landmark && (
                            <div>
                              <span className="text-gray-600">Landmark:</span>{' '}
                              <span className="font-medium">{order.deliveryDetails.landmark}</span>
                            </div>
                          )}
                          {order.deliveryDetails.deliveryInstructions && (
                            <div className="md:col-span-2">
                              <span className="text-gray-600">Instructions:</span>{' '}
                              <span className="font-medium">{order.deliveryDetails.deliveryInstructions}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Reason */}
                      {order.status === 'cancelled' && order.cancellationReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                          <p className="text-sm font-semibold text-red-800 mb-1">
                            Cancellation Reason:
                            {order.cancelledBy === 'admin' && (
                              <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-semibold">
                                Cancelled by Admin
                              </span>
                            )}
                            {order.cancelledBy !== 'admin' && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs font-semibold">
                                Cancelled by Customer
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-red-700">{order.cancellationReason}</p>
                          {order.cancelledAt && (
                            <p className="text-xs text-red-600 mt-1">
                              Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Print Receipt Button */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <button
                          onClick={() => setPrintReceipt(order)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all text-sm font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print Receipt
                        </button>
                      </div>

                      {/* Status Update */}
                      {order.status !== 'cancelled' && (
                        <>
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Update Status:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {order.status !== 'pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-semibold"
                                >
                                  Mark as Pending
                                </button>
                              )}
                              {order.status !== 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                                >
                                  Confirm Order
                                </button>
                              )}
                              {order.status !== 'shipped' && order.status !== 'pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                                >
                                  Mark as Shipped
                                </button>
                              )}
                              {order.status !== 'delivered' && order.status !== 'pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold"
                                >
                                  Mark as Delivered
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Admin Cancel Order Button - Separate Section */}
                          <div className="border-t border-red-200 pt-4 mt-4 bg-red-50 rounded-lg p-3">
                            <label className="block text-sm font-semibold text-red-800 mb-2">
                              Admin Actions:
                            </label>
                            <button
                              onClick={() => handleAdminCancelOrder(order)}
                              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm font-bold shadow-lg hover:shadow-xl"
                            >
                              🚫 Cancel Order (Admin)
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Admin Cancel Order Modal */}
        {cancelOrder && (
          <AdminCancelOrderModal
            order={cancelOrder}
            onClose={() => setCancelOrder(null)}
            onConfirm={handleAdminCancelConfirm}
          />
        )}

        {/* Print Receipt Modal */}
        {printReceipt && (
          <OrderReceipt
            order={printReceipt}
            onClose={() => setPrintReceipt(null)}
          />
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;

