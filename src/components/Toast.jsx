/**
 * Toast component for notifications
 * Shows success/error messages that auto-dismiss after a few seconds
 */

import { useEffect } from 'react';

/**
 * Toast component
 * @param {object} props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type: 'success' or 'error'
 * @param {function} props.onClose - Callback when toast closes
 */
const Toast = ({ message, type = 'success', onClose }) => {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
        type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      <span className="font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 font-bold"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

