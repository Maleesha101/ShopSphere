import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>Welcome to ShopSphere</h1>
          <p>Your local cybersecurity training e-commerce platform. Browse products, manage your cart, and explore our intentionally vulnerable security configuration.</p>
          <div className="hero-actions">
            <button onClick={() => navigate("/products")}>Browse Products</button>
            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>10</strong><span>Security Labs</span></div>
          <div><strong>2</strong><span>Lab Modes</span></div>
          <div><strong>100%</strong><span>Local Only</span></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
