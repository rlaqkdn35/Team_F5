import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css'; // 스타일을 위한 CSS 파일

const NotFoundPage = ({ title, message, showGoHomeButton = true }) => {
  const pageTitle = title || "페이지를 찾을 수 없습니다";
  const pageMessage = message || "요청하신 페이지가 존재하지 않거나, 주소가 잘못 입력되었을 수 있습니다.";

  return (
    <div className="not-found-page-container">
      <div className="not-found-content">
        <h1>😢</h1>
        <h2>{pageTitle}</h2>
        <p>{pageMessage}</p>
        {showGoHomeButton && (
          <Link to="/" className="go-home-button">
            홈으로 돌아가기
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;