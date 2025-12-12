/**
 * ReviewCarousel component
 * Auto-playing carousel showing customer reviews
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarImageFallback } from '../utils/imageHelper.js';

/**
 * ReviewCarousel component
 * @param {object} props
 * @param {array} props.reviews - Array of review objects
 */
const ReviewCarousel = ({ reviews = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [reviews.length]);

  if (reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <div className="relative bg-gradient-to-b from-white via-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          What Our Customers Say
        </motion.h2>

        <div className="max-w-3xl mx-auto relative">
          {/* Review Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white rounded-2xl shadow-2xl p-10 text-center border border-gray-100"
            >
              {/* Avatar */}
              <motion.img
                src={currentReview.avatar}
                alt={currentReview.name}
                className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-primary-100 shadow-lg"
                onError={(e) => {
                  // Try fallback URL if local image fails to load
                  const fallbackUrl = getAvatarImageFallback(currentReview.avatar);
                  if (e.target.src !== fallbackUrl) {
                    e.target.src = fallbackUrl;
                  }
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              />

              {/* Name */}
              <motion.h3 
                className="text-2xl font-bold text-gray-800 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentReview.name}
              </motion.h3>

              {/* Rating */}
              <motion.div 
                className="flex justify-center gap-1 mb-6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className={`text-3xl ${
                      i < currentReview.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                  >
                    ★
                  </motion.span>
                ))}
              </motion.div>

              {/* Review Text */}
              <motion.p 
                className="text-gray-600 italic text-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                "{currentReview.text}"
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <>
              <motion.button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border border-gray-100"
                aria-label="Previous review"
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
              <motion.button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border border-gray-100"
                aria-label="Next review"
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </>
          )}

          {/* Dots Indicator */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {reviews.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary-600 w-10'
                      : 'bg-gray-300 w-3'
                  } h-3`}
                  aria-label={`Go to review ${index + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    width: index === currentIndex ? 40 : 12,
                    backgroundColor: index === currentIndex ? '#9333ea' : '#d1d5db',
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCarousel;

