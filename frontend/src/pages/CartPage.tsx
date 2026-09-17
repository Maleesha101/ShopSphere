import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartItem } from '../types';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/cart' } });
      } else {
        setError(err.response?.data?.error || 'We could not load your cart.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await api.post('/orders');
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return <div className="page">Loading cart...</div>;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SELECTION</span>
          <h2>Your shopping bag</h2>
          <p className="page-subtitle">Review your pieces before they become part of your everyday.</p>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {cart.length === 0 ? (
        <p>Your cart is empty. <button onClick={() => navigate("/products")}>Browse products</button></p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-info">
                   <span className="cart-item-name">{item.product.name}</span>
                   <span className="cart-item-price">${item.product.price.toFixed(2)}</span>
                </div>
                <div className="cart-item-controls">
                   <span>Qty: {item.quantity}</span>
                </div>
                <span className="cart-item-total">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Summary</h3>
            <div className="summary-row">
              <span>Total:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button className="checkout-btn" onClick={handleCheckout} disabled={checkingOut}>{checkingOut ? 'Preparing order...' : 'Proceed to checkout'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
