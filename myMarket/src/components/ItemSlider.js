import React from 'react';
import './ItemSlider.css';

function ItemSlider({ 
  items, 
  containerClass = 'item-container', 
  trackClass = 'item-track', 
  itemClass = 'item', 
  height = '350px', 
  width = '250px', 
  gap = '20px', // Add gap as a prop
  animation = true 
}) {
  const itemStyle = {
    height,
    width,
    marginRight: gap, // Add gap between items
  };

  return (
    <div className={containerClass} style={{ height }}>
      <div 
        className={trackClass} 
        style={{ 
          animation: animation ? 'marquee 10s linear infinite' : 'none',
          gap, // Apply gap to the track
        }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className={itemClass} 
            style={itemStyle}
          >
            <h2>{item.content}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemSlider;