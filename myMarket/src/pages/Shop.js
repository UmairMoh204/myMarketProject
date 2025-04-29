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
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    try {
      console.log('Shop: Adding to cart:', listingId);
      await api.post('/cart/add/', { listing_id: listingId });
      window.incrementCartCount();
      console.log('Shop: Successfully added to cart');
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

        {loading ? (
          <p className="loading">Loading listings...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredListings.length === 0 ? (
          <p className="no-listings">
            {!isAuthenticated ? (
              'Please sign in to view listings.'
            ) : searchTerm || selectedCategory !== 'all' ? (
              'No listings match your search criteria.'
            ) : (
              'No listings available.'
            )}
          </p>
        ) : (
          <div className="listings-grid">
            {filteredListings.map(listing => (
              <div key={listing.id} className="listing-card">
                <img
                  src={listing.image || 'https://via.placeholder.com/150x150?text=No+Image'}
                  alt={listing.title}
                  className="listing-image"
                />
                <div className="listing-details">
                  <h3>{listing.title}</h3>
                  <p className="price">${listing.price}</p>
                  {listing.category && <p className="category">Category: {listing.category}</p>}
                  {listing.condition && <p className="condition">Condition: {listing.condition}</p>}
                  {listing.owner && <p className="seller">Seller: {listing.owner.username}</p>}
                  <button
                    onClick={() => handleAddToCart(listing.id)}
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;