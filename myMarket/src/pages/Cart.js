import React, { useState, useEffect } from 'react';
import './Cart.css';
import api from '../utils/auth';
import { isAuthenticated } from '../utils/auth';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      if (!isAuthenticated()) {
        navigate('/signin');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Fetching cart...');
      const response = await api.get('/carts/');
      console.log('Cart response:', response.data);

      if (response.data) {
        setCart(response.data);
        // Update cart count in navigation
        if (window.updateCartCount) {
          window.updateCartCount(response.data.items ? response.data.items.length : 0);
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 401) {
          navigate('/signin');
          return;
        }
      }
      setError('Failed to fetch cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      if (!cart) return;

      setLoading(true);
      setError(null);

      console.log('Updating quantity:', { itemId, newQuantity });
      await api.post(`/carts/${cart.id}/update_quantity/`, {
        listing_id: itemId,
        quantity: newQuantity
      });

      // Refresh cart data
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 401) {
          navigate('/signin');
          return;
        }
      }
      setError('Failed to update quantity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      if (!cart) return;

      setLoading(true);
      setError(null);

      console.log('Removing item:', itemId);
      await api.post(`/carts/${cart.id}/remove_item/`, {
        listing_id: itemId
      });

      // Refresh cart data
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 401) {
          navigate('/signin');
          return;
        }
      }
      setError('Failed to remove item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <Navigation />
        <div className="cart-content">
          <h2>Loading cart...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <Navigation />
        <div className="cart-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchCart}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <Navigation />
      <div className="cart-content">
        <h2>Your Cart</h2>
        {cart && cart.items && cart.items.length > 0 ? (
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.listing.image || 'https://via.placeholder.com/100x100?text=No+Image'} 
                  alt={item.listing.title} 
                />
                <div className="item-details">
                  <h3>{item.listing.title}</h3>
                  <p className="price">${item.listing.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleUpdateQuantity(item.listing.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.listing.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.listing.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="cart-summary">
              <h3>Total: ${cart.total_price}</h3>
              <button className="checkout-btn">Proceed to Checkout</button>
            </div>
          </div>
        ) : (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/shop')} className="continue-shopping">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
