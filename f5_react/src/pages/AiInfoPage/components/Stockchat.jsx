import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stockchat.css';

function Stockchat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showFAQ, setShowFAQ] = useState(false);

  const faqList = [
    "PER이란 무엇인가요?",
    "시가총액이 크면 무슨 의미가 있나요?",
    "ETF와 일반 주식의 차이는 무엇인가요?",
    "주가는 왜 오르고 내리나요?",
    "코스피와 코스닥의 차이점은?"
  ];

  useEffect(() => {
    setMessages([{ sender: "bot", text: "반가워 난 chatbot 이야~" }]);
  }, []);

  const sendMessage = async (customMessage) => {
    const msg = customMessage || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: msg }]);

    try {
      const res = await axios.post("http://localhost:5001/ai-info/Stockchat", {
        message: msg
      });
      const botMsg = { sender: "bot", text: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Axios 에러:", err.response ? err.response.data : err.message);
      setMessages(prev => [...prev, { sender: "bot", text: "GPT 서버 응답 오류" }]);
    }

    setInput("");
  };

  return (
    <div>
      <h2>💬 주식 ChatBot</h2>

      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender === "user" ? "사용자" : "ChatBot"}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {/* FAQ 토글 버튼 */}
      <button
        onClick={() => setShowFAQ(!showFAQ)}
      >
        FAQ {showFAQ ? "숨기기" : "보기"}
      </button>

      {/* FAQ 목록 */}
      {showFAQ && (
        <div>
          {faqList.map((question, idx) => (
            <div
              key={`faq-${idx}`}
              onClick={() => sendMessage(question)}
            >
              <strong>Q{idx + 1}:</strong> {question}
            </div>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        placeholder="메시지를 입력하세요"
      />
      <button onClick={() => sendMessage()} >
        전송
      </button>
    </div>
  );
}

export default Stockchat;


// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import './Stockchat.css'; // CSS 파일 임포트 확인

// function Stockchat() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [showFAQ, setShowFAQ] = useState(false);
//   const messageDisplayRef = useRef(null); // 메시지 스크롤을 위한 ref

//   const faqList = [
//     "PER이란 무엇인가요?",
//     "시가총액이 크면 무슨 의미가 있나요?",
//     "ETF와 일반 주식의 차이는 무엇인가요?",
//     "주가는 왜 오르고 내리나요?",
//     "코스피와 코스닥의 차이점은?"
//   ];

//   useEffect(() => {
//     // 챗봇 이름 변경: 주식전문가 아스트로
//     setMessages([{ sender: "bot", text: "안녕하세요! 저는 주식 전문가 아스트로입니다. 무엇을 도와드릴까요?" }]);
//   }, []);

//   // 메시지가 업데이트될 때마다 최하단으로 스크롤
//   useEffect(() => {
//     if (messageDisplayRef.current) {
//       messageDisplayRef.current.scrollTop = messageDisplayRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const sendMessage = async (customMessage) => {
//     const msg = customMessage || input;
//     if (!msg.trim()) return;

//     // 사용자 메시지 추가 (unique key를 위해 임시 ID 부여)
//     setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: msg }]);

//     setInput(""); // 메시지 전송 후 입력창 비우기

//     try {
//       const res = await axios.post("http://localhost:5001/ai-info/Stockchat", {
//         message: msg
//       });
//       // 봇 메시지 추가 (unique key를 위해 임시 ID 부여)
//       const botMsg = { id: Date.now() + 1, sender: "bot", text: res.data.reply };
//       setMessages(prev => [...prev, botMsg]);
//     } catch (err) {
//       console.error("Axios 에러:", err.response ? err.response.data : err.message);
//       setMessages(prev => [...prev, { id: Date.now() + 2, sender: "bot", text: "GPT 서버 응답 오류" }]);
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <h2 className="chatbot-title">💬 주식 전문가 아스트로</h2> {/* 제목 변경 */}

//       <div className="chatbot-message-display" ref={messageDisplayRef}>
//         {messages.map((msg) => (
//           <div key={msg.id} className={`chatbot-message-item ${msg.sender}`}>
//             <strong>{msg.sender === "user" ? "사용자" : "아스트로"}:</strong> {msg.text}
//           </div>
//         ))}
//       </div>

//       {/* FAQ 토글 버튼 */}
//       <button
//         onClick={() => setShowFAQ(!showFAQ)}
//         className="chatbot-faq-toggle-button"
//       >
//         FAQ {showFAQ ? "숨기기" : "보기"}
//       </button>

//       {/* FAQ 목록 */}
//       {showFAQ && (
//         <div className="chatbot-faq-list-container">
//           {faqList.map((question, idx) => (
//             <div
//               key={`faq-${idx}`}
//               className="chatbot-faq-item"
//               onClick={() => {
//                 sendMessage(question);
//                 setShowFAQ(false); // FAQ 질문 클릭 시 FAQ 목록 숨기기
//               }}
//             >
//               <strong>Q{idx + 1}:</strong> {question}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* 입력창 및 전송 버튼 영역 */}
//       <div className="chatbot-input-send-area">
//         <input
//           type="text"
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => e.key === "Enter" && sendMessage()}
//           placeholder="메시지를 입력하세요"
//           className="chatbot-message-input"
//         />
//         <button onClick={() => sendMessage()} className="chatbot-send-button">
//           전송
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Stockchat;