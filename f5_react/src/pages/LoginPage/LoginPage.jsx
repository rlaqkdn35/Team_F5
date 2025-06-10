import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => { // onLoginSuccess prop을 통해 App.js와 통신
    const [credentials, setCredentials] = useState({ userId: '', password: '' }); // userId 대신 userId로 변경
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/Main'; // 로그인 후 이동할 기본 경로

    // const { setLoggedInUser } = useContext(AuthContext); // AuthContext를 사용하는 경우

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. 일반 로그인 요청 (세션 쿠키를 받기 위한 POST 요청)
            const loginResponse = await axios.post(
                'http://localhost:8084/F5/user/login', // 백엔드 컨텍스트 패스 포함
                { 
                    userId: credentials.userId, // 백엔드 User 엔티티 필드명과 일치
                    pw: credentials.password   // 백엔드 User 엔티티 필드명과 일치
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true, // 세션 쿠키를 주고받기 위해 필수
                }
            );

            console.log('로그인 POST 응답:', loginResponse.data);

            // 2. 로그인 성공 후 세션에 저장된 사용자 정보를 가져오는 GET 요청
            //    이 요청 시 브라우저는 이전에 받은 JSESSIONID 쿠키를 자동으로 포함하여 보냄
            const sessionCheckResponse = await axios.get(
                'http://localhost:8084/F5/user/me', // 로그인된 사용자 정보 확인 엔드포인트
                {
                    withCredentials: true, // 쿠키 전송 필수
                }
            );

            const user = sessionCheckResponse.data;
            console.log('세션 유효성 확인 및 사용자 정보 GET 응답:', user);

            if (user) {
                // setLoggedInUser(user); // AuthContext를 사용하는 경우
                onLoginSuccess(user); // App.js의 상태 업데이트 함수 호출
                alert(`환영합니다, ${user.userId}님!`);
                navigate(from, { replace: true }); // 이전 페이지 또는 기본 페이지로 이동
            } else {
                alert('로그인에 실패했습니다. 사용자 정보를 가져올 수 없습니다.');
            }

        } catch (error) {
            console.error('로그인 중 오류 발생:', error.response?.status, error.response?.data, error.message);
            if (error.response && error.response.status === 401) {
                alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
            } else {
                alert('로그인 중 알 수 없는 오류가 발생했습니다.');
            }
        }
    };

    const handleSocialLogin = (provider) => { 
        // 백엔드 컨텍스트 패스 포함
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
            {/* ... (기존 HTML 구조 유지) ... */}
            
            <div className="login-form-section">
                <div className="login-content-wrapper">
                <h1 className="login-title">환영합니다!</h1>
                <p className="login-slogan">AI 기반 투자 분석을 경험하세요.</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                    <label htmlFor="userId">아이디</label>
                    <input
                        type="text"
                        id="userId"
                        name="userId"
                        placeholder="아이디를 입력해주세요"
                        required
                        value={credentials.userId}
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