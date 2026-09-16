import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Order } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'orders'>('reports');
  const [reports, setReports] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        setReports(res.data.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.data);
      } else if (activeTab === 'orders') {
        const res = await api.get('/admin/orders');
        setOrders(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Reports</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? <p>Loading...</p> : (
        <div className="admin-content">
          {activeTab === 'reports' && reports && (
            <div className="reports-view">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${reports.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{reports.totalOrders}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-value">{reports.totalUsers}</p>
                </div>
              </div>
              <h3>Recent Orders</h3>
              <div className="admin-table-container">
                 <table className="admin-table">
                   <thead>
                     <tr>
                       <th>ID</th>
                       <th>User</th>
                       <th>Total</th>
                       <th>Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {reports.recentOrders.map((order: any) => (
                       <tr key={order.id}>
                         <td>#{order.id}</td>
                         <td>{order.user.email}</td>
                         <td>${order.total.toFixed(2)}</td>
                         <td>{order.status}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-view">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>{u.firstName} {u.lastName}</td>
                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-view">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{o.user?.email || 'N/A'}</td>
                        <td>${o.total.toFixed(2)}</td>
                        <td>{o.status}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
