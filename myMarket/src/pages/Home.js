import React, { useState, useEffect } from 'react';
import './Home.css';
import Slider from '../components/Slider';
import ItemSlider from '../components/ItemSlider';
import Startup from '../components/Startup';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Shop from './Shop';
import Cart from './Cart';
import Signin from './Signin';
import axios from 'axios';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to handle login
  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: username,
        password: password
      });
      
      if (response.data && response.data.access) {
        localStorage.setItem('token', response.data.access);
        setIsAuthenticated(true);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      setError('Login failed: ' + (err.response?.data?.detail || err.message));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user is authenticated
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      return true;
    } else {
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

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
        
        if (response.data && response.data.results) {
          setListings(response.data.results);
        } else {
          setListings([]);
        }
        
        setLoading(false);
      } catch (err) {
        setListings([]);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const slides = [
    { id: 1, content: 'Slide 1' },
    { id: 2, content: 'Slide 2' },
    { id: 3, content: 'Slide 3' },
    { id: 4, content: 'Slide 4' },
    { id: 5, content: 'Slide 5' }
  ];

  const featuredItems = listings.slice(0, listings.length).map(listing => ({
    id: listing.id,
    content: listing.title,
    price: listing.price,
    image: listing.image
  }));

  const newBrands = listings.slice(0, listings.length).map(listing => ({
    id: listing.id,
    content: listing.owner.username,
    image: listing.image
  }));

  const Navigation = () => {
    const location = useLocation();
    if (location.pathname === '/signin') return null;

    return (
      <nav className="Home-Nav">
        <ul>
          <li><Link to="/"> Home </Link></li>
          <li><Link to="/shop"> Shop </Link></li>
          <li><Link to="/cart"> Cart </Link></li>
          <li><Link to="/settings"> Settings </Link></li>
          <li><Link to="/signin"> Sign Out </Link></li>
        </ul>
      </nav>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Router>
      <div className="Home">
        <Navigation />
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
                    <p style={{ textAlign: 'center', margin: '20px' }}>
                      Please <Link to="/signin">sign in</Link> to view listings.
                    </p>
                  ) : listings.length > 0 ? (
                    <ItemSlider items={listings.map(listing => ({
                      id: listing.id,
                      content: listing.title,
                      price: listing.price,
                      image: listing.image || 'https://via.placeholder.com/150x150?text=No+Image',
                      category: listing.category,
                      condition: listing.condition,
                      seller: listing.owner.username
                    }))} />
                  ) : (
                    <p style={{ textAlign: 'center', margin: '20px' }}>No listings available.</p>
                  )}
                </div>
                
                <div>
                  <h2 style={{ margin: '50px' }}>New Brands</h2>
                  <Startup items={newBrands} />
                </div>
              </>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default Home;
