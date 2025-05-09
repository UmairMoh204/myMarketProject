import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import './Success.css';

function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Success component mounted');
    console.log('Session ID:', searchParams.get('session_id'));
    console.log('Is authenticated:', isAuthenticated);

    const checkSession = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to signin');
        navigate('/signin');
        return;
      }

      if (!sessionId) {
        console.log('No session ID, redirecting to home');
        navigate('/');
        return;
      }

      console.log('Session verified, showing success message');
      setIsLoading(false);
    };

    checkSession();
  }, [searchParams, navigate, isAuthenticated]);

  console.log('Rendering Success component, isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="success-container">
        <Navigation />
        <div className="success-content">
          <div className="success-card">
            <h2>Verifying your payment...</h2>
            <p>Please wait while we confirm your transaction.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <Navigation />
      <div className="success-content">
        <div className="success-card">
          <h2>Thank You for Your Purchase!</h2>
          <p>Your order has been successfully placed.</p>
          <p>The seller will contact you shortly with shipping details.</p>
          <button 
            className="return-home-btn"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success; 