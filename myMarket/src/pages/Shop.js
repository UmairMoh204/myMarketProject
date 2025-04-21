import React, { useState, useEffect } from 'react';
import './Shop.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Shop() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setListings([]);
          setLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:8000/api/listings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setListings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setListings([]);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleAddToCart = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setCartMessage('Please sign in to add items to cart');
        setTimeout(() => setCartMessage(''), 3000);
        return;
      }
      
      // First get the user's cart
      const cartResponse = await axios.get('http://localhost:8000/api/carts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!cartResponse.data || cartResponse.data.length === 0) {
        setCartMessage('Error: Cart not found');
        setTimeout(() => setCartMessage(''), 3000);
        return;
      }
      
      const cartId = cartResponse.data[0].id;
      await axios.post(
        `http://localhost:8000/api/carts/${cartId}/add_item/`,
        { listing_id: listingId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCartMessage('Item added to cart successfully!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setCartMessage('Failed to add item to cart');
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Shop</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {cartMessage && (
        <div className={`cart-message ${cartMessage.includes('Failed') ? 'error' : 'success'}`}>
          {cartMessage}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="no-listings-message">
          <h2>No listings available</h2>
          <p>Please sign in to view listings</p>
          <Link to="/signin" className="signin-link">Sign In</Link>
        </div>
      ) : (
        <div className="listings-grid">
          {filteredListings.map(listing => (
            <div key={listing.id} className="listing-card">
              <img 
                src={listing.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={listing.title} 
              />
              <div className="item-details">
                <h3>{listing.title}</h3>
                <p className="price">${listing.price}</p>
                <p className="seller">Sold by: {listing.owner.username}</p>
                <p className="condition">Condition: {listing.condition}</p>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(listing.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Shop;