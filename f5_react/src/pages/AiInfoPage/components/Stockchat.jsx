import React, { useState } from 'react';
import axios from 'axios';
import './Stockchat.css';

function Stockchat(){
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages,{ sender:"user",text: input }])

    try{
      const res = await axios.post("http://localhost:5001/ai-info/Stockchat",{
        message:input
      });
      console.log("응답:",res);
      console.log("내용:",res.data.reply);
      const botMsg = { sender:"bot", text:res.data };
      setMessages(prev => [...prev, botMsg]);
    } catch (err){
      console.error("Axios 에러:", err.response ? err.response.data : err.message);
      setMessages(prev => [...prev,{ sender:"bot",text:"GPT 서버 응답 오류" }]);
    }
    setInput("");
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>💬 GPT 챗봇</h2>
      <div style={{ border: "1px solid #ccc", padding: 10, height: 300, overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender === "user" ? "👤 나" : "🤖 GPT"}:</strong> {" "}
            {typeof msg.text === "string" ? msg.text : msg.text.reply}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        placeholder="메시지를 입력하세요"
        className="chat-input"
      />
      <button onClick={sendMessage} style={{ width: "18%", marginLeft: "2%" }}>전송</button>
    </div>
  );
}

export default Stockchat;