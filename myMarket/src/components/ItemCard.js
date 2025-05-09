// src/components/ItemCard.js
import React from 'react';
import './ItemCard.css';
import AddToCartButton from './AddToCartButton';

const BACKEND_URL = 'http://localhost:8000';

function getImageUrl(imagePath) {
  if (!imagePath) return 'https://via.placeholder.com/150x150?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

export default function ItemCard({ item }) {
  const imageUrl = getImageUrl(item.image);

  return (
    <div key={item.id} className="item">
        <div className="item-image">
            <img src={imageUrl} alt={item.content} onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
            }} />
        </div>
        <h2 className="item-title">{item.title}</h2> 
        {item.price && <p className="item-price">${item.price}</p>}
        {item.condition && <p className="item-condition">Condition: {item.condition}</p>}
        <div className="item-buttons">
            <AddToCartButton listingId={item.id} />
        </div>
    </div>
  );
}
