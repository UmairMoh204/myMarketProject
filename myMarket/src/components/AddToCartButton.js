import React, { useState } from 'react';
import api from '../utils/auth';
import { isAuthenticated } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import './AddToCartButton.css';

function AddToCartButton({ listingId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    try {
      console.log('Starting add to cart process...');
      console.log('Listing ID:', listingId);
      console.log('Is authenticated:', isAuthenticated());
      console.log('Token:', localStorage.getItem('token'));

      if (!isAuthenticated()) {
        setError('Please sign in to add items to cart');
        navigate('/signin');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Getting cart...');
      const cartResponse = await api.get('carts/');
      console.log('Cart response:', cartResponse.data);

      if (!cartResponse.data || !cartResponse.data.id) {
        console.error('Invalid cart response:', cartResponse);
        throw new Error('Invalid cart response');
      }

      console.log('Adding item to cart:', listingId);
      const addResponse = await api.post(`carts/${cartResponse.data.id}/add_item/`, {
        listing_id: listingId,
        quantity: 1
      });
      console.log('Add item response:', addResponse.data);

      if (!addResponse.data || !addResponse.data.items) {
        console.error('Invalid add item response:', addResponse);
        throw new Error('Invalid response from server');
      }

      console.log('Getting updated cart...');
      const updatedCart = await api.get('carts/');
      console.log('Updated cart:', updatedCart.data);

      if (window.updateCartCount) {
        const totalQuantity = updatedCart.data.items ? 
          updatedCart.data.items.reduce((total, item) => total + item.quantity, 0) : 0;
        console.log('Updating cart count:', totalQuantity);
        window.updateCartCount(totalQuantity);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
        const errorMessage = err.response.data?.error || 
                           err.response.data?.detail || 
                           err.response.data?.message || 
                           'Failed to add item to cart';
        setError(errorMessage);
        if (err.response.status === 401) {
          navigate('/signin');
          return;
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to add item to cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-to-cart-container">
      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Added to cart!</div>}
    </div>
  );
}

export default AddToCartButton; 