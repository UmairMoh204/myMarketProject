import React from 'react';
import './Home.css';
import Slider from '../components/Slider';
import ItemSlider from '../components/ItemSlider';
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
    { id: 1, content: 'Shoe 1' },
    { id: 2, content: 'Shoe 2' },
    { id: 3, content: 'Shoe 3' },
    { id: 4, content: 'Shoe 4' },
    { id: 5, content: 'Shoe 5' }
  ];

  const startUps = [
    { id: 1, content: 'Startup 1' },
    { id: 2, content: 'Startup 2' },
    { id: 3, content: 'Startup 3' },
    { id: 4, content: 'Startup 4' }
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
                  <h2 style={{ margin: '80px' }}>What's New</h2>
                  <ItemSlider
                    items={shoes}
                    containerClass="item-container"
                    trackClass="item-track"
                    itemClass="item"
                    height="300px"
                    width="250px"
                  />
                </div>
                <div>
                  <h2 style={{ margin: '80px' }}>Introducing These New Brands</h2>
                  <ItemSlider
                    items={startUps}
                    containerClass="item-container"
                    trackClass="item-track"
                    itemClass="item"
                    height="500px"
                    width="300px"
                  />
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
