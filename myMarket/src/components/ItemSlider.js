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

  const handleBuyClick = (itemId) => {
    if (onBuyClick) {
      onBuyClick(itemId);
    } else {
      console.log('Buy button clicked for item:', itemId);
    }
  };

  const handleAddToCartSuccess = (cartData) => {
    setSuccessMessage('Item added to cart successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleAddToCartError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => {
      setError('');
    }, 3000);
  };

  if (!items || items.length === 0) {
    console.log('No items to display in ItemSlider');
    return <div className="item-container">No items available</div>;
  }

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
          console.log('Rendering item:', item);
          return (
            <div key={item.id} className="item">
              {item.image && (
                <div className="item-image">
                  <img src={item.image} alt={item.content} />
                </div>
              )}
              <h2>{item.content}</h2>
              {item.price && <p className="item-price">${item.price}</p>}
              {item.category && <p className="item-category">Category: {item.category}</p>}
              {item.condition && <p className="item-condition">Condition: {item.condition}</p>}
              {item.seller && <p className="item-seller">Seller: {item.seller}</p>}
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
