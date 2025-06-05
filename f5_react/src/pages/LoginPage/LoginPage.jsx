import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/'; // 기본 리디렉션 경로 설정

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. 로그인 요청
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      await axios.post('http://localhost:8084/F5/api/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      });

      axios.get("http://localhost:8084/F5/api/me", {
        withCredentials: true
      }).then((res) => {
        console.log(res.data); // ✅ loginUser 정보
      }).catch(() => {
        console.log("Not logged in");
      });

      // 2. 로그인 성공 후 사용자 정보 요청
      const res = await axios.get('http://localhost:8084/F5/api/login/success', {
        withCredentials: true,
      });

      const user = res.data;
      console.log('로그인 성공:', user);
      onLoginSuccess(user); // 부모 컴포넌트로 전달
      setCredentials({ username: '', password: '' });
      navigate(from, { replace: true });

    } catch (error) {
      console.error('로그인 실패:', error);
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8084/F5/oauth2/authorization/${provider}`;
  };

  return (
    <div className="login-page-container">
      <div className="branding-section">
        <div className="branding-content">
          <img src="/MainIcon2.png" className="ai-logo" alt="AI 로고" />
          <p className="branding-slogan">복잡한 시장, AI가 찾아낸 기회</p>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-content-wrapper">
          <h1 className="login-title">환영합니다!</h1>
          <p className="login-slogan">AI 기반 투자 분석을 경험하세요.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="아이디를 입력해주세요"
                required
                value={credentials.username}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호"
                required
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="login-button">로그인</button>
          </form>

          <div className="login-links">
            <Link to="/find-user">아이디/비밀번호 찾기</Link>
            <Link to="/signup">회원가입</Link>
          </div>

          <div className="social-login-section">
            <p className="social-login-title">SNS 로그인</p>
            <button className="social-login-btn google" onClick={() => handleSocialLogin('google')}>구글로 로그인</button>
            <button className="social-login-btn kakao" onClick={() => handleSocialLogin('kakao')}>카카오로 로그인</button>
            <button className="social-login-btn naver" onClick={() => handleSocialLogin('naver')}>네이버로 로그인</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
