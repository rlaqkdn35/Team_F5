import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ userId: '', password: '' });
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/Main';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const loginResponse = await axios.post(
                'http://localhost:8084/F5/user/login',
                {
                    userId: credentials.userId,
                    pw: credentials.password,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );

            const sessionCheckResponse = await axios.get(
                'http://localhost:8084/F5/user/me',
                { withCredentials: true }
            );

            const user = sessionCheckResponse.data;
            if (user) {
                // 여기서 userId를 로컬 스토리지에 저장
                localStorage.setItem('userId', user.userId);

                onLoginSuccess(user);
                alert(`환영합니다, ${user.userId}님!`);
                navigate(from, { replace: true });
            } else {
                alert('로그인에 실패했습니다. 사용자 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('로그인 중 오류:', error);
            if (error.response && error.response.status === 401) {
                alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
            } else {
                alert('로그인 중 알 수 없는 오류가 발생했습니다.');
            }
        }
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
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
