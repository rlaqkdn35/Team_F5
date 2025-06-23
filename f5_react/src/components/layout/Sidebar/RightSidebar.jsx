import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RightSidebar.css';

const RightSidebar = ({ currentUser }) => {
 // 알림창 표시 여부를 관리하는 상태
 // 알림창 만들때 setShowNotification써야함
 const [showNotification, setShowNotification] = useState(true);

 
 // 사용자 닉네임 상태
 const [userNickname, setUserNickname] = useState('');
 // 사용자 관심종목 상태 (실제 데이터로 교체될 부분)
 const [userInterestItems, setUserInterestItems] = useState([]);
 // 닉네임 옆의 새 알림 아이콘 표시 여부
 const [showNewActivityIcon, setShowNewActivityIcon] = useState(false);
  // 로딩 상태 추가
  const [loadingInterestItems, setLoadingInterestItems] = useState(true);
  // 오류 상태 추가
  const [errorInterestItems, setErrorInterestItems] = useState(null);

 const navigate = useNavigate();

 // currentUser prop이 변경될 때마다 실행 (기존 로직 유지)
 useEffect(() => {
  if (currentUser) {
   setUserNickname(currentUser.nickname || '익명의 사용자');
   setShowNotification(false);
   setShowNewActivityIcon(true);
  } else {
   setUserNickname('');
   setUserInterestItems([]); // 로그아웃 시 관심 종목 초기화
   setShowNotification(false);
   setShowNewActivityIcon(false);
  }
 }, [currentUser]);

  // currentUser가 로그인 상태일 때만 관심 종목 데이터를 백엔드에서 가져오는 useEffect 추가
  useEffect(() => {
    if (currentUser) {
        setLoadingInterestItems(true);
        setErrorInterestItems(null);

        const userId = localStorage.getItem('userId'); // 로컬 스토리지에서 userId 가져오기

        if (!userId) {
            // userId가 없으면 데이터를 가져올 수 없음
            setErrorInterestItems("사용자 ID를 찾을 수 없습니다. 로그인 상태를 확인해주세요.");
            setLoadingInterestItems(false);
            setUserInterestItems([]);
            return;
        }

        const fetchInterestStocks = async () => {
            try {
                const response = await fetch(`http://localhost:8084/F5/userfav/list?userId=${userId}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`관심 종목을 불러오는 데 실패했습니다: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
                console.log("RightSidebar - 백엔드에서 받아온 관심 종목 데이터:", data);

                setUserInterestItems(data.slice(0, 3)); // 최신 3개만 유지
            } catch (err) {
                console.error("관심 종목 데이터 조회 중 오류 발생:", err);
                setErrorInterestItems(`관심 종목을 불러오는 데 실패했습니다: ${err.message}`);
                setUserInterestItems([]); // 오류 발생 시 데이터 초기화
            } finally {
                setLoadingInterestItems(false);
            }
        };

        fetchInterestStocks();
    } else {
        setLoadingInterestItems(false);
        setErrorInterestItems(null);
        setUserInterestItems([]);
    }
  }, [currentUser]);

 // 닫기 버튼 클릭 핸들러 (메인 알림창)
 const handleCloseNotification = (event) => {
  event.stopPropagation(); // 알림창 클릭 이벤트 전파 방지
  setShowNotification(false);
 };

 // 알림창 클릭 시 '/ai-picks/signal'로 이동
 const handleNotificationClick = () => {
  navigate('/ai-picks/signal');
 };

 // 관심종목 클릭 시 '/mypage/favorite'으로 이동 (최초 의도대로 복원)
 const handleInterestItemClick = () => {
  navigate('/mypage/favorite');
 };

  // '관심 종목 전체보기' 함수는 이제 필요 없으므로 제거합니다.

 return (
  <aside className="app-right-sidebar">
   {/* 닉네임의 관심 종목 (세션 2) */}
   {currentUser && (
    <div className="user-info-section">
     <p className="nickname-display">
      안녕하세요, 
      <br/>{userNickname}님!

     </p>
     <div className="interest-items-container">
      <p className="interest-title">관심 종목:</p>
            {loadingInterestItems ? (
                <p className="loading-message-sidebar">관심 종목 로딩 중...</p>
            ) : errorInterestItems ? (
                <p className="error-message-sidebar">{errorInterestItems}</p>
            ) : userInterestItems.length > 0 ? (
       <ul className="interest-list">
        {userInterestItems.map((item) => (
         <li key={item.stockCode} className="interest-item" onClick={handleInterestItemClick}>
          <span className="interest-stock-name-only">{item.stockName}</span>
         </li>
        ))}
       </ul>
      ) : (
                <p className="no-interest-items">관심 종목이 없습니다.</p>
            )}
            {/* '관심 종목 전체보기' 버튼은 이제 제거되었습니다. */}
     </div>
    </div>
   )}

   {/* 메시지창 (세션 1) - showNotification 상태가 true일 때만 표시 */}
   {showNotification && (
    <div className="notification-bar" onClick={handleNotificationClick}>
     <p>새로운 업데이트가 있습니다! 확인해 보세요.</p>
     <button className="close-btn" onClick={handleCloseNotification}>
      &times;
     </button>
    </div>
   )}
  </aside>
 );
};

export default RightSidebar;