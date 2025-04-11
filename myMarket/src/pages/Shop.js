import React from 'react';
import Sidebar from '../components/Sidebar';
import Inventory from '../components/Inventory';

const Shop = () => {
    return (
        <div className="shop">
            <Sidebar/>
            <Inventory />
        </div>
    );
};

export default Shop;