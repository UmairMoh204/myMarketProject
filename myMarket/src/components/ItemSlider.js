import React, { useRef, useState, useEffect } from 'react';
import './ItemSlider.css';

function ItemSlider({ items }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  return (
    <div
      className="item-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ItemSlider;
