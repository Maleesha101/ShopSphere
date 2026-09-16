import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { Link } from 'react-router-dom';

const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      alert(`${product.name} added to cart`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  return (
    <div className="page">
      <h2>Products</h2>
      {error && <p className="error-text">{error}</p>}
      {loading ? <p>Loading products...</p> : (
        <div className="product-grid">
          {products.map((product) => (
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
              <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
