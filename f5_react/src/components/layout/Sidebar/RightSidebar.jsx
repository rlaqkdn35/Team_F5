import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트
import './RightSidebar.css'; // RightSidebar 스타일

const RightSidebar = ({ currentUser }) => {
  // 알림창 표시 여부를 관리하는 상태
  const [showNotification, setShowNotification] = useState(false);
  // 사용자 닉네임 상태
  const [userNickname, setUserNickname] = useState('');
  // 사용자 관심종목 상태 (예시 데이터 - 실제 데이터로 교체 필요)
  const [userInterestItems, setUserInterestItems] = useState([]);
  // 닉네임 옆의 새 알림 아이콘 표시 여부
  const [showNewActivityIcon, setShowNewActivityIcon] = useState(false);

  const navigate = useNavigate(); // useNavigate 훅 사용

  // currentUser prop이 변경될 때마다 실행
  useEffect(() => {
    if (currentUser) {
      // 로그인 상태일 때
      setUserNickname(currentUser.nickname || '익명의 사용자'); // currentUser.nickname 사용
      // 실제 관심종목 데이터는 백엔드에서 가져오거나 currentUser 객체에 포함될 수 있습니다.
      setUserInterestItems(['주식', '부동산', '암호화폐']); // 예시 데이터
      setShowNotification(true); // 로그인 시 알림창 표시
      setShowNewActivityIcon(true); // 로그인 시 닉네임 옆 새 알림 아이콘 표시
    } else {
      // 로그아웃 상태일 때
      setUserNickname('');
      setUserInterestItems([]);
      setShowNotification(false);
      setShowNewActivityIcon(false);
    }
  }, [currentUser]); // currentUser가 변경될 때마다 이 효과를 재실행

  // 닫기 버튼 클릭 핸들러 (메인 알림창)
  const handleCloseNotification = (event) => {
    event.stopPropagation(); // 알림창 클릭 이벤트 전파 방지
    setShowNotification(false);
  };

  // 알림창 클릭 시 '/ai-picks/signal'로 이동
  const handleNotificationClick = () => {
    navigate('/ai-picks/signal');
  };

  // 관심종목 클릭 시 '/mypage/favorite'으로 이동
  const handleInterestItemClick = () => {
    navigate('/mypage/favorite');
  };

  return (
    <aside className="app-right-sidebar">
      {/* 닉네임의 관심 종목 (세션 2) */}
      {currentUser && (
        <div className="user-info-section">
          <p className="nickname-display">
            안녕하세요, {userNickname}님!
            {showNewActivityIcon && (
              <span className="new-activity-icon" title="새로운 활동 알림">
                &#9654; {/* 오른쪽 화살표 유니코드 */}
              </span>
            )}
          </p>
          <div className="interest-items-container">
            <p className="interest-title">관심 종목:</p>
            <ul className="interest-list">
              {userInterestItems.map((item, index) => (
                <li key={index} className="interest-item" onClick={handleInterestItemClick}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 메시지창 (세션 1) - showNotification 상태가 true일 때만 표시 */}
      {showNotification && (
        <div className="notification-bar" onClick={handleNotificationClick}> {/* 알림창 클릭 이벤트 추가 */}
          <p>새로운 업데이트가 있습니다! 확인해 보세요.</p>
          <button className="close-btn" onClick={handleCloseNotification}> {/* 닫기 버튼 클릭 이벤트는 별도로 처리 */}
            &times; {/* 'x' 아이콘 */}
          </button>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;