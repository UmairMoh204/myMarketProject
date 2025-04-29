import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import './Shop.css';

function Shop() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      console.log('Shop: Fetching listings...');
      setLoading(true);
      const response = await api.get('/listings/');
      console.log('Shop: Listings API response:', response);
      
      if (response.data) {
        console.log('Shop: Response data type:', typeof response.data);
        console.log('Shop: Is array?', Array.isArray(response.data));
        
        if (Array.isArray(response.data)) {
          setListings(response.data);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          console.log('Shop: Using paginated results');
          setListings(response.data.results);
        } else {
          console.log('Shop: Unexpected data format:', response.data);
          setListings([]);
        }
      } else {
        console.log('Shop: No data in response');
        setListings([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Shop: Error fetching listings:', err);
      console.error('Shop: Error details:', err.response || err);
      setError('Failed to fetch listings. Please try again later.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Shop: Auth state changed:', { isAuthenticated, authLoading });
    if (!authLoading && isAuthenticated) {
      fetchListings();
    }
  }, [isAuthenticated, authLoading]);

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
      console.error('Shop: Error adding to cart:', err);
      console.error('Shop: Error details:', err.response || err);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(listings.map(listing => listing.category))];

  return (
    <div className="Shop">
      <Navigation />
      <div className="shop-container">
        <div className="filters">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
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