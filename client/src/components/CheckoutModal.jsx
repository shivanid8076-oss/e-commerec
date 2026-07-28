import { useState } from 'react';
import api from '../utils/api';
import '../styles/CheckoutModal.css';

const CheckoutModal = ({ product, selectedSize, quantity, cartMode, cartItems, subtotal, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    pincode: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    upiId: ''
  });

  const isCart = !!cartMode;
  const priceToPay = isCart ? subtotal : (product.salePrice || product.price) * quantity;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const productNameToSave = isCart ? cartItems.map(i => `${i.quantity}x ${i.title}`).join(', ') : product.title;
      const productIdToSave = isCart ? 'CART' : product.id;
      const sizeToSave = isCart ? 'MIXED' : selectedSize;
      const quantityToSave = isCart ? cartItems.reduce((acc, curr) => acc + curr.quantity, 0) : quantity;

      // Save order to backend
      await api.post('/orders', {
        ...shippingInfo,
        productId: productIdToSave,
        productName: productNameToSave,
        size: sizeToSave,
        quantity: quantityToSave,
        totalPrice: priceToPay,
        paymentMethod: 'UPI (' + paymentInfo.upiId + ')'
      });

      setStep(3); // Success
    } catch (err) {
      alert("Payment simulation failed or server error. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal animate-up">
        <button className="checkout-close" onClick={onClose} disabled={isProcessing}>✕</button>
        
        {/* Order Summary Sidebar (Hidden on mobile by default) */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {isCart ? (
            <div className="cart-summary-list" style={{maxHeight: '200px', overflowY: 'auto'}}>
              {cartItems.map((item, idx) => (
                <div key={idx} className="summary-item-card" style={{marginBottom: '10px'}}>
                  <img src={item.image} alt={item.title} />
                  <div className="summary-item-info">
                    <h4 style={{fontSize: '0.9rem'}}>{item.title}</h4>
                    <span className="summary-size">Size: {item.size}</span>
                    <span className="summary-qty">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="summary-item-card">
              <img src={product.images?.[0] || product.image} alt={product.title} />
              <div className="summary-item-info">
                <h4>{product.title}</h4>
                <span className="summary-size">Size: {selectedSize}</span>
                <span className="summary-qty">Qty: {quantity}</span>
              </div>
              <div className="summary-item-price">
                ₹{(product.salePrice || product.price).toLocaleString('en-IN')}
              </div>
            </div>
          )}
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{priceToPay.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{color: 'var(--color-success)'}}>Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{priceToPay.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Checkout Forms */}
        <div className="checkout-content">
          {/* Progress Indicator */}
          <div className="checkout-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Shipping</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step === 3 ? 'active' : ''}`}>3. Complete</div>
          </div>

          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="checkout-form">
              <h2>Shipping Details</h2>
              <p>Where should we deliver your divine poshak?</p>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input required type="text" value={shippingInfo.customerName} onChange={e => setShippingInfo({...shippingInfo, customerName: e.target.value})} placeholder="e.g. Radhika Sharma" />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input required type="email" value={shippingInfo.email} onChange={e => setShippingInfo({...shippingInfo, email: e.target.value})} placeholder="radhika@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input required type="tel" value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} placeholder="+91 9876543210" />
                </div>
              </div>

              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea required rows="2" value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} placeholder="House/Flat No, Street, Landmark..."></textarea>
              </div>

              <div className="form-group" style={{maxWidth: '200px'}}>
                <label>Pincode *</label>
                <input required type="text" value={shippingInfo.pincode} onChange={e => setShippingInfo({...shippingInfo, pincode: e.target.value})} placeholder="e.g. 110001" />
              </div>

              <button type="submit" className="checkout-btn">Continue to Payment ➔</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="checkout-form">
              <h2>UPI Payment</h2>
              <p>Scan the QR code below or enter your UPI ID to pay securely.</p>
              
              <div className="upi-payment-box">
                <div className="qr-container">
                  <div className="qr-placeholder">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="UPI QR Code" style={{width: '150px', height: '150px'}} />
                  </div>
                  <p>Scan with PhonePe, GPay, or Paytm</p>
                </div>
                
                <div className="or-divider"><span>OR</span></div>
                
                <div className="form-group">
                  <label>Enter UPI ID</label>
                  <input required type="text" value={paymentInfo.upiId} onChange={e => setPaymentInfo({upiId: e.target.value})} placeholder="e.g. yourname@okicici" />
                </div>
              </div>

              <div className="payment-actions">
                <button type="button" className="checkout-btn-secondary" onClick={() => setStep(1)} disabled={isProcessing}>
                  ← Back
                </button>
                <button type="submit" className="checkout-btn" disabled={isProcessing}>
                  {isProcessing ? 'Processing Payment...' : `Pay ₹${priceToPay.toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="checkout-success">
              <div className="success-icon">✅</div>
              <h2>Payment Successful!</h2>
              <p>Thank you for shopping with Rishigyan.</p>
              <p className="order-note">Your divine poshak is being prepared for dispatch. You will receive an email confirmation shortly.</p>
              
              <button onClick={() => { onSuccess ? onSuccess() : onClose(); window.location.href = '/dashboard'; }} className="checkout-btn" style={{marginTop: '2rem'}}>
                View My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
