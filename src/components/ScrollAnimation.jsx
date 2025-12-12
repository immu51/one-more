/**
 * ScrollAnimation component
 * Wrapper component for scroll-triggered animations using Framer Motion
 */

import { motion } from 'framer-motion';

/**
 * ScrollAnimation component
 * @param {object} props
 * @param {ReactNode} props.children - Child components to animate
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.direction - Animation direction: 'up', 'down', 'left', 'right', 'fade'
 * @param {number} props.delay - Animation delay in seconds
 */
const ScrollAnimation = ({ 
  children, 
  className = '', 
  direction = 'up',
  delay = 0 
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
      scale: direction === 'fade' ? 0.9 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;

