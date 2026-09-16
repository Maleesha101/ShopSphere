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
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('shopsphere_token', token);
      onLoginSuccess(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        <button type="submit">Login</button>
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
