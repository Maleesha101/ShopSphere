import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Product } from '../types';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      alert(`${product.name} added to cart`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!product) return <div className="page">Product not found</div>;

  return (
    <div className="page">
      <div className="product-details-container">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <div className="product-details-layout">
          <div className="product-details-image">
             <div className="product-icon-large">{product.name.slice(0, 1)}</div>
          </div>
          <div className="product-details-info">
            <h1>{product.name}</h1>
            <p className="category-tag">{product.category}</p>
            <p className="description">{product.description}</p>
            <div className="price-tag">${product.price.toFixed(2)}</div>
            <p className="stock-info">Availability: {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
