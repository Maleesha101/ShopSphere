import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [addingId, setAddingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data);
      } catch (err: any) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!localStorage.getItem('shopsphere_token')) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    setAddingId(product.id);
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  const categories = ['All', ...new Set(products.map((product) => product.category))];
  const visibleProducts = category === 'All'
    ? products
    : products.filter((product) => product.category === category);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE SHOPSPHERE EDIT</span>
          <h2>Find your next essential</h2>
          <p className="page-subtitle">Curated gear for focused work, daily carry, and a little more delight.</p>
        </div>
        <span className="result-count">{visibleProducts.length} products</span>
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="category-tabs" aria-label="Filter products by category">
        {categories.map((item) => (
          <button type="button" className={category === item ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(item)} key={item}>{item}</button>
        ))}
      </div>
      {loading ? <p>Loading products...</p> : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/products/${product.id}`} className="product-link">
                <div className="product-icon">{product.name.slice(0, 1)}</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-meta">
                  <span>{product.category}</span>
                  <span>Stock: {product.stock}</span>
                </div>
                <div className="product-price">${product.price.toFixed(2)}</div>
              </Link>
              <button onClick={() => handleAddToCart(product)} disabled={product.stock <= 0 || addingId === product.id}>
                {addingId === product.id ? 'Adding...' : product.stock <= 0 ? 'Sold out' : 'Add to cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
