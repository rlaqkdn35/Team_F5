// src/components/AnimatedOverlay.js
import React, { useEffect, useState } from 'react';

const AnimatedOverlay = ({ title, animationType = 'slideUp' }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(false);
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [title, animationType]);

  let animationClassName = '';
  if (shouldAnimate) {
    if (animationType === 'slideUp') {
      animationClassName = 'animate-in';
    } else if (animationType === 'slideDown') {
      animationClassName = 'animate-down';
    }
    }

  return (
    <div className="fullscreen-overlay">
      <div className="overlay-content">
        {shouldAnimate && (
        <h1 className={animationClassName}>
          {title}
        </h1>
      )}
      </div>
    </div>
  );
};

export default AnimatedOverlay;