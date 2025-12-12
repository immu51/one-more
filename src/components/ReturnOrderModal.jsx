/**
 * ReturnOrderModal component
 * Modal for returning/exchanging delivered orders (similar to Flipkart)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast.jsx';

/**
 * ReturnOrderModal component
 * @param {object} props
 * @param {object} props.order - Order to return/exchange
 * @param {function} props.onClose - Callback to close modal
 * @param {function} props.onConfirm - Callback when return request is confirmed
 */
const ReturnOrderModal = ({ order, onClose, onConfirm }) => {
  const [requestType, setRequestType] = useState('return'); // 'return' or 'exchange'
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setToast({ message: 'Please provide a reason for return/exchange', type: 'error' });
      return;
    }

    // Update order in localStorage
    const orders = JSON.parse(localStorage.getItem('bidmaster_orders') || '[]');
    const updatedOrders = orders.map((o) =>
      o.id === order.id
        ? {
            ...o,
            returnRequest: {
              type: requestType,
              reason: reason,
              status: 'pending',
              requestedAt: new Date().toISOString(),
            },
            returnStatus: 'return_requested',
          }
        : o
    );
    localStorage.setItem('bidmaster_orders', JSON.stringify(updatedOrders));

    setToast({ 
      message: `${requestType === 'return' ? 'Return' : 'Exchange'} request submitted successfully!`, 
      type: 'success' 
    });
    
    setTimeout(() => {
      if (onConfirm) {
        onConfirm();
      }
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Return / Exchange</h2>
                <p className="text-blue-100 text-xs mt-0.5">
                  Order ID: {order.id.slice(-8)}
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
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800 text-sm">{order.productTitle}</p>
              <p className="text-xs text-gray-600">
                {order.quantity} × ₹{order.unitPrice} = ₹{order.totalPrice}
              </p>
              {order.deliveredAt && (
                <p className="text-xs text-gray-600">
                  Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Request Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Request Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType('return')}
                  className={`px-3 py-2 rounded-lg border-2 transition-all font-semibold text-sm ${
                    requestType === 'return'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Return
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('exchange')}
                  className={`px-3 py-2 rounded-lg border-2 transition-all font-semibold text-sm ${
                    requestType === 'exchange'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Exchange
                </button>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white resize-none"
                placeholder={`Why ${requestType}?`}
                required
              />
            </div>

            {/* Common Reasons */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Quick Select:</p>
              <div className="flex flex-wrap gap-1.5">
                {(requestType === 'return' ? [
                  'Product damaged/defective',
                  'Wrong product received',
                  'Product quality not as expected',
                  'Size/color mismatch',
                  'Changed my mind',
                  'Other',
                ] : [
                  'Wrong size',
                  'Wrong color',
                  'Product damaged',
                  'Want different variant',
                  'Other',
                ]).map((quickReason) => (
                  <button
                    key={quickReason}
                    type="button"
                    onClick={() => setReason(quickReason)}
                    className="px-2 py-1 text-xs border-2 border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    {quickReason}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> {requestType === 'return' 
                  ? 'Refund processed in 5-7 days after receiving product.'
                  : 'Exchange shipped after receiving original product.'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2 sticky bottom-0 bg-white pb-2">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Request
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

export default ReturnOrderModal;

