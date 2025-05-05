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
    const fetchCartCount = async () => {
      try {
        const response = await api.get('/carts/');
        if (response.data && response.data.length > 0 && response.data[0].items) {
          setCartCount(response.data[0].items.length);
        }
      } catch (err) {
        console.error('Error fetching cart count:', err);
      }
    };

    fetchCartCount();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setCartCount(0); 
  };

  window.incrementCartCount = () => setCartCount(prev => prev + 1);
  window.updateCartCount = (count) => setCartCount(count);

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
        <li><Link to="/my-listings"> My Listings </Link></li>
        <li><button onClick={handleLogout} className="logout-btn">Sign Out</button></li>
      </ul>
    </nav>
  );
}

export default Navigation;