// MainPage.js (예시)
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MainPage.css'; // MainPage를 위한 CSS 파일 임포트

function MainPage() {
  return (
    // ✨ 부모 요소에 scroll-snap-type 속성을 적용할 클래스 추가
    <div className="main-page-container">
      {/* 슬라이드 1 */}
      <section className="full-page-section slide-one">
        <div className="ad-banner-section">
          <img src="chartImg.png" alt="Animated Stock Chart" className="ad-banner-image" />
          <Link to="/ai-info">
            <img src="Mainreverse.png" className='ad-banner-logo' alt="광고 배너 로고" />
          </Link>
          <div className="ad-banner-content">
            <h1>AI 투자, 당신의 잠재력을 깨울 시간!</h1>
            <p>
              더 이상 시장의 파도에 흔들리지 마세요.<br />
              3개의 모델을 통한 분석!
            </p>
            <p className="call-to-action">지금 바로 AI 주식 투자의 새로운 기준을 경험하세요!</p>
          </div>
        </div>
      </section>

      {/* 슬라이드 2 */}
      <section className="full-page-section slide-two">
        <h2>슬라이드 2 제목</h2>
        <p>여기는 슬라이드 2의 내용입니다. 스크롤을 한 번 내리면 이곳으로 이동합니다.</p>
        {/* 더 많은 컨텐츠 */}
      </section>

      {/* 슬라이드 3 */}
      <section className="full-page-section slide-three">
        <h2>슬라이드 3 제목</h2>
        <p>여기는 슬라이드 3의 내용입니다. 스크롤을 한 번 내리면 이곳으로 이동합니다.</p>
        {/* 더 많은 컨텐츠 */}
      </section>
      {/* 필요한 만큼 슬라이드를 추가합니다. */}
    </div>
  );
}

export default MainPage;