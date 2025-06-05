// src/pages/FindUserPage/FindUserPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../LoginPage/LoginPage.css'; // 로그인 페이지의 공통 CSS 재사용
import './FindUserPage.css'; // 이 페이지 전용 CSS

const FindUserPage = () => {
  // 아이디 찾기 상태: 이메일만 필요
  const [findIdEmail, setFindIdEmail] = useState('');
  const [findIdResultMessage, setFindIdResultMessage] = useState('');

  // 비밀번호 찾기 상태: 아이디와 이메일 필요
  const [forgotPwUserId, setForgotPwUserId] = useState('');
  const [forgotPwEmail, setForgotPwEmail] = useState('');
  const [forgotPwResultMessage, setForgotPwResultMessage] = useState('');

  // 아이디 찾기 제출 핸들러
  const handleFindIdSubmit = (e) => {
    e.preventDefault();
    setFindIdResultMessage('아이디를 찾는 중입니다...');

    // TODO: 실제 아이디 찾기 API 호출 로직 구현
    // 이메일을 백엔드로 보내서 해당 이메일로 가입된 아이디를 조회
    setTimeout(() => {
      // 목업 예시: 'test@example.com'으로 찾았을 때 'testuser' 반환
      if (findIdEmail === 'test@example.com') {
        // 이메일 전송 없이 바로 화면에 아이디 표시
        setFindIdResultMessage('회원님의 아이디는 "<span class="highlight-id">testuser</span>" 입니다.');
      } else {
        setFindIdResultMessage('등록되지 않은 이메일 주소입니다. 다시 확인해주세요.');
      }
    }, 2000);
  };

  // 비밀번호 찾기 제출 핸들러
  const handleForgotPwSubmit = (e) => {
    e.preventDefault();
    setForgotPwResultMessage('비밀번호를 재설정하는 중입니다...');

    // TODO: 실제 비밀번호 찾기(재설정) API 호출 로직 구현
    // 아이디와 이메일을 백엔드로 보내서 비밀번호 재설정 처리
    setTimeout(() => {
      // 목업 예시: 'testuser'와 'test@example.com'이 일치하면 성공
      if (forgotPwUserId === 'testuser' && forgotPwEmail === 'test@example.com') {
        // 이메일 전송 없이 바로 화면에 재설정 완료 메시지 표시
        setForgotPwResultMessage('비밀번호 재설정이 완료되었습니다. 새 비밀번호로 로그인해주세요.');
        // 실제 구현에서는 여기에 새 비밀번호 입력 폼을 띄우거나, 임시 비밀번호를 발급하는 등의 후속 조치가 필요할 수 있습니다.
      } else {
        setForgotPwResultMessage('입력하신 정보와 일치하는 계정이 없습니다. 다시 확인해주세요.');
      }
    }, 2000);
  };

  return (
    <div className="find-user-page-container">
      {/* 아이디 찾기와 비밀번호 찾기 섹션을 묶는 wrapper */}
      <div className="recovery-sections-wrapper">
        {/* 좌측: 아이디 찾기 섹션 */}
        <div className="recovery-section find-id-section">
          <div className="recovery-content-wrapper">
            <h1 className="recovery-title">아이디 찾기</h1>
            <p className="recovery-slogan">가입 시 등록한 이메일을 입력해주세요.</p>

            <form onSubmit={handleFindIdSubmit} className="recovery-form">
              <div className="form-group">
                <label htmlFor="findIdEmail">이메일</label>
                <input
                  type="email"
                  id="findIdEmail"
                  placeholder="이메일 주소를 입력해주세요"
                  value={findIdEmail}
                  onChange={(e) => setFindIdEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="recovery-button">아이디 찾기</button>
            </form>

            {/* innerHTML 사용에 주의 (XSS 공격 방어) */}
            {findIdResultMessage && <p className="result-message" dangerouslySetInnerHTML={{ __html: findIdResultMessage }}></p>}

          </div>
        </div>

        {/* 우측: 비밀번호 찾기 섹션 */}
        <div className="recovery-section forgot-pw-section">
          <div className="recovery-content-wrapper">
            <h1 className="recovery-title">비밀번호 찾기</h1>
            <p className="recovery-slogan">아이디와 이메일을 입력해주세요.</p>

            <form onSubmit={handleForgotPwSubmit} className="recovery-form">
              <div className="form-group">
                <label htmlFor="forgotPwUserId">아이디</label>
                <input
                  type="text"
                  id="forgotPwUserId"
                  placeholder="아이디를 입력해주세요"
                  value={forgotPwUserId}
                  onChange={(e) => setForgotPwUserId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="forgotPwEmail">이메일</label>
                <input
                  type="email"
                  id="forgotPwEmail"
                  placeholder="가입 시 등록한 이메일"
                  value={forgotPwEmail}
                  onChange={(e) => setForgotPwEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="recovery-button">비밀번호 찾기</button>
            </form>

            {forgotPwResultMessage && <p className="result-message">{forgotPwResultMessage}</p>}

          </div>
        </div>
      </div> {/* recovery-sections-wrapper 종료 */}

      {/* 두 섹션 아래에 통합된 recovery-links */}
      <div className="recovery-links-footer">
        <Link to="/login" className="footer-link-button">로그인</Link>
        <Link to="/signup" className="footer-link-button">회원가입</Link>
      </div>
    </div>
  );
};

export default FindUserPage;