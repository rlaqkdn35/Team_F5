// src/pages/SignupPage/SignupPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUpPage.css'; // 이 페이지 전용 CSS (선택 사항, 필요시 생성)

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState(''); // 닉네임 상태 추가
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // 회원가입 결과 메시지
  const navigate = useNavigate(); // 페이지 이동 훅

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(''); // 메시지 초기화

    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO: 실제 회원가입 API 호출 로직 구현
    // 예시: 서버로 데이터 전송
    // const userData = { username, password, nickname, email };
    // fetch('/api/signup', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(userData),
    // })
    // .then(response => response.json())
    // .then(data => {
    //   if (data.success) {
    //     setMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
    //     setTimeout(() => navigate('/login'), 2000); // 2초 후 로그인 페이지로 이동
    //   } else {
    //     setMessage(data.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    //   }
    // })
    // .catch(error => {
    //   console.error('회원가입 오류:', error);
    //   setMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    // });

    // 목업 예시 (API 호출 없이 바로 처리)
    setMessage('회원가입 처리 중입니다...');
    setTimeout(() => {
      if (username && password && nickname && email) { // 간단한 유효성 검사
        setMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        navigate('/login'); // 회원가입 성공 후 로그인 페이지로 이동
      } else {
        setMessage('회원가입에 실패했습니다. 모든 정보를 입력해주세요.');
      }
    }, 2000); // 2초 대기 후 메시지 및 이동
  };

  return (
    <div className="login-page-container"> {/* 기존 로그인 페이지 컨테이너 스타일 재사용 */}
      <div className="login-form-section"> {/* 기존 로그인 폼 섹션 스타일 재사용 */}
        <div className="login-content-wrapper">
          <h1 className="login-title">회원가입</h1>
          <p className="login-slogan">AI 기반 투자를 경험하기 위해 가입해주세요.</p>

          <form onSubmit={handleSubmit} className="login-form"> {/* 기존 폼 스타일 재사용 */}
            <div className="form-group">
              <label htmlFor="signupUsername">아이디</label>
              <input 
                type="text" 
                id="signupUsername" 
                placeholder="사용할 아이디를 입력해주세요" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupPassword">비밀번호</label>
              <input 
                type="password" 
                id="signupPassword" 
                placeholder="비밀번호 (8자 이상)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength="8"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input 
                type="password" 
                id="confirmPassword" 
                placeholder="비밀번호를 다시 입력해주세요" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                minLength="8"
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupNickname">닉네임</label> {/* 닉네임 필드 추가 */}
              <input 
                type="text" 
                id="signupNickname" 
                placeholder="표시될 닉네임을 입력해주세요" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupEmail">이메일</label>
              <input 
                type="email" 
                id="signupEmail" 
                placeholder="연락받을 이메일을 입력해주세요" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" className="login-button">회원가입 완료</button> {/* 기존 버튼 스타일 재사용 */}
          </form>

          {message && <p className="result-message">{message}</p>} {/* 결과 메시지 표시 */}

          <div className="login-links"> {/* 기존 링크 스타일 재사용 */}
            <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
          </div>
        </div>
      </div>

      {/* 우측 브랜딩 섹션은 로그인 페이지와 동일하게 유지 */}
      <div className="branding-section">
        <div className="branding-content">
          <img src='Mainlogo.png' className='ai-logo'/>
          {/* <img src="/path/to/your/ai-chart-mockup.png" alt="AI 분석 차트" className="ai-chart-mockup" /> */}
          <p className="branding-slogan">복잡한 시장, AI가 찾아낸 기회</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;