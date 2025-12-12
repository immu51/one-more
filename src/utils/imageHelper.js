/**
 * Image Helper Utility
 * Provides fallback URLs for images if local assets are not available
 * This ensures images work even if local assets haven't been added yet
 */

// Fallback URLs for products (hosted images)
const productFallbacks = {
  'vintage-watch.png': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  'designer-handbag.png': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
  'smartphone.png': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  'persian-rug.png': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500',
  'gaming-laptop.png': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
  'camera-collection.png': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500',
};

// Fallback URLs for avatars (hosted images)
const avatarFallbacks = {
  'sarah-johnson.png': 'https://i.pravatar.cc/150?img=47',
  'michael-chen.png': 'https://i.pravatar.cc/150?img=33',
  'emily-davis.png': 'https://i.pravatar.cc/150?img=20',
};

/**
 * Get fallback URL for an image
 * Returns hosted fallback URL if local asset doesn't exist
 * @param {string} localPath - Local asset path (e.g., '/assets/images/products/vintage-watch.png')
 * @returns {string} Fallback URL or placeholder
 */
export const getFallbackUrl = (localPath) => {
  if (!localPath) {
    return 'https://via.placeholder.com/500x300?text=No+Image';
  }

  // Extract filename from path
  const filename = localPath.split('/').pop();
  
  // Check if it's a product image
  if (localPath.includes('/products/')) {
    return productFallbacks[filename] || 'https://via.placeholder.com/500x300?text=No+Image';
  }
  
  // Check if it's an avatar image
  if (localPath.includes('/avatars/')) {
    return avatarFallbacks[filename] || 'https://via.placeholder.com/150x150?text=User';
  }
  
  // Return placeholder if no fallback found
  return 'https://via.placeholder.com/500x300?text=No+Image';
};

/**
 * Get product image fallback
 * @param {string} imagePath - Product image path
 * @returns {string} Fallback URL
 */
export const getProductImageFallback = (imagePath) => {
  return getFallbackUrl(imagePath);
};

/**
 * Get avatar image fallback
 * @param {string} avatarPath - Avatar image path
 * @returns {string} Fallback URL
 */
export const getAvatarImageFallback = (avatarPath) => {
  return getFallbackUrl(avatarPath);
};

