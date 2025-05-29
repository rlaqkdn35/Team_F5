// src/components/common/Modal/Modal.jsx
import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './Modal.css'; // 모달 스타일 파일

const Modal = ({ isOpen, onClose, children }) => {
  // ❗ 모든 React Hooks는 조건부 호출 없이 컴포넌트 최상단에 먼저 선언되어야 합니다.
  // 이 부분은 그대로 유지됩니다.
  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    // 모달이 열려 있을 때만 스크롤을 막고 이벤트 리스너를 추가합니다.
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    // 클린업 함수: 컴포넌트 언마운트 시 또는 isOpen이 false가 될 때 실행
    return () => {
      document.body.style.overflow = ''; // 스크롤 복원
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]); // 의존성 배열에 handleKeyDown 추가

  // ❗ 이제 모달이 열려 있지 않을 때의 반환은 Hooks 호출 이후에 옵니다.
  if (!isOpen) {
    return null;
  }

  // ReactDOM.createPortal을 사용하여 모달을 #modal-root에 렌더링합니다.
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose} aria-label="닫기">
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;