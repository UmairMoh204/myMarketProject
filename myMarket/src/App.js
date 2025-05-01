import React from 'react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Signin from './pages/Signin';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import AuthTest from './pages/AuthTest';
import MyListings from './pages/MyListings';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/reset-password/:uidb64/:token" element={<Signin />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth-test" element={<AuthTest />} />
          <Route path="/my-listings" element={<MyListings />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
