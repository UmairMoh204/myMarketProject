import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import './AddToCartButton.css';

function AddToCartButton({ listingId, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    setLoading(true);
    try {
      console.log('Adding to cart:', listingId);
      
      const cartResponse = await api.get('/carts/');
      console.log('Cart response:', cartResponse);
      
      let cart;
      
      if (!cartResponse.data || !Array.isArray(cartResponse.data) || cartResponse.data.length === 0) {
        console.log('No cart found, creating a new one');
        const createCartResponse = await api.post('/carts/', {});
        console.log('Create cart response:', createCartResponse);
        
        if (!createCartResponse.data || !createCartResponse.data.id) {
          throw new Error('Failed to create cart');
        }
        
        cart = createCartResponse.data;
      } else {
        cart = cartResponse.data[0];
      }
      
      console.log('Using cart:', cart);
      
      const existingItem = cart.items?.find(item => item.listing.id === listingId);
      
      if (existingItem) {
        // Item already in cart, update quantity
        console.log('Item already in cart, updating quantity');
        await api.post(`/carts/${cart.id}/update_quantity/`, {
          listing_id: listingId,
          quantity: existingItem.quantity + 1
        });
      } else {
        console.log('Adding new item to cart');
        await api.post(`/carts/${cart.id}/add_item/`, { 
          listing_id: listingId,
          quantity: 1
        });
      }

      const updatedCartResponse = await api.get(`/carts/${cart.id}/`);
      console.log('Updated cart response:', updatedCartResponse);
      
      if (updatedCartResponse.data && updatedCartResponse.data.items) {
        // Update the cart count with the new items
        window.updateCartCount(updatedCartResponse.data.items.length);
      }
      
      if (onSuccess) {
        onSuccess(updatedCartResponse.data);
      }
    
      navigate('/cart', { state: { cartData: updatedCartResponse.data } });
    } catch (err) {
      console.error('Error adding to cart:', err);
      console.error('Error details:', err.response || err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      
      if (onError) {
        onError('Failed to add item to cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="add-to-cart-btn"
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

export default AddToCartButton; 