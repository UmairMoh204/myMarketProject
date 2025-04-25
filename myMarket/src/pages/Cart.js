import React, { useState, useEffect } from 'react';
import './Cart.css';
import api from '../utils/auth';
import { isAuthenticated } from '../utils/auth';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [cartId, setCartId] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!isAuthenticated()) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        const response = await api.get('/carts');
        
        if (response.data && response.data.length > 0) {
          setCartId(response.data[0].id);
          setCartItems(response.data[0].items || []);
          calculateTotal(response.data[0].items || []);
        } else {
          setCartItems([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setCartItems([]);
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      return acc + (item.listing.price * item.quantity);
    }, 0);
    setTotal(sum);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      if (!isAuthenticated()) {
        setError('Please sign in to update cart');
        return;
      }

      await api.post(
        `/carts/${cartId}/update_quantity/`,
        { listing_id: itemId, quantity: newQuantity }
      );

      const itemsResponse = await api.get(`/carts/${cartId}/`);
      
      setCartItems(itemsResponse.data.items || []);
      calculateTotal(itemsResponse.data.items || []);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      if (!isAuthenticated()) {
        setError('Please sign in to remove items');
        return;
      }

      await api.post(
        `/carts/${cartId}/remove_item/`,
        { listing_id: itemId }
      );

      // Refresh cart data
      const itemsResponse = await api.get(`/carts/${cartId}/`);
      
      setCartItems(itemsResponse.data.items || []);
      calculateTotal(itemsResponse.data.items || []);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="Cart">
      <Navigation />
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      {!isAuthenticated() ? (
        <div className="auth-message">
          <p>Please sign in to view your cart</p>
          <Link to="/signin" className="signin-link">Sign In</Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/shop" className="shop-link">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.listing.image || 'https://via.placeholder.com/100x100?text=No+Image'} 
                  alt={item.listing.title} 
                />
                <div className="item-details">
                  <h3>{item.listing.title}</h3>
                  <p className="price">${item.listing.price}</p>
                  <p className="seller">Sold by: {item.listing.owner.username}</p>
                </div>
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
                <div className="item-total">
                  <p>${(item.listing.price * item.quantity).toFixed(2)}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.listing.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
    </div>
  );
}

export default Cart;