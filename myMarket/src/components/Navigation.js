import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../utils/auth';
import api from '../utils/auth';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Initialize cart count when component mounts
    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/carts/');
          if (response.data && response.data.length > 0 && response.data[0].items) {
            setCartCount(response.data[0].items.length);
          }
        } catch (err) {
          console.error('Error fetching cart count:', err);
        }
      }
    };

    fetchCartCount();
  }, [isAuthenticated]);

  const incrementCartCount = () => {
    setCartCount(prevCount => prevCount + 1);
  };

  const updateCartCount = (count) => {
    setCartCount(count);
  };

  // Expose functions to window object for global access
  window.incrementCartCount = incrementCartCount;
  window.updateCartCount = updateCartCount;

  return (
    <nav className="Home-Nav">
      <ul>
        <li><Link to="/"> Home </Link></li>
        <li><Link to="/shop"> Shop </Link></li>
        <li>
          <Link to="/cart" className="cart-link">
            Cart
            <span className="cart-count">{cartCount}</span>
          </Link>
        </li>
        <li><Link to="/myListings"> My Listings </Link></li>
        {isAuthenticated ? (
          <li><button onClick={logout} className="logout-btn">Sign Out</button></li>
        ) : (
          <li><Link to="/signin"> Sign In </Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation; 