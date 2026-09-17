import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import api from "./services/api";
import { User } from "./types";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import UserProfile from "./pages/UserProfile";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import AdminDashboard from "./pages/AdminDashboard";

const LAB_MODE = import.meta.env.VITE_LAB_MODE || "vulnerable";

const App: React.FC = () => {
  const navigate = useNavigate();
  const [labMode] = useState<"vulnerable" | "hardened">(
    LAB_MODE === "hardened" ? "hardened" : "vulnerable"
  );
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("shopsphere_token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem("shopsphere_token");
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    const fetchCartCount = () => {
      api
        .get("/cart")
        .then((res) => {
          const items = res.data.data || [];
          setCartCount(items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
        })
        .catch(() => setCartCount(0));
    };
    fetchCartCount();
    const interval = setInterval(fetchCartCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLoginSuccess = (loggedInUser: User, _token: string) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("shopsphere_token");
    setUser(null);
    setCartCount(0);
    navigate("/login");
  };

  return (
    <div className="app">
      {labMode === "vulnerable" ? (
        <div className="lab-banner lab-banner-vulnerable">
          <span>
            ⚠️ <strong>VULNERABLE MODE</strong> - Intentional security misconfigurations enabled
          </span>
        </div>
      ) : (
        <div className="lab-banner lab-banner-hardened">
          <span>
            🔒 <strong>HARDENED MODE</strong> - Security best practices enabled
          </span>
        </div>
      )}

      <header className="app-header">
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products">Products</NavLink>
            </li>
            <li>
              <NavLink to="/cart">
                Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </NavLink>
            </li>
            <li>
              <NavLink to="/orders">Orders</NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="/profile">Profile</NavLink>
              </li>
            )}
            {user?.role === "admin" && (
              <li>
                <NavLink to="/admin">Admin</NavLink>
              </li>
            )}
            {user ? (
              <>
                <li>
                  <span className="user-greeting">
                    Hello, {user.firstName}{" "}
                    <small>({user.role})</small>
                  </span>
                </li>
                <li>
                  <button type="button" className="nav-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route
            path="/profile"
            element={user ? <UserProfile /> : <Navigate to="/login" replace />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/orders"
            element={user ? <OrdersPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to={user ? "/" : "/login"} replace />
              )
            }
          />
          <Route path="*" element={<div className="not-found">Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
