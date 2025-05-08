import React, { useState, useEffect } from 'react';
import './Home.css';
import Slider from '../components/Slider';
import ItemSlider from '../components/ItemSlider';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Shop from './Shop';
import Cart from './Cart';
import Signin from './Signin';
import MyListings from './MyListings';
import api from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Success from './Success';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Home component mounted, auth status:', isAuthenticated);
    
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

  const slides = [
    { 
      id: 1, 
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop',
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1000&auto=format&fit=crop',
    },
    { 
      id: 3, 
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop',
    },
    { 
      id: 4, 
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1000&auto=format&fit=crop',
    },
    { 
      id: 5, 
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop',
    }
  ];

  console.log('Current listings state:', listings);

  const featuredItems = Array.isArray(listings) ? listings.map(listing => {
    console.log('Processing listing:', listing);
    return {
      id: listing.id,
      content: listing.title,
      price: listing.price,
      image: listing.image,
      category: listing.category,
      condition: listing.condition,
      seller: listing.owner?.username || 'Unknown'
    };
  }) : [];

  console.log('Formatted featured items:', featuredItems);

  return (
    <div className="Home">
      <Navigation />
      <div className="content-container">
        {successMessage && (
          <div className="cart-message">
            {successMessage}
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="SliderContainerStyling">
                  <Slider slides={slides} />
                </div>
                
                <div className="item-slider-container">
                  <h2>What's New (Backend Listings)</h2>
                  {loading ? (
                    <p style={{ textAlign: 'center', margin: '20px' }}>Loading listings...</p>
                  ) : error ? (
                    <p style={{ textAlign: 'center', margin: '20px', color: 'red' }}>{error}</p>
                  ) : featuredItems.length > 0 ? (
                    <ItemSlider 
                      items={featuredItems}
                    />
                  ) : (
                    <p style={{ textAlign: 'center', margin: '20px' }}>No listings available.</p>
                  )}
                </div>
              </>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/myListings" element={<MyListings />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/verify-email/:uidb64/:token" element={<Signin />} />
          <Route path="/reset-password/:uidb64/:token" element={<Signin />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;
