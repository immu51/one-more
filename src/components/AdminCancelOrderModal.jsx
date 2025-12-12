/**
 * AdminCancelOrderModal component
 * Modal for admin to cancel customer orders with reason
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast.jsx';

/**
 * AdminCancelOrderModal component
 * @param {object} props
 * @param {object} props.order - Order to cancel
 * @param {function} props.onClose - Callback to close modal
 * @param {function} props.onConfirm - Callback when cancellation is confirmed
 */
const AdminCancelOrderModal = ({ order, onClose, onConfirm }) => {
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
            cancelledBy: 'admin', // Track that admin cancelled
          }
        : o
    );
    localStorage.setItem('bidmaster_orders', JSON.stringify(updatedOrders));

    setToast({ message: 'Order cancelled successfully by admin', type: 'success' });
    
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
          className="bg-white rounded-xl shadow-2xl max-w-xs w-full relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h2 className="text-lg font-bold">Cancel Order</h2>
                <p className="text-red-100 text-xs mt-0.5">
                  Order ID: {order.id.slice(-8)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:scale-110 ml-2 flex-shrink-0"
                aria-label="Close"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800 text-sm">{order.productTitle}</p>
              <p className="text-xs text-gray-600">
                {order.quantity} × ₹{order.unitPrice} = ₹{order.totalPrice}
              </p>
              <p className="text-xs text-gray-600">
                {order.deliveryDetails.name} ({order.deliveryDetails.phone})
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            <div>
              <label htmlFor="reason" className="block text-xs font-semibold text-gray-700 mb-1">
                Reason (Admin) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-gray-50 focus:bg-white resize-none"
                placeholder="Provide cancellation reason..."
                required
              />
            </div>

            {/* Admin-specific Reasons */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Quick Select:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Product is not available',
                  'Out of stock',
                  'Delivery issue for this city',
                  'Delivery issue for this address',
                  'Payment failed',
                  'Invalid address',
                  'Customer request',
                  'Fraudulent order',
                  'Product damaged',
                  'Supplier issue',
                  'Other',
                ].map((quickReason) => (
                  <button
                    key={quickReason}
                    type="button"
                    onClick={() => setReason(quickReason)}
                    className="px-2 py-1 text-xs border-2 border-gray-300 rounded-md hover:border-red-500 hover:bg-red-50 transition-all"
                  >
                    {quickReason}
                  </button>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Order will be cancelled. Customer will be notified.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Keep Order
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl"
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

export default AdminCancelOrderModal;

