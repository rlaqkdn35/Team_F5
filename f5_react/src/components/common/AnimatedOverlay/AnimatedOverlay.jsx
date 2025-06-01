// src/components/AnimatedOverlay.js
import React, { useEffect, useState } from 'react';

const AnimatedOverlay = ({ title, animationType = 'slideUp' , backgroundImageUrl }) => {
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
  const overlayStyle = backgroundImageUrl ? {
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'auto', // 배경 이미지 크기 조절 (필요에 따라 'contain', 'auto' 등으로 변경)
      backgroundPosition: 'center', // 배경 이미지 위치 조절
      // 여기에 추가적인 배경 스타일을 넣을 수 있습니다.
    } : {};
  return (
    <div className="fullscreen-overlay" style={overlayStyle}>
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