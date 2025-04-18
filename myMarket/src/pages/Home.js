import React from 'react';
import './Home.css';
import Slider from '../components/Slider';
import ItemSlider from '../components/ItemSlider';
import Startup from '../components/Startup';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Shop from './Shop';
import Cart from './Cart';
import Signin from './Signin';

function Home() {
  const slides = [
    { id: 1, content: 'Slide 1' },
    { id: 2, content: 'Slide 2' },
    { id: 3, content: 'Slide 3' },
    { id: 4, content: 'Slide 4' },
    { id: 5, content: 'Slide 5' }
  ];

  const shoes = [
    { id: 1, content: 'Item 1' },
    { id: 2, content: 'Item 2' },
    { id: 3, content: 'Item 3' },
    { id: 4, content: 'Item 4' },
    { id: 5, content: 'Item 5' },
    { id: 6, content: 'Item 6' },
    { id: 7, content: 'Item 7' },
    { id: 8, content: 'Item 8' },
    { id: 9, content: 'Item 9' },
    { id: 10, content: 'Item 10'}
  ];

  const startUps = [
    { id: 1, content: 'Startup 1' },
    { id: 2, content: 'Startup 2' },
    { id: 3, content: 'Startup 3' },
    { id: 4, content: 'Startup 4' },
    { id: 1, content: 'Startup 5' },
    { id: 2, content: 'Startup 6' },
  ];

  const Navigation = () => {
    const location = useLocation();
    if (location.pathname === '/signin') return null;

    return (
      <nav className="Home-Nav">
        <ul>
          <li><Link to="/"> Home </Link></li>
          <li><Link to="/shop"> Shop </Link></li>
          <li><Link to="/cart"> Cart </Link></li>
          <li><Link to="/settings"> Settings </Link></li>
          <li><Link to="/signin"> Sign Out </Link></li>
        </ul>
      </nav>
    );
  };

  return (
    <Router>
      <div className="Home">
        <Navigation />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="SliderContainerStyling">
                  <Slider slides={slides} />
                </div>
                <div>
                  <h2 style={{ margin: '50px' }}>What's New</h2>
                  <ItemSlider items={shoes} />
                </div>
                <div>
                  <h2 style={{ margin: '50px' }}>New Brands</h2>
                  <Startup items={startUps} />
                </div>
              </>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default Home;
