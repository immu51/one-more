/**
 * Customer Dashboard page
 * Shows user's profile and orders
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage.js';
import CancelOrderModal from '../components/CancelOrderModal.jsx';
import ReturnOrderModal from '../components/ReturnOrderModal.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Load wallet balance
    const wallets = getFromStorage(STORAGE_KEYS.WALLETS, {});
    setWalletBalance(wallets[user.id] || 0);

    // Load user's orders
    const allOrders = getFromStorage('bidmaster_orders', []);
    const userOrders = allOrders
      .filter(order => order.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(userOrders);

    // Load products
    const allProducts = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
    setProducts(allProducts);
  }, [user]);

  const handleCancelOrder = (order) => {
    setCancelOrder(order);
  };

  const handleCancelConfirm = () => {
    // Reload orders after cancellation
    const allOrders = JSON.parse(localStorage.getItem('bidmaster_orders') || '[]');
    const userOrders = allOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(userOrders);
    setCancelOrder(null);
  };

  const handleReturnOrder = (order) => {
    setReturnOrder(order);
  };

  const handleReturnConfirm = () => {
    // Reload orders after return request
    const allOrders = JSON.parse(localStorage.getItem('bidmaster_orders') || '[]');
    const userOrders = allOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(userOrders);
    setReturnOrder(null);
  };

  const getProductById = (productId) => {
    return products.find((p) => p.id === productId);
  };

  const handleRecharge = () => {
    const amount = parseFloat(rechargeAmount);
    if (!amount || amount < 1) {
      setToast({ message: 'Please enter a valid amount (minimum ₹1)', type: 'error' });
      return;
    }

    const wallets = getFromStorage(STORAGE_KEYS.WALLETS, {});
    wallets[user.id] = (wallets[user.id] || 0) + amount;
    saveToStorage(STORAGE_KEYS.WALLETS, wallets);
    setWalletBalance(wallets[user.id]);
    setToast({ message: `₹${amount} added to wallet successfully!`, type: 'success' });
    setRechargeAmount('');
    setShowRechargeModal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Please login to view your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">My Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Profile</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>
                  <p className="font-semibold text-gray-800 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Wallet Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-md p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Wallet Balance</h2>
              <div className="text-4xl font-extrabold mb-4">₹{walletBalance}</div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="w-full px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Add Money
              </button>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">My Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                  <Link
                    to="/products"
                    className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const product = getProductById(order.productId);
                    return (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            {product ? (
                              <Link
                                to={`/products/${product.id}`}
                                className="text-lg font-semibold text-primary-600 hover:text-primary-700"
                              >
                                {order.productTitle}
                              </Link>
                            ) : (
                              <span className="text-lg font-semibold text-gray-800">
                                {order.productTitle}
                              </span>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Order ID: {order.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-600">₹{order.totalPrice}</p>
                            <p className="text-sm text-gray-500">
                              {order.quantity} × ₹{order.unitPrice}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Status:</span>{' '}
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </p>
                              {order.paymentMethod && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Payment:</span>{' '}
                                  <span className="capitalize">{order.paymentMethod}</span>
                                  {order.paymentStatus && (
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                            {/* Show Cancel for non-delivered orders, Return/Exchange for delivered */}
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => handleCancelOrder(order)}
                                className="px-4 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                              >
                                Cancel Order
                              </button>
                            )}
                            {order.status === 'delivered' && !order.returnRequest && (
                              <button
                                onClick={() => handleReturnOrder(order)}
                                className="px-4 py-1.5 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                              >
                                Return / Exchange
                              </button>
                            )}
                          </div>
                          {/* Cancellation Info */}
                          {order.status === 'cancelled' && order.cancellationReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                              <p className="text-sm font-semibold text-red-800 mb-1">Cancellation Reason:</p>
                              <p className="text-sm text-red-700">{order.cancellationReason}</p>
                              {order.cancelledAt && (
                                <p className="text-xs text-red-600 mt-1">
                                  Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Return Request Info */}
                          {order.returnRequest && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                              <p className="text-sm font-semibold text-blue-800 mb-1">
                                {order.returnRequest.type === 'return' ? 'Return' : 'Exchange'} Request: 
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                  order.returnRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.returnRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  order.returnRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.returnRequest.status.charAt(0).toUpperCase() + order.returnRequest.status.slice(1)}
                                </span>
                              </p>
                              <p className="text-sm text-blue-700">{order.returnRequest.reason}</p>
                              {order.returnRequest.requestedAt && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Requested on: {new Date(order.returnRequest.requestedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Delivery Info */}
                          {order.status !== 'cancelled' && (
                            <>
                              {order.status === 'delivered' && order.deliveredAt && (
                                <p className="text-sm text-green-600 mt-2 font-semibold">
                                  ✓ Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-semibold">Delivery to:</span> {order.deliveryDetails.address}, {order.deliveryDetails.city} - {order.deliveryDetails.pincode}
                              </p>
                              {order.deliveryDetails.landmark && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Near: {order.deliveryDetails.landmark}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Order Modal */}
        {cancelOrder && (
          <CancelOrderModal
            order={cancelOrder}
            onClose={() => setCancelOrder(null)}
            onConfirm={handleCancelConfirm}
          />
        )}

        {/* Return Order Modal */}
        {returnOrder && (
          <ReturnOrderModal
            order={returnOrder}
            onClose={() => setReturnOrder(null)}
            onConfirm={handleReturnConfirm}
          />
        )}

        {/* Recharge Modal */}
        {showRechargeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Add Money to Wallet</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRechargeAmount('100')}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ₹100
                  </button>
                  <button
                    onClick={() => setRechargeAmount('500')}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ₹500
                  </button>
                  <button
                    onClick={() => setRechargeAmount('1000')}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ₹1000
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowRechargeModal(false);
                      setRechargeAmount('');
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecharge}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    Add Money
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

