/**
 * Home page
 * Main landing page with hero, features, products, reviews, and contact sections
 */

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductGrid from '../components/ProductGrid.jsx';
import ReviewCarousel from '../components/ReviewCarousel.jsx';
import ContactForm from '../components/ContactForm.jsx';
import ScrollAnimation from '../components/ScrollAnimation.jsx';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage.js';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { appConfig } from '../config/appConfig.js';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleBrowseProducts = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/products');
    }
  };

  useEffect(() => {
    // Load reviews
    const allReviews = getFromStorage(STORAGE_KEYS.REVIEWS, []);
    setReviews(allReviews);

    // Only load products if user is authenticated
    if (isAuthenticated) {
      const allProducts = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
      // Show live and hold products (hide only draft products)
      const visibleProducts = allProducts.filter(p => p.status === 'live' || p.status === 'hold').slice(0, 8);
      setProducts(visibleProducts);
    }

    setLoading(false);
  }, [isAuthenticated]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-500 via-pink-500 to-purple-700 text-white py-20 md:py-32 overflow-hidden">
        {/* Animated gradient background with particles effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 via-pink-500 to-purple-700 animate-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome to {appConfig.appName}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-10 text-purple-100 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {appConfig.appDescription}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                onClick={handleBrowseProducts}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Products
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 inline-block backdrop-blur-sm bg-white/10"
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation direction="fade" delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-800">
              Why Choose {appConfig.appName}?
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Experience the best in online bidding and shopping
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <ScrollAnimation direction="up" delay={0.2}>
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-primary-500/50 transition-shadow"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Secure Bidding</h3>
                <p className="text-gray-600 leading-relaxed">
                  Safe and transparent bidding process with real-time updates and secure transactions.
                </p>
              </motion.div>
            </ScrollAnimation>

            {/* Feature 2 */}
            <ScrollAnimation direction="up" delay={0.3}>
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-primary-500/50 transition-shadow"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Best Prices</h3>
                <p className="text-gray-600 leading-relaxed">
                  Competitive pricing with both auction and direct purchase options to suit your needs.
                </p>
              </motion.div>
            </ScrollAnimation>

            {/* Feature 3 */}
            <ScrollAnimation direction="up" delay={0.4}>
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-primary-500/50 transition-shadow"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Quick and reliable shipping to get your purchases delivered to your doorstep.
                </p>
              </motion.div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Products Section - Only visible when logged in */}
      {isAuthenticated && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <ScrollAnimation direction="fade" delay={0.1}>
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                  Featured Products
                </h2>
                <motion.button
                  onClick={handleBrowseProducts}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-lg flex items-center gap-2 group"
                  whileHover={{ x: 5 }}
                >
                  View All
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </motion.button>
              </div>
            </ScrollAnimation>
            <ProductGrid products={products} loading={loading} />
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <ReviewCarousel reviews={reviews} />

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation direction="fade" delay={0.2}>
            <ContactForm />
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default Home;

