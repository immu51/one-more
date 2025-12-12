/**
 * OrderReceipt component
 * Printable receipt for orders with barcode
 */

import { useRef } from 'react';
import { appConfig } from '../config/appConfig.js';

/**
 * OrderReceipt component
 * @param {object} props
 * @param {object} props.order - Order object
 * @param {function} props.onClose - Callback to close receipt
 */
const OrderReceipt = ({ order, onClose }) => {
  const receiptRef = useRef(null);

  // Generate simple barcode (text representation)
  const generateBarcode = (orderId) => {
    // Simple barcode representation using order ID
    const barcodeValue = orderId.replace(/[^0-9]/g, '').slice(-12) || '123456789012';
    return barcodeValue.match(/.{1,2}/g)?.join(' ') || barcodeValue;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const receiptContent = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${order.id}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              max-width: 80mm;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .receipt {
              border: 2px dashed #000;
              padding: 15px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              font-size: 12px;
            }
            .section {
              margin: 15px 0;
              padding: 10px 0;
              border-top: 1px dashed #000;
            }
            .section-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            .barcode {
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              background: #f5f5f5;
              border: 1px solid #000;
            }
            .barcode-text {
              font-family: 'Courier New', monospace;
              font-size: 18px;
              letter-spacing: 3px;
              font-weight: bold;
              margin: 10px 0;
            }
            .barcode-lines {
              font-size: 24px;
              line-height: 1;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px solid #000;
              font-size: 10px;
            }
            .total {
              font-size: 16px;
              font-weight: bold;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const barcodeValue = generateBarcode(order.id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Order Receipt</h2>
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

        {/* Receipt Preview */}
        <div className="p-6">
          <div ref={receiptRef} className="receipt bg-white border-2 border-dashed border-gray-400 p-4">
            {/* Receipt Header */}
            <div className="header text-center border-b-2 border-black pb-2 mb-4">
              <h1 className="text-2xl font-bold mb-2">{appConfig.appName}</h1>
              <p className="text-xs">{appConfig.ownerAddress}</p>
              <p className="text-xs">Phone: {appConfig.ownerPhone}</p>
              <p className="text-xs">Email: {appConfig.ownerEmail}</p>
            </div>

            {/* Order Info */}
            <div className="section">
              <div className="section-title">Order Details</div>
              <div className="row">
                <span>Order ID:</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="row">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.deliveredAt && (
                <div className="row">
                  <span>Delivered:</span>
                  <span>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="row">
                <span>Status:</span>
                <span className="font-bold uppercase">{order.status}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="section">
              <div className="section-title">Customer Information</div>
              <div className="row">
                <span>Name:</span>
                <span className="font-bold">{order.deliveryDetails.name}</span>
              </div>
              <div className="row">
                <span>Phone:</span>
                <span>{order.deliveryDetails.phone}</span>
              </div>
              <div className="row">
                <span>Address:</span>
                <span className="text-right max-w-[60%]">{order.deliveryDetails.address}</span>
              </div>
              <div className="row">
                <span>City:</span>
                <span>{order.deliveryDetails.city} - {order.deliveryDetails.pincode}</span>
              </div>
              {order.deliveryDetails.landmark && (
                <div className="row">
                  <span>Landmark:</span>
                  <span>{order.deliveryDetails.landmark}</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="section">
              <div className="section-title">Product Details</div>
              <div className="row">
                <span>Product:</span>
                <span className="font-bold text-right max-w-[60%]">{order.productTitle}</span>
              </div>
              <div className="row">
                <span>Quantity:</span>
                <span>{order.quantity}</span>
              </div>
              <div className="row">
                <span>Unit Price:</span>
                <span>₹{order.unitPrice}</span>
              </div>
              <div className="row">
                <span>Subtotal:</span>
                <span>₹{order.unitPrice * order.quantity}</span>
              </div>
            </div>

            {/* Payment Information */}
            {order.paymentMethod && (
              <div className="section">
                <div className="section-title">Payment Information</div>
                <div className="row">
                  <span>Payment Method:</span>
                  <span className="font-bold capitalize">
                    {order.paymentMethod === 'cod' && 'Cash on Delivery'}
                    {order.paymentMethod === 'wallet' && 'Wallet'}
                    {order.paymentMethod === 'online' && (
                      order.paymentDetails?.app 
                        ? order.paymentDetails.app === 'paytm' ? 'Paytm' 
                        : order.paymentDetails.app === 'phonepe' ? 'PhonePe'
                        : order.paymentDetails.app === 'googlepay' ? 'Google Pay'
                        : 'Online Payment'
                        : 'Online Payment'
                    )}
                  </span>
                </div>
                <div className="row">
                  <span>Payment Status:</span>
                  <span className="font-bold uppercase">
                    {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                  </span>
                </div>
                {order.paymentDetails?.transactionId && (
                  <div className="row">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-xs">{order.paymentDetails.transactionId}</span>
                  </div>
                )}
                {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                  <div className="row">
                    <span>Payable on Delivery:</span>
                    <span className="font-bold">₹{order.totalPrice}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total */}
            <div className="section">
              <div className="row total">
                <span>TOTAL AMOUNT:</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>

            {/* Barcode */}
            <div className="barcode text-center mt-4 p-3 bg-gray-100 border border-black">
              <div className="barcode-lines">▌ ▌ ▐ ▐ ▐ ▌ ▐ ▌ ▐</div>
              <div className="barcode-text">{barcodeValue}</div>
              <div className="barcode-lines">▌ ▌ ▐ ▐ ▐ ▌ ▐ ▌ ▐</div>
              <p className="text-xs mt-2">Order ID: {order.id}</p>
            </div>

            {/* Footer */}
            <div className="footer text-center mt-4 pt-2 border-t-2 border-black text-xs">
              <p>Thank you for your order!</p>
              <p className="mt-2">Visit us at: {appConfig.ownerEmail}</p>
              <p className="mt-1">© {appConfig.copyrightYear} {appConfig.appName}. All rights reserved.</p>
            </div>
          </div>

          {/* Print Button */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;

