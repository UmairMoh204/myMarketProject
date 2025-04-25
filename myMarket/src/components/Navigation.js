import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../utils/auth';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="Home-Nav">
      <ul>
        <li><Link to="/"> Home </Link></li>
        <li><Link to="/shop"> Shop </Link></li>
        <li><Link to="/cart"> Cart </Link></li>
        <li><Link to="/settings"> My Listings </Link></li>
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