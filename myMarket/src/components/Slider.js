import React, { useState, useEffect, useCallback } from 'react';
import './Slider.css';

const Slider = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 500); 
    }
  }, [slides.length, isTransitioning]);

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, [goToNextSlide]);

  const slideWidth = 100;
  const gap = 20;
  const slideWidthWithGap = slideWidth + (gap / window.innerWidth) * 115;

  return (
    <div className="Slider">
      <div
        className="Slider-Track"
        style={{
          transform: `translateX(-${currentIndex * slideWidthWithGap}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className="Slider-Item"
            style={{
              opacity: index === currentIndex ? 1 : 0.8,
              transform: `scale(${index === currentIndex ? 1 : 0.95})`
            }}
          >
            <img 
              src={slide.image} 
              alt={slide.title}
              className="Slider-Image"
            />
            <div className="Slider-Content">
              <h2>{slide.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
