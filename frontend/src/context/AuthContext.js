import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { endpoints } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could also verify the token here if needed
      setUser({ 
        token,
        username,
        email
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // First, get the username from the email
      const userResponse = await axios.get(endpoints.userByEmail(email));
      const username = userResponse.data.username;

      // Then login with the username
      const response = await axios.post(endpoints.login, {
        username: username,
        password: password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser({ 
        token: access,
        username: username,
        email: email
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const register = async (username, email, password) => {
    try {
      await axios.post(endpoints.register, {
        username,
        email,
        password,
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 