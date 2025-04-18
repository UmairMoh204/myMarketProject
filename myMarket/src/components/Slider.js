import React, { useState, useEffect } from 'react';
import './Slider.css';

const Slider = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);                                                                                                                                                                                                                                                                                  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);                                                                                                                                                                                                                                                                                                                        

    return () => clearInterval(interval);
  }, [slides.length]);

  const slideWidth = 100; 
  const gap = 20; 
  const slideWidthWithGap = slideWidth + (gap / window.innerWidth) * 115;

  return (
    <div className="Slider">
      <div
        className="Slider-Track"
        style={{
          transform: `translateX(-${currentIndex * slideWidthWithGap }%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="Slider-Item">
            {slide.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
