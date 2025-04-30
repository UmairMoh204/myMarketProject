import React, { useState, useEffect } from 'react';
import './Home.css';
import Slider from '../components/Slider';
import ItemSlider from '../components/ItemSlider';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Shop from './Shop';
import Cart from './Cart';
import Signin from './Signin';
import api from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      console.log('Fetching listings...');
      setLoading(true);
      const response = await api.get('/listings/');
      console.log('Listings API response:', response);
      
      if (response.data) {
        console.log('Response data type:', typeof response.data);
        console.log('Is array?', Array.isArray(response.data));
        
        if (Array.isArray(response.data)) {
          setListings(response.data);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          console.log('Using paginated results');
          setListings(response.data.results);
        } else {
          console.log('Unexpected data format:', response.data);
          setListings([]);
        }
      } else {
        console.log('No data in response');
        setListings([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching listings:', err);
      console.error('Error details:', err.response || err);
      setError('Failed to fetch listings. Please try again later.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, authLoading });
    if (!authLoading && isAuthenticated) {
      fetchListings();
    }
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
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1000&auto=format&fit=crop',
    },
    { 
      id: 4, 
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1000&auto=format&fit=crop',
    },
    { 
      id: 5, 
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1000&auto=format&fit=crop',
    }
  ];

  const featuredItems = Array.isArray(listings) ? listings.slice(0, listings.length).map(listing => ({
    id: listing.id,
    content: listing.title,
    price: listing.price,
    image: listing.image
  })) : [];


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
                
                <div>
                  <h2 style={{ margin: '50px' }}>What's New (Backend Listings)</h2>
                  {!isAuthenticated ? (
                    <p style={{ textAlign: 'center', margin: '20px' }}>No listings...</p>
                  ) : loading ? (
                    <p style={{ textAlign: 'center', margin: '20px' }}>Loading listings...</p>
                  ) : error ? (
                    <p style={{ textAlign: 'center', margin: '20px', color: 'red' }}>{error}</p>
                  ) : listings.length > 0 ? (
                    <ItemSlider 
                      items={listings.map(listing => ({
                        id: listing.id,
                        content: listing.title,
                        price: listing.price,
                        image: listing.image || 'https://via.placeholder.com/150x150?text=No+Image',
                        category: listing.category,
                        condition: listing.condition,
                        seller: listing.owner?.username || 'Unknown'
                      }))} 
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
          <Route path="/signin" element={<Signin />} />
          <Route path="/verify-email/:uidb64/:token" element={<Signin />} />
          <Route path="/reset-password/:uidb64/:token" element={<Signin />} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;
