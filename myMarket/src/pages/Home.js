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
  const [cartMessage, setCartMessage] = useState('');

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

  const handleAddToCart = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to add items to cart');
        return;
      }

      // First, get the user's cart
      const cartResponse = await axios.get('http://localhost:8000/api/carts/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // The cart is returned directly, not in a results array
      const cart = cartResponse.data;
      if (!cart || !cart.id) {
        setError('Failed to get cart');
        return;
      }

      // Then add the item to the cart
      const response = await axios.post(
        `http://localhost:8000/api/carts/${cart.id}/add_item/`,
        { listing_id: listingId, quantity: 1 },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setCartMessage('Item added to cart!');
        setTimeout(() => setCartMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart: ' + (err.response?.data?.detail || err.message));
    }
  };

  const slides = listings.map(listing => ({
    id: listing.id,
    content: (
      <div className="listing-slide">
        <div className="listing-image">
          <img 
            src={listing.image || 'https://via.placeholder.com/800x400?text=No+Image'} 
            alt={listing.title}
          />
        </div>
        <div className="listing-info">
          <h3>{listing.title}</h3>
          <p className="price">${listing.price}</p>
          <p className="condition">Condition: {listing.condition}</p>
          <p className="seller">Sold by: {listing.owner.username}</p>
          <button 
            className="add-to-cart-btn"
            onClick={() => handleAddToCart(listing.id)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    )
  }));

  const featuredItems = listings.slice(0, 5).map(listing => ({
    id: listing.id,
    content: listing.title,
    price: listing.price,
    image: listing.image,
    onAddToCart: () => handleAddToCart(listing.id)
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
        {cartMessage && (
          <div className="cart-message">
            {cartMessage}
          </div>
        )}
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
                      seller: listing.owner.username,
                      onAddToCart: () => handleAddToCart(listing.id)
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
