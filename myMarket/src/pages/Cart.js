import React, { useState, useEffect } from 'react';
import './Cart.css';
import api from '../utils/auth';
import { isAuthenticated } from '../utils/auth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RLEDTQQ3K3Wu9nNAXFraNWASsGYj4vql7z4uHz3hBqxoYR6RqiumXYtNXkb0bjz1V2eQsnX9PSGJcDvbSNxl49700mJfHqSVo');

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we're returning from Stripe checkout
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // If we have a session_id, we've returned from Stripe
      navigate('/success');
    }
  }, [searchParams, navigate]);

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

  const handleCheckout = async () => {
    try {
      if (!cart || !cart.id) {
        setError('Cart is empty or invalid');
        return;
      }

      setCheckoutLoading(true);
      setError(null);

      console.log('Creating checkout session for cart:', cart.id);
      
      // Create a checkout session
      const response = await api.post('/create-checkout-session/', {
        cart_id: cart.id
      });

      console.log('Checkout session response:', response.data);

      // Get the session ID
      const { sessionId } = response.data;
      if (!sessionId) {
        throw new Error('No session ID received from server');
      }

      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      console.log('Redirecting to Stripe checkout with session ID:', sessionId);

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        setError(err.response.data?.error || err.response.data?.detail || 'Failed to initiate checkout. Please try again.');
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('No response from server. Please check your connection and try again.');
      } else {
        console.error('Error message:', err.message);
        setError(err.message || 'Failed to initiate checkout. Please try again.');
      }
    } finally {
      setCheckoutLoading(false);
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
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Items ({cart.items.length})</span>
                <span>${cart.total_price}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-item">
                <span>Tax</span>
                <span>${(cart.total_price * 0.1).toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>${(cart.total_price * 1.1).toFixed(2)}</span>
              </div>
              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
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
