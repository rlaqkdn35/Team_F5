import React from 'react';
import ReactDOM from 'react-dom'; // React Portal 사용을 위해
import PropTypes from 'prop-types';
import './Modal.css'; // 모달 스타일

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // React Portal을 사용하여 모달을 #modal-root DOM 노드에 렌더링합니다.
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}> {/* 오버레이 클릭 시 닫기 */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* 모달 내부 클릭 시 이벤트 전파 방지 */}
        <button className="modal-close-button" onClick={onClose} aria-label="닫기">
          &times; {/* 'X' 아이콘 */}
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