import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import './Shop.css';
import AddToCartButton from '../components/AddToCartButton';

function Shop() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Shop component mounted, auth status:', isAuthenticated);
    
    const fetchListings = async () => {
      try {
        const response = await api.get('/listings/');
        console.log('Raw listings response:', response.data);
        
        // Handle both array and object responses
        let listingsData = [];
        if (Array.isArray(response.data)) {
          listingsData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response is an object, try to extract listings from it
          if (response.data.results) {
            listingsData = response.data.results;
          } else if (response.data.listings) {
            listingsData = response.data.listings;
          } else {
            // If no specific key found, try to convert object values to array
            listingsData = Object.values(response.data);
          }
        }
        
        console.log('Processed listings data:', listingsData);
        setListings(listingsData);
      } catch (err) {
        setError('Failed to fetch listings');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/carts/');
          if (response.data && response.data.length > 0 && response.data[0].items) {
            if (window.updateCartCount) {
              window.updateCartCount(response.data[0].items.length);
            }
          }
        } catch (err) {
          console.error('Error fetching cart count:', err);
        }
      }
    };

    fetchListings();
    fetchCartCount();
  }, [isAuthenticated, authLoading]);

  const filteredListings = Array.isArray(listings) ? listings.filter(listing => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      listing.category === selectedCategory;
    
    // Condition filter
    const matchesCondition = selectedCondition === 'all' || 
      listing.condition === selectedCondition;
    
    // Price range filter
    const price = parseFloat(listing.price);
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : -Infinity;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
    
    // Only apply price filter if both min and max are valid numbers
    const matchesPriceRange = !isNaN(price) && price >= minPrice && price <= maxPrice;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesPriceRange;
  }) : [];

  // Get unique categories and conditions
  const allCategories = [
    'all',
    'Electronics',
    'Clothing',
    'Books',
    'Home',
    'Sports',
    'Toys',
    'Automotive',
    'Beauty',
    'Health',
    'Jewelry',
    'Music',
    'Office',
    'Pets',
    'Tools',
    'Other'
  ];

  const allConditions = [
    'all',
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor'
  ];

  // Use predefined categories and conditions instead of extracting from listings
  const categories = allCategories;
  const conditions = allConditions;

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
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
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

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="condition-select"
            >
              {conditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="price-filter">
            <input
              type="number"
              placeholder="Min price"
              value={priceRange.min}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setPriceRange({ ...priceRange, min: value });
                }
              }}
              className="price-input"
              min="0"
              step="0.01"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max price"
              value={priceRange.max}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setPriceRange({ ...priceRange, max: value });
                }
              }}
              className="price-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {loading ? (
          <p className="loading">Loading listings...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredListings.length === 0 ? (
          <p className="no-listings">
            {searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all' || priceRange.min || priceRange.max ? (
              'No listings match your search criteria.'
            ) : (
              'No listings available.'
            )}
          </p>
        ) : (
          <div className="listings-grid">
            {filteredListings.map(listing => {
              console.log('Rendering listing:', listing);
              return (
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
                    <AddToCartButton 
                      listingId={listing.id}
                      onSuccess={(cartData) => {
                        setSuccessMessage('Item added to cart successfully!');
                        setTimeout(() => {
                          setSuccessMessage('');
                        }, 3000);
                      }}
                      onError={(errorMessage) => {
                        setError(errorMessage);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;