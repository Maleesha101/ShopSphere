import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Order } from '../types';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="page">Loading orders...</div>;

  return (
    <div className="page">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <strong>Order #{order.id}</strong>
                <span className={`status-badge ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-body">
                <div className="order-info">
                   <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                   <span>Total: ${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
