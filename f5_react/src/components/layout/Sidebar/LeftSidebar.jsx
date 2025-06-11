import React from 'react';
import './LeftSidebar.css'; // 왼쪽 사이드바 스타일 임포트

const Sidebar = () => {
  return (
    <aside className="app-left-sidebar">
      {/* 스마트 인재개발원 광고 섹션만 남김 */}
      <div className="ad-section">
        <h4>스마트 인재개발원</h4>
        <p>AI/데이터 인재 양성을 위한 최고의 선택!</p>
        <p className="ad-contact">지금 바로 문의하세요!</p>
        <a href="https://smhrd.or.kr/" target="_blank" rel="noopener noreferrer" className="ad-button">
          자세히 알아보기
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
