import React, { useState, useEffect } from 'react';
import './UserProfileEditPage.css'; // 관련 CSS 파일
import { useNavigate } from 'react-router-dom';

const UserProfileEditPage = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  // 이 페이지 자체도 ProtectedRoute로 감싸는 것이 일반적입니다.
   console.log('UserProfileEditPage - currentUser:', currentUser);
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  if (!currentUser) {
    return (
      <div className="user-profile-edit-container">
        <h2>회원 정보 수정</h2>
        <p className="loading-message">사용자 정보를 불러오는 중입니다...</p>
        {/* 또는 간단하게 return null; */}
      </div>
    );
  }
  return (
    <div className="user-profile-edit-container">
      <h2>회원 정보 수정</h2>
      <form>
        <div className="form-group">
          <label>아이디</label>
          <input type="text" value={currentUser.userId || '정보 없음'} readOnly className="read-only" />
        </div>

        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            value={currentUser.nickname || '정보 없음'}
            maxLength="20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={currentUser.email || '정보 없음'}
          />
        </div>

        <div className="password-change-section">
          <h3>비밀번호 변경</h3>
          <div className="form-group">
            <label htmlFor="current-password">현재 비밀번호</label>
            <input
              type="password"
              id="current-password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password">새 비밀번호</label>
            <input
              type="password"
              id="new-password"
              autoComplete="new-password"
            />
        </div>

          <div className="form-group">
            <label htmlFor="confirm-new-password">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirm-new-password"
              autoComplete="new-password"
            />
          </div>
        </div>


        <div className="form-actions">
          <button type="submit" className="save-button">정보 저장</button>
          <button type="button" className="cancel-button" onClick={() => {/* 취소 로직: 예: navigate('/') */}}>취소</button>
        </div>
      </form>

    </div>
  );
};

export default UserProfileEditPage;