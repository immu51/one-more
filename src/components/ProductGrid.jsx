/**
 * ProductGrid component
 * Displays a grid of product cards with responsive layout
 */

import { motion } from 'framer-motion';
import ProductCard from './ProductCard.jsx';
import { ProductGridSkeleton } from './LoadingSkeleton.jsx';

/**
 * ProductGrid component
 * @param {object} props
 * @param {array} props.products - Array of product objects
 * @param {boolean} props.loading - Loading state
 */
const ProductGrid = ({ products = [], loading = false }) => {
  if (loading) {
    return <ProductGridSkeleton count={6} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;

