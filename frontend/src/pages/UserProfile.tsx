import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!user) return <div className="page">Not logged in</div>;

  return (
    <div className="page user-profile">
      <h2>User Profile</h2>
      <div className="profile-card">
        <div className="profile-field">
          <label>First Name:</label>
          <span>{user.firstName}</span>
        </div>
        <div className="profile-field">
          <label>Last Name:</label>
          <span>{user.lastName}</span>
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>
        <div className="profile-field">
          <label>Role:</label>
          <span className="role-badge">{user.role}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
