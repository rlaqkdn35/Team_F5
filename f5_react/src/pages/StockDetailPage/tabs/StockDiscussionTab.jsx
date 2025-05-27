// src/pages/StockDetailPage/tabs/StockDiscussionTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaPaperPlane, FaUsers } from 'react-icons/fa'; // 아이콘 예시
import './StockDiscussionTab.css'; // 이 탭의 스타일

// 임시 목업 데이터
const mockInitialMessages = [
  { id: 'msg1', user: '투자왕개미', text: '이 종목 오늘 심상치 않은데요? 다들 어떻게 생각하시나요?', time: '10:30 AM' },
  { id: 'msg2', user: '성공투자', text: '오전장에 거래량 터지면서 상승세네요. 좋은 소식이라도 있나요?', time: '10:32 AM' },
  { id: 'msg3', user: '주식초보', text: '저는 아직 잘 모르겠지만, 다들 좋다고 하니 기대됩니다!', time: '10:35 AM' },
  { id: 'msg4', user: 'AI투자봇', text: '관련 뉴스: [속보] OO기업, XX분야 신기술 개발 성공!', time: '10:36 AM', isSystem: true },
  { id: 'msg5', user: '투자왕개미', text: '오! AI봇님 정보 감사합니다. 역시 뭔가 있었군요.', time: '10:38 AM' },
];

const mockUserList = ['투자왕개미', '성공투자', '주식초보', '고수익헌터', '단타여왕', '가치투자자'];

// 개별 채팅 메시지 컴포넌트
const ChatMessage = ({ message, currentUser }) => {
  const isMyMessage = message.user === currentUser; // 현재 사용자가 보낸 메시지인지 여부 (임시)
  const messageClass = message.isSystem ? 'system-message' 
                      : isMyMessage ? 'my-message' 
                      : 'other-message';
  return (
    <div className={`chat-message-sdt ${messageClass}`}> {/* SDT: StockDiscussionTab */}
      {!isMyMessage && !message.isSystem && <div className="message-sender-sdt">{message.user}</div>}
      <div className="message-content-sdt">
        <p className="message-text-sdt">{message.text}</p>
        <span className="message-time-sdt">{message.time}</span>
      </div>
    </div>
  );
};


const StockDiscussionTab = ({ stockCode, currentUser }) => { // currentUser는 로그인 정보 prop으로 가정
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [showUserList, setShowUserList] = useState(false); // 참여자 목록 표시 여부
  const messagesEndRef = useRef(null); // 새 메시지 추가 시 자동 스크롤을 위한 ref

  useEffect(() => {
    // 컴포넌트 마운트 시 또는 stockCode 변경 시 채팅 내용 및 참여자 목록 로드 (시뮬레이션)
    console.log(`Workspaceing discussion for stock: ${stockCode}`);
    // 실제로는 웹소켓 연결 및 이전 메시지 로드
    setMessages(mockInitialMessages);
    setUserList(mockUserList);
  }, [stockCode]);

  useEffect(() => {
    // 새 메시지가 추가될 때마다 맨 아래로 스크롤
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const msg = {
      id: `msg${messages.length + 1}`,
      user: currentUser?.name || '익명사용자', // 실제로는 로그인된 사용자 닉네임
      text: newMessage,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    // 실제로는 웹소켓으로 메시지 전송
    setMessages(prevMessages => [...prevMessages, msg]);
    setNewMessage('');
  };

  return (
    <div className="stock-discussion-tab">
      {/* <h2>{stockCode} 종목 토론방</h2> */} {/* 페이지 제목은 이미 StockDetailPage에 있음 */}
      
      <div className="chat-layout-sdt">
        <div className="chat-messages-area-sdt">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} currentUser={currentUser?.name} />
          ))}
          <div ref={messagesEndRef} /> {/* 자동 스크롤 타겟 */}
        </div>

        <aside className={`chat-user-list-area-sdt ${showUserList ? 'visible' : ''}`}>
          <div className="user-list-header-sdt">
            <h4>참여자 ({userList.length}명)</h4>
            <button onClick={() => setShowUserList(false)} className="close-user-list-sdt">&times;</button>
          </div>
          <ul>
            {userList.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </aside>
      </div>

      <form className="message-input-form-sdt" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="message-input-sdt"
          // disabled={!currentUser} // 로그인 안하면 입력 비활성화
        />
        <button type="submit" className="send-button-sdt" /*disabled={!currentUser}*/>
          <FaPaperPlane /> 전송
        </button>
      </form>
      
      {/* 참여자 목록 보기 버튼 (채팅방 오른쪽 위에 위치하도록 CSS 조정 필요) */}
      {!showUserList && (
        <button className="toggle-user-list-button-sdt" onClick={() => setShowUserList(true)} title="참여자 보기">
          <FaUsers /> <span>{userList.length}</span>
        </button>
      )}
    </div>
  );
};

StockDiscussionTab.propTypes = {
  stockCode: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({ name: PropTypes.string }), // 로그인한 사용자 정보
};

export default StockDiscussionTab;