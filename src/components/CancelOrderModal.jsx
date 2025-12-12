/**
 * CancelOrderModal component
 * Modal for cancelling orders with reason
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast.jsx';

/**
 * CancelOrderModal component
 * @param {object} props
 * @param {object} props.order - Order to cancel
 * @param {function} props.onClose - Callback to close modal
 * @param {function} props.onConfirm - Callback when cancellation is confirmed
 */
const CancelOrderModal = ({ order, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setToast({ message: 'Please provide a cancellation reason', type: 'error' });
      return;
    }

    // Update order in localStorage
    const orders = JSON.parse(localStorage.getItem('bidmaster_orders') || '[]');
    const updatedOrders = orders.map((o) =>
      o.id === order.id
        ? {
            ...o,
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            cancelledBy: 'customer', // Track that customer cancelled
          }
        : o
    );
    localStorage.setItem('bidmaster_orders', JSON.stringify(updatedOrders));

    setToast({ message: 'Order cancelled successfully', type: 'success' });
    
    setTimeout(() => {
      if (onConfirm) {
        onConfirm();
      }
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Cancel Order</h2>
                <p className="text-red-100 text-sm mt-1">
                  Order ID: {order.id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="space-y-2">
              <p className="font-semibold text-gray-800">{order.productTitle}</p>
              <p className="text-sm text-gray-600">
                Quantity: {order.quantity} × ₹{order.unitPrice} = ₹{order.totalPrice}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-gray-50 focus:bg-white resize-none"
                placeholder="Please tell us why you are cancelling this order..."
                required
              />
            </div>

            {/* Common Reasons */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Changed my mind',
                  'Found better price elsewhere',
                  'Wrong product ordered',
                  'Delivery address issue',
                  'Payment issue',
                  'Other',
                ].map((quickReason) => (
                  <button
                    key={quickReason}
                    type="button"
                    onClick={() => setReason(quickReason)}
                    className="px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
                  >
                    {quickReason}
                  </button>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Once cancelled, this order cannot be restored. Are you sure you want to proceed?
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Keep Order
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel Order
              </motion.button>
            </div>
          </form>

          {/* Toast */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CancelOrderModal;

