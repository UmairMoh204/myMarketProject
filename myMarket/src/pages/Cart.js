import React, { useState, useEffect } from 'react';
import './Cart.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [cartId, setCartId] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        const cartResponse = await axios.get('http://localhost:8000/api/carts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!cartResponse.data || cartResponse.data.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        const userCart = cartResponse.data[0];
        setCartId(userCart.id);
        
        const itemsResponse = await axios.get(`http://localhost:8000/api/carts/${userCart.id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCartItems(itemsResponse.data.items || []);
        calculateTotal(itemsResponse.data.items || []);
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
    const sum = items.reduce((acc, item) => acc + (item.total_price || 0), 0);
    setTotal(sum);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please sign in to update cart');
        return;
      }

      await axios.post(
        `http://localhost:8000/api/carts/${cartId}/update_quantity/`,
        { listing_id: itemId, quantity: newQuantity },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const itemsResponse = await axios.get(`http://localhost:8000/api/carts/${cartId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCartItems(itemsResponse.data.items || []);
      calculateTotal(itemsResponse.data.items || []);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please sign in to remove items');
        return;
      }

      await axios.post(
        `http://localhost:8000/api/carts/${cartId}/remove_item/`,
        { listing_id: itemId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh cart data
      const itemsResponse = await axios.get(`http://localhost:8000/api/carts/${cartId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Browse our products and add items to your cart</p>
          <Link to="/shop" className="continue-shopping">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.listing.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={item.listing.title} 
                  className="item-image" 
                />
                <div className="item-details">
                  <h3>{item.listing.title}</h3>
                  <p className="price">${item.listing.price}</p>
                  <p className="seller">Sold by: {item.listing.owner.username}</p>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleUpdateQuantity(item.listing.id, Math.max(0, item.quantity - 1))}
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
                  <p className="item-total">Total: ${item.total_price}</p>
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
            <button className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;