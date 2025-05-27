// src/components/common/Slider/Slider.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Slider.css';

const Slider = ({
  children,
  slidesToShow = 1,
  slidesToScroll = 1,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null); // .slider-track
  const sliderWrapperRef = useRef(null); // .slider-content-wrapper (보이는 영역)

  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  // 슬라이더 위치 및 아이템 너비를 계산하고 적용하는 함수
  const updateSliderLayout = useCallback(() => {
    if (!sliderWrapperRef.current || !sliderRef.current) {
      return;
    }

    const containerVisibleWidth = sliderWrapperRef.current.clientWidth;
    const safeContainerWidth = containerVisibleWidth > 0 ? containerVisibleWidth : 1; 
    const slideWidth = safeContainerWidth / slidesToShow;

    // requestAnimationFrame으로 DOM 변경을 감싸서 무한 루프 경고 방지
    requestAnimationFrame(() => {
        // console.log('RAF - Update Layout:', { containerVisibleWidth, slideWidth, currentIndex });

        // 슬라이드 트랙 전체 너비 설정
        sliderRef.current.style.width = `${totalSlides * slideWidth}px`;
        
        // 각 슬라이드 아이템의 너비 설정
        // 이 부분은 CSS에서 처리하는 것이 훨씬 좋지만, JS로 한다면 이렇게.
        // CSS에서 flex-basis를 쓰는 것이 훨씬 안정적입니다.
        Array.from(sliderRef.current.children).forEach(child => {
            child.style.width = `${slideWidth}px`;
        });

        // 현재 슬라이드 위치로 transform 적용
        sliderRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    });

  }, [currentIndex, slidesToShow, totalSlides]);

const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
        const maxPageIndex = Math.max(0, totalSlides - slidesToShow);
        let nextIndex = prevIndex + slidesToScroll;

        if (nextIndex > maxPageIndex) { // maxPageIndex를 초과하면
            if (maxPageIndex === 0) { // 슬라이드가 한 페이지 미만이어서 이동할 필요가 없는 경우
                return 0;
            }
            return 0; // 처음으로 돌아감 (무한 루프)
            // 또는 nextIndex = maxPageIndex; // 마지막 그룹을 보여주고 멈춤
        }
        return nextIndex;
    });
}, [slidesToScroll, totalSlides, slidesToShow]);

// goToPrev 수정 제안
const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
        const maxPageIndex = Math.max(0, totalSlides - slidesToShow);
        let prevIndexCandidate = prevIndex - slidesToScroll;

        if (prevIndexCandidate < 0) {
            // 음수가 되면 마지막 페이지로 이동
            return maxPageIndex;
        }
        return prevIndexCandidate;
    });
}, [slidesToScroll, totalSlides, slidesToShow]);

  // 자동 재생
  useEffect(() => {
    let intervalId;
    if (autoPlay) {
      intervalId = setInterval(goToNext, autoPlayInterval);
    }
    return () => clearInterval(intervalId);
  }, [autoPlay, autoPlayInterval, goToNext]);

  // 레이아웃 업데이트 useEffect (초기 렌더링 및 ResizeObserver)
  useEffect(() => {
    let animationFrameId;

    const observer = new ResizeObserver(() => {
        // ResizeObserver 콜백 내에서 직접 DOM 조작 대신
        // requestAnimationFrame으로 updateSliderLayout 호출
        animationFrameId = requestAnimationFrame(() => {
            updateSliderLayout();
        });
    });

    if (sliderWrapperRef.current) {
        observer.observe(sliderWrapperRef.current);
    }

    // 초기 마운트 시에도 레이아웃 업데이트 (0ms setTimeout 대신 RAF)
    // 이전에 사용했던 setTimeout(updateSliderLayout, 0)과 비슷한 효과를 냅니다.
    animationFrameId = requestAnimationFrame(() => {
        updateSliderLayout();
    });

    return () => {
      observer.disconnect(); // 옵저버 해제
      cancelAnimationFrame(animationFrameId); // RAF 요청 취소
    };
  }, [updateSliderLayout]); // 의존성 추가

  // currentIndex가 변경될 때마다 transform만 업데이트
  // 이 useEffect는 이제 위 useEffect에 흡수되어 필요 없거나,
  // 정말 transform만 바뀐다면 남겨둘 수 있습니다.
  // 여기서는 updateSliderLayout이 transform까지 포함하므로 주석 처리하거나 삭제합니다.
  /*
  useEffect(() => {
    updateSliderLayout();
  }, [currentIndex, updateSliderLayout]);
  */

  if (totalSlides === 0) {
    return <div className="slider-empty">표시할 슬라이드가 없습니다.</div>;
  }

  return (
    <div className="slider-container">
      <div
        className="slider-content-wrapper"
        ref={sliderWrapperRef}
      >
        <div
          className="slider-track"
          ref={sliderRef}
          // width는 JS에서 동적으로 설정됩니다. 여기서는 초기값 불필요.
        >
          {slides.map((child, index) => (
            <div
              key={index}
              className="slider-item"
              // width는 JS에서 동적으로 설정됩니다. 여기서는 초기값 불필요.
              // CSS에서 flex-basis를 사용하는 것이 가장 좋습니다.
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && totalSlides > slidesToShow && (
        <>
          <button className="slider-button prev" onClick={goToPrev}>&#10094;</button>
          <button className="slider-button next" onClick={goToNext}>&#10095;</button>
        </>
      )}

      {showDots && totalSlides > slidesToShow && (
        <div className="slider-dots">
          {Array.from({ length: Math.ceil(totalSlides / slidesToShow) }).map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`dot ${dotIndex * slidesToShow <= currentIndex && currentIndex < (dotIndex + 1) * slidesToShow ? 'active' : ''}`}
              onClick={() => setCurrentIndex(dotIndex * slidesToShow)}
            ></span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;