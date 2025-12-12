/**
 * ProductCard component
 * Displays a single product with image, title, price, and action buttons
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getProductImageFallback } from '../utils/imageHelper.js';

/**
 * ProductCard component
 * @param {object} props
 * @param {object} props.product - Product object with id, title, image, etc.
 */
const ProductCard = ({ product }) => {
  const { isAdmin } = useAuth();
  const displayPrice = `₹${product.price || product.buyNowPrice || 0}`;
  const isOnHold = product.status === 'hold';

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden group border border-gray-100 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Product Image */}
      <Link to={`/products/${product.id}`}>
        <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 flex items-center justify-center">
          <motion.img
            src={product.primaryImage || product.image}
            alt={product.title}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              // Try fallback URL if local image fails to load
              const imageUrl = product.primaryImage || product.image;
              const fallbackUrl = getProductImageFallback(imageUrl);
              if (e.target.src !== fallbackUrl) {
                e.target.src = fallbackUrl;
              }
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
          {/* Gallery indicator */}
          {product.gallery && product.gallery.length > 0 && (
            <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              +{product.gallery.length}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-primary-600 transition-colors line-clamp-1 min-h-[1.75rem]">
            {product.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] flex-grow">
          {product.description}
        </p>

        {/* Price */}
        <div className="mb-5 min-h-[3.5rem]">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            {displayPrice}
          </span>
        </div>

        {/* Stock Hold Badge */}
        {isOnHold && (
          <div className="mb-3">
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
              ⚠️ Hold - Out of Stock
            </span>
          </div>
        )}

        {/* Action Buttons - Hide Buy Now for Admin or Hold Products */}
        {!isAdmin && !isOnHold && (
          <motion.div 
            className="flex gap-2 mt-auto"
            whileHover={{ scale: 1.02 }}
          >
            <Link
              to={`/products/${product.id}`}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all text-center font-semibold shadow-lg hover:shadow-xl"
            >
              Buy Now
            </Link>
          </motion.div>
        )}
        {!isAdmin && isOnHold && (
          <motion.div 
            className="flex gap-2 mt-auto"
          >
            <div className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-xl cursor-not-allowed text-center font-semibold opacity-60">
              Out of Stock
            </div>
          </motion.div>
        )}
        {isAdmin && (
          <motion.div 
            className="flex gap-2 mt-auto"
            whileHover={{ scale: 1.02 }}
          >
            <Link
              to={`/products/${product.id}`}
              className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-xl cursor-not-allowed text-center font-semibold opacity-60"
              onClick={(e) => e.preventDefault()}
            >
              View Details
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;

