import React, { useRef, useState, useEffect } from 'react';
import './myListingItemSlider.css';
import { useNavigate } from 'react-router-dom';
import api from '../utils/auth';

function MyListingItemSlider({ items }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const BACKEND_URL = 'http://localhost:8000';

  useEffect(() => {
    console.log('MyListingItemSlider received items:', items);
  }, [items]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = 'grabbing'; 
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab'; 
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab'; 
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleView = (itemId) => {
    navigate(`/listing/${itemId}`);
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/listings/${itemId}/`);
      setSuccessMessage('Listing deleted successfully');
      setTimeout(() => setSuccessMessage(''), 2000);
      // You might want to trigger a refresh of the listings here
    } catch (err) {
      setError('Failed to delete listing');
      setTimeout(() => setError(''), 2000);
    }
  };

  if (!items || items.length === 0) {
    console.log('No items to display in MyListingItemSlider');
    return <div className="item-container">No items available</div>;
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150x150?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div
      className="item-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {successMessage && (
        <div className="cart-message">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="item-track">
        {items.map((item) => {
          const imageUrl = getImageUrl(item.image);
          return (
            <div key={item.id} className="item">
              <div className="item-image">
                <img src={imageUrl} alt={item.content} onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                }} />
              </div>
              <h2>{item.content}</h2>
              {item.price && <p className="item-price">${item.price}</p>}
              <div className="item-buttons">
                <button className="delete-button" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyListingItemSlider;
