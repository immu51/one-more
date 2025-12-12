/**
 * ContactForm component
 * Form for users to send messages/contact support
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Toast from './Toast.jsx';

/**
 * ContactForm component
 * @param {function} props.onSubmit - Callback when form is submitted
 */
const ContactForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    // Log to console (in real app, send to API)
    console.log('Contact form submitted:', formData);

    // Save to localStorage (mock)
    const contacts = JSON.parse(localStorage.getItem('bidmaster_contacts') || '[]');
    contacts.push({
      ...formData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('bidmaster_contacts', JSON.stringify(contacts));

    // Show success toast
    setToast({ message: 'Thank you! Your message has been sent.', type: 'success' });

    // Reset form
    setFormData({ name: '', email: '', message: '' });

    // Call parent callback if provided
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl mx-auto border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 
        className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-800 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Get In Touch
      </motion.h2>
      <motion.p 
        className="text-center text-gray-600 mb-8 text-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
      </motion.p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
            required
          />
        </motion.div>

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
            required
          />
        </motion.div>

        {/* Message Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white resize-none"
            required
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Send Message
        </motion.button>
      </form>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  );
};

export default ContactForm;

