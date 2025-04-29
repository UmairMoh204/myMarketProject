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
  const [successMessage, setSuccessMessage] = useState('');
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
      
      // First, try to get the user's cart
      const cartResponse = await api.get('/carts/');
      console.log('Shop: Cart response:', cartResponse);
      
      let cart;
      
      // If no cart exists, create one
      if (!cartResponse.data || !Array.isArray(cartResponse.data) || cartResponse.data.length === 0) {
        console.log('Shop: No cart found, creating a new one');
        const createCartResponse = await api.post('/carts/', {});
        console.log('Shop: Create cart response:', createCartResponse);
        
        if (!createCartResponse.data || !createCartResponse.data.id) {
          throw new Error('Failed to create cart');
        }
        
        cart = createCartResponse.data;
      } else {
        cart = cartResponse.data[0];
      }
      
      console.log('Shop: Using cart:', cart);
      
      // Check if the item is already in the cart
      const existingItem = cart.items?.find(item => item.listing.id === listingId);
      
      if (existingItem) {
        // Item already in cart, update quantity
        console.log('Shop: Item already in cart, updating quantity');
        await api.post(`/carts/${cart.id}/update_quantity/`, {
          listing_id: listingId,
          quantity: existingItem.quantity + 1
        });
      } else {
        // Add new item to cart
        console.log('Shop: Adding new item to cart');
        const addResponse = await api.post(`/carts/${cart.id}/add_item/`, { 
          listing_id: listingId,
          quantity: 1
        });
        console.log('Shop: Add to cart response:', addResponse);
      }
      
      window.incrementCartCount();
      console.log('Shop: Successfully added to cart');
      
      // Show success message
      setSuccessMessage('Item added to cart successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Navigate to cart page
      navigate('/cart');
    } catch (err) {
      console.error('Shop: Error adding to cart:', err);
      console.error('Shop: Error details:', err.response || err);
      if (err.response) {
        console.error('Shop: Response status:', err.response.status);
        console.error('Shop: Response data:', err.response.data);
      }
      setError('Failed to add item to cart. Please try again.');
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
        {successMessage && (
          <div className="cart-message">
            {successMessage}
          </div>
        )}
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