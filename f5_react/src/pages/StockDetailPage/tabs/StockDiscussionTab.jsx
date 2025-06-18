// src/pages/StockDetailPage/tabs/StockDiscussionTab.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import SockJS from 'sockjs-client'; // SockJS 임포트
import './StockDiscussionTab.css';

// ==========================================================
// 1. 메시지 타입 정의 (최상위 스코프)
const MessageType = {
  ENTER: 'ENTER',
  TALK: 'TALK',
  QUIT: 'QUIT'
};

// ==========================================================
// 2. 개별 채팅 메시지 컴포넌트 (최상위 스코프)
// ChatMessage 컴포넌트가 MessageType을 사용하므로, MessageType 정의 이후에 와야 합니다.
const ChatMessage = ({ message, currentUserId }) => {
  const isMyMessage = message.chat_id === currentUserId;
  const isSystemMessage = message.messageType === MessageType.ENTER || message.messageType === MessageType.QUIT; // MessageType 사용

  const displayTime = message.created_at
    ? new Date(message.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  return (
    <div className={`chat-message-sdt ${isSystemMessage ? 'system-message-sdt' : isMyMessage ? 'my-message-sdt' : 'other-message-sdt'}`}>
      {!isSystemMessage && (
        <div className="message-header-sdt">
          {!isMyMessage && <span className="message-sender-sdt">{message.chat_id}</span>}
          <span className="message-time-sdt">{displayTime}</span>
        </div>
      )}
      <div className="message-content-sdt">
        <p className="message-text-sdt">{message.chat_content}</p>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.object.isRequired,
  currentUserId: PropTypes.string.isRequired,
};

// ==========================================================
// 3. StockDiscussionTab 컴포넌트 정의
const StockDiscussionTab = ({ stockCode, currentUser }) => {

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [croomIdx, setCroomIdx] = useState(null);
    const [loadingChat, setLoadingChat] = useState(true);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const currentUserId = currentUser?.nickname || currentUser?.userId || "게스트";

    // --- Utility Functions ---
    // getFormattedDate 함수가 이 스코프 내에 있으므로 JSX에서 접근 가능
    const getFormattedDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleScrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    // --- 메시지 전송 로직 ---
    // handleSendMessage 함수가 이 스코프 내에 있으므로 JSX에서 접근 가능
    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('로그인 후 메시지를 전송할 수 있습니다.');
            return;
        }
        if (newMessage.trim() === '') return;

        const messageToSend = {
            messageType: MessageType.TALK, // MessageType 사용
            chat_content: newMessage,
            chat_id: currentUserId,
            croomIdx: croomIdx,
            createdAt: new Date().toISOString()
        };

        const uiMessage = {
            chat_idx: `temp_${Date.now()}`,
            ...messageToSend
        };
        setMessages(prevMessages => [...prevMessages, uiMessage]);
        setNewMessage('');

        if (socketRef.current && socketRef.current.readyState === SockJS.OPEN) {
            socketRef.current.send(JSON.stringify(messageToSend));
            console.log('웹소켓 메시지 전송:', messageToSend);
        } else {
            console.warn('웹소켓 연결이 없거나 닫혀 있습니다. 메시지가 다른 사용자에게 전달되지 않을 수 있습니다.');
            alert('채팅 서버 연결에 문제가 있어 메시지 전송에 실패했습니다.');
            setMessages(prevMessages => prevMessages.filter(msg => msg.chat_idx !== uiMessage.chat_idx));
        }
    }, [newMessage, currentUserId, croomIdx, currentUser]);

    // --- 1. stockCode로 croomIdx 조회 ---
    useEffect(() => {
        const fetchCroomIdx = async () => {
            setLoadingChat(true);
            try {
                const response = await axios.get(`http://localhost:8084/F5/chat/room-id/${stockCode}`);
                if (response.data.success) {
                    setCroomIdx(response.data.croomIdx);
                    console.log(`종목 코드 ${stockCode}에 대한 croomIdx: ${response.data.croomIdx} 로드 성공.`);
                } else {
                    console.error('croomIdx 조회 실패:', response.data.message);
                    setCroomIdx(null);
                }
            } catch (error) {
                console.error('croomIdx 조회 중 오류 발생:', error);
                setCroomIdx(null);
            } finally {
                setLoadingChat(false);
            }
        };

        if (stockCode) {
            fetchCroomIdx();
        }
    }, [stockCode]);

    // --- 초기 채팅 내역 로드 ---
    useEffect(() => {
        if (croomIdx) {
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
    }, [croomIdx]);

    // --- WebSocket (SockJS) 연결 로직 ---
    useEffect(() => {
        if (croomIdx && currentUser) {
            if (socketRef.current && socketRef.current.readyState === SockJS.OPEN) {
                console.log('SockJS WebSocket이 이미 연결되어 있습니다.');
                return;
            }

            const socketUrl = `http://localhost:8084/F5/ws/chat?croomIdx=${croomIdx}`;
            console.log('SockJS 연결 시도 URL:', socketUrl);

            const ws = new SockJS(socketUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                console.log('SockJS WebSocket 연결 성공:', croomIdx, '사용자:', currentUserId);
                const enterMessage = {
                    messageType: MessageType.ENTER, // MessageType 사용
                    chat_content: `${currentUserId}님이 입장하셨습니다.`,
                    chat_id: currentUserId,
                    croomIdx: croomIdx,
                    createdAt: new Date().toISOString()
                };
                ws.send(JSON.stringify(enterMessage));
            };

            ws.onmessage = (event) => {
                try {
                    const receivedMessage = JSON.parse(event.data);
                    console.log('SockJS 웹소켓 메시지 수신:', receivedMessage);

                    setMessages(prevMessages => {
                        const updatedMessages = prevMessages.map(msg => {
                            if (msg.chat_idx && String(msg.chat_idx).startsWith('temp_') &&
                                msg.chat_content === receivedMessage.chat_content &&
                                msg.chat_id === receivedMessage.chat_id &&
                                msg.croomIdx === receivedMessage.croomIdx &&
                                receivedMessage.chat_idx !== 0 && receivedMessage.chat_idx !== null
                            ) {
                                return receivedMessage;
                            }
                            return msg;
                        });

                        const isAlreadyAdded = updatedMessages.some(msg => msg.chat_idx === receivedMessage.chat_idx);
                        if (!isAlreadyAdded) {
                            updatedMessages.push(receivedMessage);
                        }

                        return updatedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    });

                } catch (error) {
                    console.error('메시지 파싱 오류:', error, event.data);
                }
            };

            ws.onclose = (event) => {
                console.log('SockJS WebSocket 연결 종료:', croomIdx, 'Code:', event.code, 'Reason:', event.reason);
            };

            ws.onerror = (error) => {
                console.error('SockJS WebSocket 오류:', error);
            };

            return () => {
                if (socketRef.current && socketRef.current.readyState === SockJS.OPEN) {
                    const quitMessage = {
                        messageType: MessageType.QUIT, // MessageType 사용
                        chat_content: `${currentUserId}님이 퇴장하셨습니다.`,
                        chat_id: currentUserId,
                        croomIdx: croomIdx,
                        createdAt: new Date().toISOString()
                    };
                    socketRef.current.send(JSON.stringify(quitMessage));
                    socketRef.current.close();
                    socketRef.current = null;
                }
            };
        }
        else if ((!currentUser || !croomIdx) && socketRef.current) {
            console.log('로그인 상태가 아니거나 croomIdx가 없으므로 SockJS 웹소켓 연결을 닫습니다.');
            socketRef.current.close();
            socketRef.current = null;
        }

    }, [croomIdx, currentUserId, currentUser]);

    // 메시지 상태가 업데이트될 때마다 스크롤을 하단으로
    useEffect(() => {
        handleScrollToBottom();
    }, [messages, handleScrollToBottom]);

    return (
        <div className="stock-discussion-tab-container">
            <div className="tab-content-area-sdt">
                <div className="chat-messages-sdt" ref={messagesEndRef}>
                    {messages.length === 0 && !loadingChat && (
                        <p className="no-messages-sdt">아직 메시지가 없습니다.</p>
                    )}
                    {messages.map((msg, index) => {
                        // getFormattedDate 함수 사용
                        const currentDate = getFormattedDate(msg.createdAt);
                        const prevDate = index > 0 ? getFormattedDate(messages[index - 1].createdAt) : '';
                        const showDateDivider = currentDate !== prevDate;

                        return (
                            <React.Fragment key={msg.chat_idx || index}>
                                {showDateDivider && <div className="date-divider-sdt">{currentDate}</div>}
                                <ChatMessage key={msg.chat_idx} message={msg} currentUserId={currentUserId} />
                            </React.Fragment>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-form-sdt"> {/* handleSendMessage 함수 사용 */}
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={currentUser ? "메시지를 입력하세요..." : "로그인 후 채팅에 참여할 수 있습니다."}
                        className="chat-input-sdt"
                        disabled={!currentUser}
                    />
                    <button type="submit" className="send-button-sdt" disabled={!currentUser || newMessage.trim() === ''}>
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

StockDiscussionTab.propTypes = {
    stockCode: PropTypes.string.isRequired,
    currentUser: PropTypes.object,
};

export default StockDiscussionTab;