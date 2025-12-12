/**
 * ProductDetail page
 * Shows detailed information about a single product with direct purchase functionality
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import CheckoutForm from '../components/CheckoutForm.jsx';
import { getProductImageFallback } from '../utils/imageHelper.js';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load product
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
    const foundProduct = products.find((p) => p.id === id);

    if (!foundProduct) {
      navigate('/products');
      return;
    }

    setProduct(foundProduct);
    setSelectedImageIndex(0); // Reset image index when product changes
    setLoading(false);
  }, [id, navigate, isAuthenticated]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setToast({ message: 'Please login to purchase', type: 'error' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (isAdmin) {
      setToast({ message: 'Admin cannot purchase products', type: 'error' });
      return;
    }

    if (product.status === 'hold') {
      setToast({ message: 'This product is currently out of stock', type: 'error' });
      return;
    }

    if (quantity < 1) {
      setToast({ message: 'Quantity must be at least 1', type: 'error' });
      return;
    }

    // Show checkout form
    setShowCheckout(true);
  };

  const handleOrderConfirm = (order) => {
    setToast({
      message: `Order placed successfully! Order ID: ${order.id}`,
      type: 'success',
    });
    // You can navigate to order confirmation page or dashboard here
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    if (newQuantity > 10) {
      setQuantity(10);
      setToast({ message: 'Maximum 10 items can be purchased at once', type: 'error' });
      return;
    }
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const productPrice = product.price || product.buyNowPrice || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Main Image */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 h-96 relative">
              {(() => {
                const allImages = [
                  product.primaryImage || product.image,
                  ...(product.gallery || [])
                ].filter(Boolean);
                const currentImage = allImages[selectedImageIndex] || allImages[0];
                
                return (
                  <>
                    <img
                      src={currentImage}
                      alt={product.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const fallbackUrl = getProductImageFallback(currentImage);
                        if (e.target.src !== fallbackUrl) {
                          e.target.src = fallbackUrl;
                        }
                      }}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                    {/* Navigation arrows if multiple images */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                          aria-label="Previous image"
                        >
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                          aria-label="Next image"
                        >
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Thumbnail Gallery */}
            {(() => {
              const allImages = [
                product.primaryImage || product.image,
                ...(product.gallery || [])
              ].filter(Boolean);
              
              // Always show gallery if there are images
              if (allImages.length > 0) {
                return (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all ${
                            selectedImageIndex === index
                              ? 'border-primary-600 ring-2 ring-primary-300 scale-105'
                              : 'border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.title} - Image ${index + 1}`}
                            className="w-full h-full object-contain bg-gray-50"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x80?text=Image';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    {allImages.length > 1 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {selectedImageIndex + 1} of {allImages.length} images
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Title */}
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{product.title}</h1>

            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Category */}
            <p className="text-sm text-gray-500 mb-4">Category: {product.category}</p>

            {/* Stock Status */}
            {product.status === 'hold' && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-red-800 font-bold text-lg">Stock Hold - Out of Stock</p>
                    <p className="text-red-600 text-sm">This product is currently unavailable for purchase</p>
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                Price: ₹{productPrice}
              </div>
              {quantity > 1 && (
                <div className="text-lg text-gray-600">
                  Total ({quantity} items): ₹{productPrice * quantity}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 flex items-center justify-center font-bold text-gray-700 hover:text-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-20 px-4 py-2 border-2 border-gray-300 rounded-lg text-center font-semibold text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 flex items-center justify-center font-bold text-gray-700 hover:text-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
                  disabled={quantity >= 10}
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  (Max 10)
                </span>
              </div>
            </div>

            {/* Buy Now Button - Hidden for Admin or Hold Products */}
            {!isAdmin && product.status !== 'hold' && (
              <button
                onClick={handleBuyNow}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Buy Now - ₹{productPrice * quantity} ({quantity} item{quantity > 1 ? 's' : ''})
              </button>
            )}
            {!isAdmin && product.status === 'hold' && (
              <div className="w-full px-6 py-3 bg-gray-400 text-white rounded-xl cursor-not-allowed text-center font-semibold opacity-60">
                Out of Stock - Cannot Purchase
              </div>
            )}
            {isAdmin && (
              <div className="w-full px-6 py-3 bg-gray-400 text-white rounded-xl cursor-not-allowed text-center font-semibold opacity-60">
                Admin cannot purchase products
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Checkout Form Modal */}
        {showCheckout && product && (
          <CheckoutForm
            product={product}
            quantity={quantity}
            totalPrice={productPrice * quantity}
            onClose={() => setShowCheckout(false)}
            onConfirm={handleOrderConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

