// src/pages/StockDetailPage/tabs/StockDiscussionTab.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa'; // 필요한 아이콘만 남김
import './StockDiscussionTab.css'; // 이 탭의 스타일 (기존 StockDiscussionTab.css 사용)

// 메시지 타입 정의 - 백엔드의 enum과 일치시킴
const MessageType = {
  ENTER: 'ENTER',
  TALK: 'TALK',
  QUIT: 'QUIT'
};

// 개별 채팅 메시지 컴포넌트
const ChatMessage = ({ message, currentUserId }) => { // onFileDownload 제거
  // 백엔드 Chatting 엔티티 필드명 사용: chat_id, chat_content, created_at, chatFile, fileUrl, messageType
  const isMyMessage = message.chat_id === currentUserId;
  const isSystemMessage = message.messageType === MessageType.ENTER || message.messageType === MessageType.QUIT;

  const displayTime = message.created_at
    ? new Date(message.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  // 파일 메시지 렌더링 로직 삭제 (파일 탭 삭제로 인해)
  // 파일 메시지를 채팅창에 직접 표시해야 한다면 이 부분은 유지해야 합니다.
  // 현재는 파일 탭 삭제 요청에 따라 파일 메시지 렌더링 로직도 함께 제거합니다.
  // 만약 채팅창에 파일명과 다운로드 버튼을 계속 표시하고 싶다면, ChatMessage 컴포넌트를 다시 수정해야 합니다.

  return (
    <div className={`chat-message-sdt ${isSystemMessage ? 'system-message-sdt' : isMyMessage ? 'my-message-sdt' : 'other-message-sdt'}`}>
      {!isSystemMessage && (
        <div className="message-header-sdt">
          {/* 아바타/프로필 사진 자리 (필요시 추가) */}
          {!isMyMessage && <span className="message-sender-sdt">{message.chat_id}</span>}
          <span className="message-time-sdt">{displayTime}</span>
        </div>
      )}

      <div className="message-content-sdt">
        {/* 파일 메시지 로직 제거, 일반 텍스트 메시지만 처리 */}
        <p className="message-text-sdt">{message.chat_content}</p>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.object.isRequired,
  currentUserId: PropTypes.string.isRequired,
  // onFileDownload: PropTypes.func.isRequired, // onFileDownload prop 제거
};


const StockDiscussionTab = ({ stockCode, currentUser }) => {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [croomIdx, setCroomIdx] = useState(null); // croomIdx 상태 추가
  const [loadingChat, setLoadingChat] = useState(true); // 채팅 로딩 상태 추
  const messagesEndRef = useRef(null); // 새 메시지 추가 시 자동 스크롤을 위한 ref
  const socketRef = useRef(null); // WebSocket 객체를 직접 저장
  const currentUserId = currentUser?.nickname || currentUser?.userId || "게스트";


  // --- Utility Functions ---
  const handleScrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 파일 다운로드 로직 및 파일 업로드 로직 제거 (사용되지 않으므로)
  // const handleFileDownload = useCallback((file_url, fileName) => { ... });
  // const handleFileUpload = useCallback(async (event) => { ... });


  // --- 메시지 전송 로직 ---
const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!currentUser) { // 로그인 여부 확인 추가
        alert('로그인 후 메시지를 전송할 수 있습니다.');
        return;
    }
    if (newMessage.trim() === '') return;

    const messageToSend = {
        messageType: MessageType.TALK,
        chat_content: newMessage,
        chat_id: currentUserId,
        croomIdx: croomIdx, // stockCode를 croom_idx로 사용
        createdAt: new Date().toISOString()
    };

    // UI에 즉시 낙관적 업데이트 (서버 응답 전에 미리 보여줌)
    const uiMessage = {
        chat_idx: `temp_${Date.now()}`, // 임시 ID
        ...messageToSend
    };
    setMessages(prevMessages => [...prevMessages, uiMessage]);
    setNewMessage('');

    try {
        // --- 여기를 수정합니다! ---
        // 서버에 메시지 저장 요청 (REST API) 부분을 제거하고,
        // 웹소켓을 통해서만 메시지를 전송하도록 합니다.
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(messageToSend));
            // 메시지가 웹소켓을 통해 서버에 도달하면, 서버가 DB에 저장하고
            // 다시 모든 클라이언트에게 브로드캐스트할 것입니다.
            // 따라서 여기서 별도의 성공/실패 처리는 웹소켓의 onmessage에서 담당합니다.
        } else {
            console.warn('웹소켓 연결이 없거나 닫혀 있습니다. 메시지가 다른 사용자에게 전달되지 않을 수 있습니다.');
            alert('채팅 서버 연결에 문제가 있어 메시지 전송에 실패했습니다.');
            setMessages(prevMessages => prevMessages.filter(msg => msg.chat_idx !== uiMessage.chat_idx)); // 롤백
        }
        // --- 수정 끝 ---

    } catch (error) {
        // 웹소켓 send 자체에서 발생하는 동기적 오류 처리
        console.error('메시지 전송 중 오류 발생:', error);
        alert('메시지 전송 중 오류가 발생했습니다.');
        setMessages(prevMessages => prevMessages.filter(msg => msg.chat_idx !== uiMessage.chat_idx)); // 롤백
    }
}, [newMessage, currentUserId, croomIdx, currentUser]); // currentUser 의존성 추가

  // --- 1. stockCode로 croomIdx 조회 ---
  useEffect(() => {
    const fetchCroomIdx = async () => {
      setLoadingChat(true); // 로딩 시작
      try {
        // stockCode를 사용하여 백엔드로부터 croomIdx를 조회
        const response = await axios.get(`http://localhost:8084/F5/chat/room-id/${stockCode}`);
        if (response.data.success) {
          setCroomIdx(response.data.croomIdx);
          console.log(`종목 코드 ${stockCode}에 대한 croomIdx: ${response.data.croomIdx} 로드 성공.`);
        } else {
          console.error('croomIdx 조회 실패:', response.data.message);
          //alert('채팅방 정보를 불러올 수 없습니다: ' + response.data.message);
          setCroomIdx(null); // 실패 시 null로 설정
        }
      } catch (error) {
        console.error('croomIdx 조회 중 오류 발생:', error);
        //alert('채팅방 정보를 불러오는 중 오류가 발생했습니다.');
        setCroomIdx(null); // 오류 시 null로 설정
      } finally {
        setLoadingChat(false); // 로딩 종료
      }
    };

    if (stockCode) {
      fetchCroomIdx();
    }
  }, [stockCode]); // stockCode가 변경될 때마다 croomIdx를 다시 조회

  // --- 초기 채팅 내역 로드 ---
  useEffect(() => {
    if (croomIdx) { // currentUserId 조건 제거 (로그인 없이도 내역 로드)
      axios.get(`http://localhost:8084/F5/chat/history/${croomIdx}`)
        .then(response => {
          if (Array.isArray(response.data.messages)) {
            setMessages(response.data.messages);
          } else {
            console.warn("예상치 못한 채팅 내역 데이터 형식:", response.data);
          }
        })
        .catch(error => {
          console.error('채팅 내역을 불러오는 중 오류 발생:', error);
          setMessages([]);
        });

    }
  }, [croomIdx]); // currentUserId 의존성 제거

  // --- WebSocket 연결 로직 ---
  useEffect(() => {
    // currentUserId가 "게스트"가 아닐 때만 웹소켓 연결 시도 (로그인 사용자만 웹소켓 연결)
    if (croomIdx && currentUser && !socketRef.current) { // currentUser 조건 추가
      const websocketUrl = `ws://192.168.219.244:8084/F5/ws/chat?stockCode=${croomIdx}`;
      const ws = new WebSocket(websocketUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 연결 성공:', croomIdx, '사용자:', currentUserId);
        const enterMessage = {
          messageType: MessageType.ENTER,
          chat_content: `${currentUserId}님이 입장하셨습니다.`,
          chat_id: currentUserId,
          croomIdx: croomIdx,
          createdAt: new Date().toISOString()
        };
        ws.send(JSON.stringify(enterMessage));
      };

      ws.onmessage = (event) => {
        try {
          const chatMessage = JSON.parse(event.data);
          // console.log('수신된 메시지:', chatMessage);

          // 본인이 보낸 TALK 메시지는 낙관적 업데이트되었으므로 무시 (서버가 브로드캐스트하는 경우)
          if (chatMessage.messageType === MessageType.TALK && chatMessage.chat_id === currentUserId) {
            // 선택적: 낙관적 업데이트된 임시 메시지를 서버에서 받은 실제 메시지로 교체하는 로직
            // setMessages(prevMessages => prevMessages.map(msg => msg.chat_idx === `temp_${chatMessage.timestamp}` ? chatMessage : msg));
            return;
          }

          setMessages(prevMessages => [...prevMessages, chatMessage]);

          // 파일 목록 실시간 업데이트 로직 제거
          // if (chatMessage.chatFile && chatMessage.fileUrl) { ... }

        } catch (error) {
          console.error('메시지 파싱 오류:', error, event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket 연결 종료:', croomIdx, 'Code:', event.code, 'Reason:', event.reason);
      };

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
      };

      // 컴포넌트 언마운트 시 정리
      return () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const quitMessage = {
            messageType: MessageType.QUIT,
            chat_content: `${currentUserId}님이 퇴장하셨습니다.`,
            chat_id: currentUserId,
            croomIdx: croomIdx,
            created_at: new Date().toISOString()
          };
          socketRef.current.send(JSON.stringify(quitMessage));
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }
    // currentUser가 없거나 "게스트"이면 웹소켓 연결 시도 안 함
    else if (!currentUser && socketRef.current) {
        // 로그인 상태가 아닐 때 웹소켓이 열려있다면 닫기 (새로고침 등에 대비)
        console.log('로그인 상태가 아니므로 웹소켓 연결을 닫습니다.');
        socketRef.current.close();
        socketRef.current = null;
    }

  }, [croomIdx, currentUserId, currentUser]); // currentUser 의존성 추가

  // 메시지 상태가 업데이트될 때마다 스크롤을 하단으로
  useEffect(() => {
    handleScrollToBottom();
  }, [messages, handleScrollToBottom]);

  // --- UI TABS (채팅 탭만 남김) ---
  // const [activeTab, setActiveTab] = useState('chat'); // 더 이상 필요 없음
  // const tabData = [ ... ]; // 더 이상 필요 없음

  return (
    <div className="stock-discussion-tab-container">
      {/* 탭 메뉴 제거 */}
      {/* <div className="tab-menu-sdt"> ... </div> */}

      {/* 탭 내용 (채팅 탭만 남김) */}
      <div className="tab-content-area-sdt">
        <>
          <div className="chat-messages-area-sdt" ref={messagesEndRef}>
            {messages.length === 0 ? (
              <div className="no-message-sdt">메시지가 없습니다.</div>
            ) : (
              messages.map((msg, index) => {
                const currentMsgDate = msg.created_at ? new Date(msg.created_at).toLocaleDateString('ko-KR') : '';
                const prevMsgDate = index > 0 && messages[index - 1].created_at
                  ? new Date(messages[index - 1].created_at).toLocaleDateString('ko-KR')
                  : null;
                const showDateDivider = currentMsgDate !== prevMsgDate;

                return (
                  <React.Fragment key={msg.chat_idx || `msg-${index}`}>
                    {showDateDivider && msg.created_at && (
                      <div className="date-divider-sdt">
                        <span>{getFormattedDate(msg.created_at)}</span>
                      </div>
                    )}
                    <ChatMessage
                      message={msg}
                      currentUserId={currentUserId}
                      // onFileDownload prop 제거
                    />
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* 메시지 입력 영역 */}
          <form className="message-input-form-sdt" onSubmit={handleSendMessage}>
            {/* 파일 업로드 관련 input 및 label 제거 */}
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={currentUser ? "메시지를 입력하세요..." : "로그인 후 채팅을 입력할 수 있습니다."}
              className="message-input-sdt"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={!currentUser} // 로그인 여부에 따라 disabled 속성 변경
            />
            <button type="submit" className="send-button-sdt" disabled={!currentUser || newMessage.trim() === ''}>
              <FaPaperPlane /> 전송
            </button>
          </form>
        </>
      </div>

      {/* 참여자 목록 보기 버튼 제거 */}
      {/* {!showUserList && (activeTab === 'chat' || activeTab === 'file') && ( ... )} */}
    </div>
  );
};

StockDiscussionTab.propTypes = {
  stockCode: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({ name: PropTypes.string }),
};

export default StockDiscussionTab;