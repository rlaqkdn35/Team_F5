// src/pages/LoginPage/LoginPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // 여기에 로그인 처리 로직 (API 호출 등)
    console.log('로그인 시도');
  };

  return (
    <div className="login-page-container">


      {/* 우측: 시각적 브랜딩 섹션 (AI 로고 또는 차트) */}
      <div className="branding-section">
        <div className="branding-content">

          <img src="Mainlogo.png" className='ai-logo'/>
          {/* 옵션 2: AI 차트 이미지/시각화 
          <img src="/path/to/your/ai-chart-mockup.png" alt="AI 분석 차트" className="ai-chart-mockup" />
          */}
          <p className="branding-slogan">복잡한 시장, AI가 찾아낸 기회</p>

          {/* AI 관련 부가 정보 또는 애니메이션 추가 가능 */}
        </div>
      </div>

            {/* 좌측: 로그인 폼 섹션 */}
      <div className="login-form-section">
        <div className="login-content-wrapper">
          <h1 className="login-title">환영합니다!</h1>
          <p className="login-slogan">AI 기반 투자 분석을 경험하세요.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input 
                type="text" // type을 'text'로 변경 (이메일 형식이 아닐 수 있으므로)
                id="username" 
                placeholder="아이디를 입력해주세요" // 플레이스홀더 텍스트 변경
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input type="password" id="password" placeholder="비밀번호" required />
            </div>
            
            <button type="submit" className="login-button">로그인</button>
          </form>

          <div className="login-links">
            <Link to="/find-user">아이디비밀번호찾기</Link>
            
            <Link to="/signup">    회원가입</Link>
          </div>

          {/* 소셜 로그인 추가 영역 (선택 사항) */}
          {/* <div className="social-login-options">
            <p>또는 다음으로 로그인</p>
            <button className="social-button google">Google 로그인</button>
            <button className="social-button kakao">Kakao 로그인</button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;