import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartItem } from '../types';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (err) {
      console.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      await api.post('/orders');
      alert('Order created successfully!');
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Checkout failed');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return <div className="page">Loading cart...</div>;

  return (
    <div className="page">
      <h2>Your Shopping Cart</h2>
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
            <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
