import { useEffect, useState } from 'react';
import '../styles/CartDrawer.css';
import CheckoutModal from './CheckoutModal';

const CartDrawer = ({ isOpen, onClose, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = () => {
    try {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(storedCart);
    } catch (e) {
      setCartItems([]);
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCartItems(newCart);
    if (onCartUpdate) onCartUpdate();
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cartItems];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    saveCart(newCart);
  };

  const removeItem = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    saveCart(newCart);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  return (
    <>
      <div 
        className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Your cart is empty.</p>
              <button className="btn btn-primary" onClick={onClose} style={{marginTop: '15px'}}>Continue Shopping</button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
                <img src={item.image} alt={item.title} className="cart-item-img" />
                <div className="cart-item-details">
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-size">Size: {item.size}</div>
                  <div className="cart-item-controls">
                    <div className="cart-qty-wrapper">
                      <button className="cart-qty-btn" onClick={() => updateQuantity(index, -1)}>−</button>
                      <span className="cart-qty-val">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantity(index, 1)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(index)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <button 
              className="cart-checkout-btn"
              onClick={() => setShowCheckout(true)}
            >
              🔒 Secure Checkout
            </button>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal 
          cartMode={true}
          cartItems={cartItems}
          subtotal={subtotal}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            saveCart([]);
            setShowCheckout(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default CartDrawer;
