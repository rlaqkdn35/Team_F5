// Page/SignUpPage/SignUpPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUpPage.css';

const SignUpPage = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmpassword: '',
    nickname: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { username, password, confirmpassword, nickname, email } = form;

    if (password !== confirmpassword) {
      setMessage('❗ 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setMessage('회원가입 처리 중입니다...');

      const response = await axios.post('http://localhost:8084/F5/user/register', {
        userId: username,
        pw: password,
        nickname: nickname,
        email: email
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.status === 200) {
        setMessage('✅ 회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      if (error.response?.status === 409) {
        setMessage('❗ 이미 존재하는 아이디 또는 이메일입니다.');
      } else {
        setMessage('❗ 회원가입에 실패했습니다. 정보를 확인해주세요.');
      }
    }
  };

  return (
    <div className="login-page-container">
      <div className="branding-section">
        <div className="branding-content">
          <img src='MainIcon2.png' className='ai-logo' alt="AI 로고"/>
          <p className="branding-slogan">복잡한 시장, AI가 찾아낸 기회</p>
        </div>
      </div>
      <div className="login-form-section">
        <div className="login-content-wrapper">
          <h1 className="login-title">회원가입</h1>
          <p className="login-slogan">AI 기반 투자를 경험하기 위해 가입해주세요.</p>

          <form onSubmit={handleSubmit} className="login-form">
            {['username', 'password', 'confirmpassword', 'nickname', 'email'].map((field, idx) => (
              <div className="form-group" key={idx}>
                <label htmlFor={field}>{
                  { username: '아이디', password: '비밀번호', confirmpassword: '비밀번호 확인', nickname: '닉네임', email: '이메일' }[field]
                }</label>
                <input
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                  id={field}
                  name={field}
                  placeholder={{
                    username: '사용할 아이디를 입력해주세요',
                    password: '사용할 비밀번호를 입력해주세요',
                    confirmpassword: '비밀번호를 다시 입력해주세요',
                    nickname: '표시될 닉네임을 입력해주세요',
                    email: '연락받을 이메일을 입력해주세요',
                  }[field]}
                  value={form[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            <button type="submit" className="login-button">회원가입 완료</button>
          </form>

          {message && <p className="result-message">{message}</p>}

          <div className="login-links">
            <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default SignUpPage;
