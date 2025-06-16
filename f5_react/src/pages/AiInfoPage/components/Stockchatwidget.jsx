import React, { useState } from 'react';
import Stockchat from './Stockchat';
import { FaComments } from 'react-icons/fa';

function StockchatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <>
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        <FaComments />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '400px',
            height: '550px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            zIndex: 1000,
            padding: '10px',
            overflow: 'hidden'
          }}
        >
          <Stockchat />
        </div>
      )}
    </>
  );
}

export default StockchatWidget;
