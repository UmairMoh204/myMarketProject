import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './Signin.css';

function Signin() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetRequest, setIsResetRequest] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  useEffect(() => {
    // Check if we're on a verification or reset password page
    if (window.location.pathname.includes('/verify-email/')) {
      setIsVerifying(true);
      verifyEmail();
    } else if (window.location.pathname.includes('/reset-password/')) {
      setIsResetPassword(true);
    }
  }, [uidb64, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/verify-email/${uidb64}/${token}/`);
      setSuccess('Email verified successfully! You can now login.');
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err) {
      setError('Email verification failed. The link may be invalid or expired.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (isLogin) {
      if (!formData.username || !formData.password) {
        setError('Username and password are required');
        return;
      }
    } else if (isResetRequest) {
      if (!formData.email) {
        setError('Email is required');
        return;
      }
    } else if (isResetPassword) {
      if (!formData.newPassword || !formData.confirmNewPassword) {
        setError('New password and confirmation are required');
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    } else {
      // Registration
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }

    try {
      if (isLogin) {
        // Login
        const response = await axios.post('http://localhost:8000/api/token/', {
          username: formData.username,
          password: formData.password
        });

        // Store tokens in localStorage
        if (response.data && response.data.access) {
          localStorage.setItem('token', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          localStorage.setItem('isAuthenticated', 'true');
          
          setSuccess('Login successful!');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError('Invalid response from server');
        }
      } else if (isResetRequest) {
        // Request password reset
        await axios.post('http://localhost:8000/api/request-password-reset/', {
          email: formData.email
        });
        
        setSuccess('If an account exists with this email, a password reset link has been sent.');
        setTimeout(() => {
          setIsResetRequest(false);
          setFormData({...formData, email: ''});
        }, 3000);
      } else if (isResetPassword) {
        // Reset password
        await axios.post(`http://localhost:8000/api/reset-password/${uidb64}/${token}/`, {
          new_password: formData.newPassword
        });
        
        setSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      } else {
        // Register
        const response = await axios.post('http://localhost:8000/api/register/', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    }
  };

  if (isVerifying) {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <h2>Verifying Email</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>
          {isLogin ? 'Login' : 
           isResetRequest ? 'Reset Password' : 
           isResetPassword ? 'Set New Password' : 'Register'}
        </h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isResetRequest && !isResetPassword && (
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
          )}
          
          {!isLogin && !isResetPassword && (
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
          
          {!isResetRequest && !isResetPassword && (
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
          )}
          
          {!isLogin && !isResetRequest && !isResetPassword && (
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
          
          {isResetPassword && (
            <>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 
             isResetRequest ? 'Send Reset Link' : 
             isResetPassword ? 'Reset Password' : 'Register'}
          </button>
        </form>
        
        <div className="toggle-form">
          {isLogin ? (
            <>
              <p>
                Don't have an account?
                <button 
                  className="toggle-btn"
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </p>
              <p>
                <button 
                  className="toggle-btn"
                  onClick={() => setIsResetRequest(true)}
                >
                  Forgot Password?
                </button>
              </p>
            </>
          ) : isResetRequest ? (
            <p>
              <button 
                className="toggle-btn"
                onClick={() => setIsResetRequest(false)}
              >
                Back to Login
              </button>
            </p>
          ) : (
            <p>
              Already have an account?
              <button 
                className="toggle-btn"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signin;