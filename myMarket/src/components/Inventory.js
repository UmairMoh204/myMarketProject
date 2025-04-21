import React from 'react';
import './Sidebar.css';

function Inventory() {
    return (
      <div className='inventoryContainer'>
        <input type="text" placeholder="Search for items..." className='searchBar' />
      </div>
    );
  }
  
  export default Inventory;   