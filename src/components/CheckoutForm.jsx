/**
 * CheckoutForm component
 * Delivery details form similar to Zomato checkout
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage.js';

/**
 * CheckoutForm component
 * @param {object} props
 * @param {object} props.product - Product being purchased
 * @param {number} props.quantity - Quantity of items
 * @param {number} props.totalPrice - Total price
 * @param {function} props.onClose - Callback to close form
 * @param {function} props.onConfirm - Callback when order is confirmed
 */
const CheckoutForm = ({ product, quantity, totalPrice, onClose, onConfirm }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    landmark: '',
    deliveryInstructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'wallet', 'online'
  const [onlinePaymentMethod, setOnlinePaymentMethod] = useState(''); // 'paytm', 'phonepe', 'googlepay'
  const [walletBalance, setWalletBalance] = useState(0);
  const [toast, setToast] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Payment Method, 2: Delivery Details

  // Load wallet balance
  useEffect(() => {
    if (user) {
      const wallets = getFromStorage(STORAGE_KEYS.WALLETS, {});
      setWalletBalance(wallets[user.id] || 0);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    // Validate phone number (10 digits)
    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      setToast({ message: 'Please enter a valid 10-digit phone number', type: 'error' });
      return;
    }

    // Validate pincode (6 digits)
    if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
      setToast({ message: 'Please enter a valid 6-digit pincode', type: 'error' });
      return;
    }

    // Validate payment method
    if (paymentMethod === 'wallet' && walletBalance < totalPrice) {
      setToast({ 
        message: `Insufficient wallet balance. Your balance is ₹${walletBalance}`, 
        type: 'error' 
      });
      setCurrentStep(1);
      return;
    }

    if (paymentMethod === 'online' && !onlinePaymentMethod) {
      setToast({ 
        message: 'Please select a payment app', 
        type: 'error' 
      });
      setCurrentStep(1);
      return;
    }

    setProcessingPayment(true);

    // Process payment based on method
    let paymentStatus = 'pending';
    let paymentDetails = { method: paymentMethod };

    if (paymentMethod === 'wallet') {
      // Deduct from wallet
      const wallets = getFromStorage(STORAGE_KEYS.WALLETS, {});
      wallets[user.id] = (wallets[user.id] || 0) - totalPrice;
      saveToStorage(STORAGE_KEYS.WALLETS, wallets);
      setWalletBalance(wallets[user.id]);
      paymentStatus = 'paid';
      paymentDetails = { method: 'wallet', deducted: totalPrice, balance: wallets[user.id] };
    } else if (paymentMethod === 'online') {
      // Simulate online payment processing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      paymentStatus = 'paid';
      paymentDetails = { 
        method: 'online', 
        app: onlinePaymentMethod,
        transactionId: `TXN${Date.now()}` 
      };
    } else if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
      paymentDetails = { method: 'cod', payableOnDelivery: totalPrice };
    }

    // Save order to localStorage
    const orders = getFromStorage('bidmaster_orders', []);
    const newOrder = {
      id: `order-${Date.now()}`,
      userId: user?.id,
      productId: product.id,
      productTitle: product.title,
      quantity,
      totalPrice,
      unitPrice: product.price || product.buyNowPrice || 0,
      deliveryDetails: formData,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paymentDetails: paymentDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    saveToStorage('bidmaster_orders', orders);

    setProcessingPayment(false);
    setToast({ 
      message: paymentMethod === 'cod' 
        ? 'Order placed successfully! Pay on delivery.' 
        : 'Order placed successfully! Payment completed.',
      type: 'success' 
    });
    
    // Call onConfirm after a delay
    setTimeout(() => {
      if (onConfirm) {
        onConfirm(newOrder);
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {currentStep === 1 ? 'Payment Method' : 'Delivery Details'}
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  {product.title} × {quantity}
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

          {/* Order Summary */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Item Price ({quantity} × ₹{product.buyNowPrice})</span>
                <span className="font-medium">₹{product.buyNowPrice * quantity}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Total Amount</span>
                <span className="text-primary-600">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="ml-2 font-semibold">Payment</span>
              </div>
              <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="ml-2 font-semibold">Delivery</span>
              </div>
            </div>
          </div>

          {/* Step 1: Payment Method Selection */}
          {currentStep === 1 && (
            <div className="p-6 space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Choose Payment Method</h3>
              
              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'cod' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setOnlinePaymentMethod('');
                    }}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      💵 Cash on Delivery
                    </div>
                    <div className="text-sm text-gray-600">Pay ₹{totalPrice} when you receive</div>
                  </div>
                </label>

                {/* Wallet Payment */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'wallet' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                } ${walletBalance < totalPrice ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setOnlinePaymentMethod('');
                    }}
                    disabled={walletBalance < totalPrice}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      💳 Wallet
                      <span className="text-xs font-normal text-gray-600">
                        (Balance: ₹{walletBalance})
                      </span>
                    </div>
                    {walletBalance < totalPrice ? (
                      <div className="text-sm text-red-600">Insufficient balance. Add ₹{totalPrice - walletBalance} more</div>
                    ) : (
                      <div className="text-sm text-gray-600">Pay from your wallet balance</div>
                    )}
                  </div>
                </label>

                {/* Online Payment */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'online' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setOnlinePaymentMethod('');
                    }}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      🌐 Online Payment
                    </div>
                    <div className="text-sm text-gray-600">Pay via Paytm, PhonePe, or Google Pay</div>
                  </div>
                </label>
              </div>

              {/* Online Payment Options */}
              {paymentMethod === 'online' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Payment App <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setOnlinePaymentMethod('paytm')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        onlinePaymentMethod === 'paytm'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">💙</div>
                      <div className="text-xs font-semibold text-gray-700">Paytm</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlinePaymentMethod('phonepe')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        onlinePaymentMethod === 'phonepe'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">💜</div>
                      <div className="text-xs font-semibold text-gray-700">PhonePe</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlinePaymentMethod('googlepay')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        onlinePaymentMethod === 'googlepay'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">💚</div>
                      <div className="text-xs font-semibold text-gray-700">Google Pay</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    if (paymentMethod === 'online' && !onlinePaymentMethod) {
                      setToast({ message: 'Please select a payment app', type: 'error' });
                      return;
                    }
                    if (paymentMethod === 'wallet' && walletBalance < totalPrice) {
                      setToast({ message: 'Insufficient wallet balance', type: 'error' });
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue to Delivery
                </motion.button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Details Form */}
          {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="10-digit mobile number"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                Complete Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white resize-none"
                placeholder="House/Flat No., Building Name, Street"
                required
              />
            </div>

            {/* City and Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength="6"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="6-digit pincode"
                  required
                />
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label htmlFor="landmark" className="block text-sm font-semibold text-gray-700 mb-2">
                Nearby Place / Landmark
              </label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="e.g., Near Metro Station, Opposite Mall, etc."
              />
            </div>

            {/* Delivery Instructions */}
            <div>
              <label htmlFor="deliveryInstructions" className="block text-sm font-semibold text-gray-700 mb-2">
                Delivery Instructions (Optional)
              </label>
              <textarea
                id="deliveryInstructions"
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white resize-none"
                placeholder="Any special instructions for delivery"
              />
            </div>

            {/* Payment Method Summary */}
            <div className="border-t border-gray-200 pt-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <p className="font-semibold text-gray-800 capitalize">
                      {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                      {paymentMethod === 'wallet' && '💳 Wallet'}
                      {paymentMethod === 'online' && `🌐 ${onlinePaymentMethod === 'paytm' ? 'Paytm' : onlinePaymentMethod === 'phonepe' ? 'PhonePe' : onlinePaymentMethod === 'googlepay' ? 'Google Pay' : 'Online Payment'}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={processingPayment}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: processingPayment ? 1 : 1.02 }}
                whileTap={{ scale: processingPayment ? 1 : 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                type="submit"
                disabled={processingPayment || (paymentMethod === 'wallet' && walletBalance < totalPrice)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: processingPayment ? 1 : 1.02 }}
                whileTap={{ scale: processingPayment ? 1 : 0.98 }}
              >
                {processingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Confirm Order - ₹${totalPrice}`
                )}
              </motion.button>
            </div>
          </form>
          )}

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

export default CheckoutForm;

