import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signin.css';

function Signin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (isLogin) {
        // Login using the correct endpoint
        const response = await axios.post('http://localhost:8000/api/token/', {
          username: formData.username,
          password: formData.password
        });

        // Store token in localStorage
        if (response.data && response.data.access) {
          localStorage.setItem('token', response.data.access);
          localStorage.setItem('isAuthenticated', 'true');
          
          setSuccess('Login successful!');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError('Invalid response from server');
        }
      } else {
        // Register - This would need to be implemented on the backend
        // For now, we'll just show an error
        setError('Registration is not implemented yet. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="toggle-form">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              className="toggle-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;