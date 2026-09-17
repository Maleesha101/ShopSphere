import React, { useState } from 'react';
import api from '../services/api';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('customer@example.local');
  const [password, setPassword] = useState('LAB-Customer-Password-123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('shopsphere_token', token);
      onLoginSuccess(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="eyebrow">SHOPSPHERE MEMBERS</span>
        <h2>Welcome back</h2>
        <p className="login-intro">Sign in to save your cart and continue your next order.</p>
        {error && <p className="error-text">{error}</p>}
        <p className="muted">Synthetic lab credentials only. Never use these in production.</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
        <div className="credentials-box">
          <strong>Lab Credentials:</strong>
          <p>customer@example.local / LAB-Customer-Password-123</p>
          <p>admin@example.local / LAB-Admin-Password-123</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
