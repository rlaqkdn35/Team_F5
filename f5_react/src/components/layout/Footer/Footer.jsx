import React from 'react';
import './Footer.css'; // Footer 스타일 import

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Astock. 모든 권리 보유.</p>
        <nav className="footer-links">
          <a href="/terms">이용약관</a>
          <a href="/privacy">개인정보처리방침</a>
          <a href="/contact">고객센터</a>
          {/* 필요에 따라 더 많은 링크 추가 가능 */}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
