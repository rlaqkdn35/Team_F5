import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserProfilePage.css'; // 이 컴포넌트의 스타일 파일
// import { FaUserEdit, FaLock, FaListAlt, FaComments, FaBell, FaSignOutAlt, FaUserSlash } from 'react-icons/fa'; // 아이콘 예시

// App.js에서 currentUser 정보를 props로 받거나, Context API/전역 상태관리 사용
const MyPage = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  // currentUser가 없으면 (비로그인 상태) 로그인 페이지로 리디렉션 (App.js에서 이미 처리했을 수 있음)
  // 이 페이지 자체도 ProtectedRoute로 감싸는 것이 일반적입니다.
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: '/mypage' } } });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div className="loading-message-mypage">사용자 정보를 불러오는 중...</div>; // 또는 리디렉션 대기 중 표시
  }

  const handleEditProfile = () => {
    navigate('/edit-profile'); // 회원정보 수정 페이지 경로 (예시)
  };

  const handleChangePassword = () => {
    navigate('/change-password'); // 비밀번호 변경 페이지 경로 (예시)
  };
  
  const handleDeleteAccount = () => {
    if (window.confirm("정말로 회원 탈퇴를 진행하시겠습니까? 모든 사용자 데이터가 삭제되며 복구할 수 없습니다.")) {
      // 실제 회원 탈퇴 API 호출 및 로직 처리
      console.log("회원 탈퇴 처리...");
      // onLogout(); // 탈퇴 후 로그아웃 처리
      // navigate('/'); // 홈으로 이동
    }
  };

  return (
    <div className="my-page-container">
      <h1 className="page-main-title-mypage">마이페이지</h1>

      <section className="profile-info-section-mypage">
        <h2 className="section-title-mypage">회원 정보</h2>
        <div className="profile-details">
          <p><strong>아이디:</strong> {currentUser.id || '정보 없음'}</p> {/* 실제로는 currentUser.username 또는 id 등 */}
          <p><strong>닉네임:</strong> {currentUser.name || currentUser.nickname || '정보 없음'}</p>
          <p><strong>이메일:</strong> {currentUser.email || '정보 없음'}</p>
        </div>
        <div className="profile-actions">
          <button onClick={handleEditProfile} className="action-button-mypage">회원정보 수정</button>
        </div>
      </section>

      <section className="my-activity-links-section">
        <h2 className="section-title-mypage">나의 활동 바로가기</h2>
        <ul className="activity-link-list">
          <li><Link to="/my-stocks" className="activity-link">My종목 (관심 종목)</Link></li>
          <li><Link to="/forum/my-activity" className="activity-link">토론실 나의 활동</Link></li>
          <li><Link to="/trading-signals/my-signals" className="activity-link">나의 매매신호</Link></li>
          {/* 필요에 따라 다른 개인화된 페이지 링크 추가 */}
        </ul>
      </section>
      
      {/* 선택: 알림 설정 등 다른 섹션 추가 가능 */}
      {/* <section className="notification-settings-section">
        <h2 className="section-title-mypage">알림 설정</h2>
        <Link to="/settings/notifications" className="activity-link">알림 설정 바로가기</Link>
      </section>
      */}

      <section className="account-management-section">
        <h2 className="section-title-mypage">계정 관리</h2>
        <button onClick={onLogout} className="action-button-mypage logout">로그아웃</button>
        <button onClick={handleDeleteAccount} className="action-button-mypage delete-account">회원 탈퇴</button>
      </section>
    </div>
  );
};

// MyPage.propTypes = {
//   currentUser: PropTypes.object, // 또는 더 구체적인 shape
//   onLogout: PropTypes.func.isRequired,
// };

export default MyPage;