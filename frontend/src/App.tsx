import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const LAB_MODE = import.meta.env.VITE_LAB_MODE || "vulnerable";

interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [labMode, setLabMode] = useState<"vulnerable" | "hardened">(LAB_MODE === "hardened" ? "hardened" : "vulnerable");
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<{type: string, message: string}[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("shopsphere_token");
    if (token) {
      axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem("shopsphere_token");
          setUser(null);
        });
    }
    const interval = setInterval(() => {
      axios.get("/api/cart").then(res => setCart(res.data.data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLabMode(LAB_MODE === "hardened" ? "hardened" : "vulnerable");
  }, [LAB_MODE]);

  const showNotification = (type: string, message: string) => {
    setNotifications(prev => [{type, message}, ...prev.slice(0, 4)]);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
  };

  const handleLogin = async (e: React.FormEvent, email: string, password: string) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("shopsphere_token", token);
      setUser(user);
      showNotification("success", `Welcome back, ${user.firstName}!`);
      navigate("/");
    } catch (err: any) {
      showNotification("error", err.response?.data?.error || "Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("shopsphere_token");
    setUser(null);
    navigate("/login");
  };

  const handleAddToCart = async (productId: number, productName: string, price: number) => {
    try {
      await axios.post("/api/cart", { productId, quantity: 1 });
      showNotification("success", `${productName} added to cart`);
    } catch (err: any) {
      showNotification("error", err.response?.data?.error || "Failed to add to cart");
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await axios.post("/api/orders", {}, { headers: { Authorization: `Bearer ${localStorage.getItem("shopsphere_token")}` } });
      setOrders([res.data.data, ...orders]);
      setCart([]);
      showNotification("success", "Order created successfully!");
    } catch (err: any) {
      showNotification("error", err.response?.data?.error || "Checkout failed");
    }
  };

  return (
    <div className="app">
      {labMode === "vulnerable" ? (
        <div className="lab-banner lab-banner-vulnerable"><span>⚠️ <strong>VULNERABLE MODE</strong> - Intentional security misconfigurations enabled</span></div>
      ) : (
        <div className="lab-banner lab-banner-hardened"><span>🔒 <strong>HARDENED MODE</strong> - Security best practices enabled</span></div>
      )}

      <header className="app-header">
        <nav>
          <ul className="nav-links">
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/products">Products</NavLink></li>
            <li><NavLink to="/cart">Cart</NavLink></li>
            <li><NavLink to="/orders">Orders</NavLink></li>
            {user ? (
              <li>
                <span className="user-greeting">Hello, {user.firstName} {user.lastName} <small>({user.role})</small></span>
              </li>
            ) : (
              <li><NavLink to="/login">Login</NavLink></li>
            )}
            {user && <li><NavLink to="/logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</NavLink></li>}
          </ul>
        </nav>
      </header>

      <main className="app-main">
        <SwitchRoute path="/" exact><HomePage setUser={setUser} /></SwitchRoute>
        <SwitchRoute path="/login"><LoginForm onLogin={handleLogin} /></SwitchRoute>
        <SwitchRoute path="/products"><ProductListing setUser={setUser} onAddToCart={handleAddToCart} /></SwitchRoute>
        <SwitchRoute path="/cart"><CartPage cart={cart} onCheckout={handleCheckout} setUser={setUser} /></SwitchRoute>
        <SwitchRoute path="/orders"><OrdersPage orders={orders} setUser={setUser} /></SwitchRoute>
        <SwitchRoute path="/logout" exact><div className="not-found">Logged out successfully</div></SwitchRoute>
      </main>
    </div>
  );
};

const SwitchRoute = ({ path, exact, children }: { path: string; exact: boolean; children: React.ReactNode }) => {
  const location = window.location.pathname;
  return location === path || (exact && path === "/" && location === "/") ? <>{children}</> : null;
};

// Home page
const HomePage = ({ setUser }: { setUser: (u: any) => void }) => {
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

// Login form
const LoginForm = ({ onLogin }: { onLogin: (e: React.FormEvent, email: string, password: string) => void }) => {
  const [email, setEmail] = useState("customer@example.local");
  const [password, setPassword] = useState("LAB-Customer-Password-123");
  return (
    <div className="page">
      <form className="login-card" onSubmit={(e) => onLogin(e, email, password)}>
        <h2>Login</h2>
        <p className="muted">Synthetic lab credentials only. Never use these in production.</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
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

// Product listing
const ProductListing = ({ onAddToCart }: { onAddToCart: (id: number, name: string, price: number) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/products").then(res => setProducts(res.data.data)).catch(() => setError("Failed to load products")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h2>Products</h2>
      {error && <p className="error-text">{error}</p>}
      {loading ? <p>Loading products...</p> : (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-icon">{product.name.slice(0, 1)}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-meta"><span>{product.category}</span><span>Stock: {product.stock}</span></div>
              <div className="product-price">${product.price.toFixed(2)}</div>
              <button onClick={() => onAddToCart(product.id, product.name, product.price)}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Cart page
const CartPage = ({ cart, onCheckout, setUser }: { cart: CartItem[]; onCheckout: () => void; setUser: (u: any) => void }) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <div className="page">
      <h2>Your Cart</h2>
      {cart.length === 0 ? <p>Your cart is empty. <button onClick={() => navigate("/products")}>Browse products</button></p> : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <span>{item.product.name}</span>
                <span>Qty: {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div>Total: <strong>${total.toFixed(2)}</strong></div>
            <button onClick={onCheckout}>Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Orders page
const OrdersPage = ({ orders }: { orders: Order[] }) => {
  return (
    <div className="page">
      <h2>Your Orders</h2>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <div className="order-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div><strong>Order #{order.id}</strong><span>Status: {order.status}</span></div>
              <div><strong>${order.total.toFixed(2)}</strong><span>{new Date(order.createdAt).toLocaleString()}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;