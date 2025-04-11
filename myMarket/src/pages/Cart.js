import React from 'react';
import './Home.css';

const Cart = () => {
    return (
        <div className="cart-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="cart">
                <h1>Shopping Cart</h1>
                <div className="cart-items">
                    <p>No items in your cart yet.</p>
                </div>
            </div>
            
            <div className="cart-summary">
                <h1>Summary</h1>
                <div className="cart-items">
                    <p>No items in your cart yet.</p>
                </div>
            </div>
        </div>
    );
};

export default Cart;