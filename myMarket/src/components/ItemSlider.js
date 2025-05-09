import React, { useRef, useState, useEffect } from 'react';
import './ItemSlider.css';
import AddToCartButton from './AddToCartButton';

function ItemSlider({ items, onBuyClick }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:8000';

  const recentItems = items
    ? [...items]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
    : [];

  const duplicatedItems = [...recentItems, ...recentItems, ...recentItems, ...recentItems, ...recentItems];

  useEffect(() => {
    console.log('ItemSlider received items:', items);
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

  if (!items || items.length === 0) {
    console.log('No items to display in ItemSlider');
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
        {duplicatedItems.map((item, index) => {
          const imageUrl = getImageUrl(item.image);
          return (
            <div key={`${item.id}-${index}`} className="item">
              <div className="item-image">
                <img src={imageUrl} alt={item.content} onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                }} />
              </div>
              <h2>{item.content}</h2>
              {item.price && <p className="item-price">${item.price}</p>}
              {item.condition && <p className="item-condition">Condition: {item.condition}</p>}
              <div className="item-buttons">
                <AddToCartButton 
                  listingId={item.id}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ItemSlider;
