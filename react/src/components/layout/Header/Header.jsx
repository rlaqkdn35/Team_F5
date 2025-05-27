import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// react-icons 예시 (설치 필요: npm install react-icons)
import { FaBars, FaSearch, FaUserCircle, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Modal from '../../common/Modal/Modal.jsx'; // 가정: Modal 컴포넌트 경로
import './Header.css';

// 임시: 로그인 상태를 props로 받거나 Context API 등을 사용하는 것이 좋습니다.
// 여기서는 예시를 위해 isLoggedIn prop을 받는다고 가정하고,
// App.js에서 <Header isLoggedIn={currentUser !== null} onLogout={handleLogout} /> 등으로 전달
const Header = ({ isLoggedIn = false, onLogout = () => {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // 실제 검색 결과 페이지로 이동하는 로직
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

// Header.jsx 내부에 정의
const mainMenuItems = [
  {
    name: 'AI정보분석',
    path: '/ai-info', // 'AI정보분석 홈'으로 연결될 기본 경로
    subItems: [
      { name: 'AI정보분석 홈', path: '/ai-info' }, // 기본 경로와 동일하거나 /ai-info/home 등
      { name: '시세분석', path: '/ai-info/price-analysis' },
      { name: '이슈분석', path: '/ai-info/issue-analysis' },
      // { name: '수급분석', path: '/ai-info/supply-demand-analysis' },
      { name: '테마/업종', path: '/ai-info/theme-sector' },
      // { name: '공시분석', path: '/ai-info/disclosure-analysis' },
      // { name: '리포트분석', path: '/ai-info/report-analysis' },
      { name: '뉴스', path: '/ai-info/news' },
    ],
  },
  {
    name: 'AI 종목추천',
    path: '/ai-picks', // 'AI 종목추천 홈'으로 연결
    subItems: [
      { name: '홈', path: '/ai-picks' },
      { name: '오늘의 종목', path: '/ai-picks/today' },
      { name: '추천', path: '/ai-picks/recommendations' },
      { name: '매매신호', path: '/ai-picks/signal' },
      // { name: '포트폴리오', path: '/ai-picks/portfolio' },
      // { name: '이용안내', path: '/ai-picks/guide' },
    ],
  },
  // {
  //   name: '매매신호',
  //   path: '/signals', // '매매신호 홈'으로 연결
  //   subItems: [
  //     { name: '매매신호 홈', path: '/signals' },
  //     { name: '매매신호 소개', path: '/ signals/about' },
  //     { name: '이용안내', path: '/signals/guide' },
  //     { name: '나의 매매신호', path: '/signals/my-signals' },
  //   ],
  // },
  {
    name: '토론실',
    path: '/forum', // '주식종합토론' 또는 별도 토론실 홈으로 연결
    // subItems: [
    //   { name: '소설분석', path: '/forum/speculative-analysis' },
    //   { name: '증권가속보', path: '/forum/market-newsflash' },
    //   { name: '특징주포착', path: '/forum/noteworthy-stocks' },
    //   { name: '주식종합토론', path: '/forum/general' },
    //   { name: '정치방', path: '/forum/politics' },
    //   { name: '나의 활동', path: '/forum/my-activity' },
    // ],
  },
  { name: 'My종목', 
    path: '/mypage',
    subItems: [
      { name: 'AI비서', path: '/mypage' },
      { name: '관심 종목', path: '/mypage/favorite' },
      { name: '계정 정보', path: '/mypage/profile' },
    ]
  }, // 세부 항목 없음
  ];

  return (
    <>
      <header className="app-header-top">
        <div className="logo-area">
          <Link to="/" className="logo-link">
          
            {/* 로고 이미지 사용 시: <img src="/path/to/logo.png" alt="주식AI 로고" /> */}
            <img src='Mainlogo.png' alt='주식AI로고'/>
           {/* <h1>AStock</h1> */}
          </Link>
          
        </div>
        <div className="auth-area">
          {isLoggedIn ? (
            <button onClick={onLogout} className="auth-button logout-button">
              로그아웃
            </button>
          ) : (
            <>
              <Link to="/login" className="auth-button login-button">
                <FaSignInAlt /> 로그인
              </Link>
              <Link to="/signup" className="auth-button signup-button">
                <FaUserPlus /> 회원가입
              </Link>
            </>
          )}
        </div>
      </header>

      <nav className="app-main-menu-bar">
        <div className="menu-icon-container">
          <button onClick={toggleModal} className="menu-toggle-button" aria-label="전체 메뉴 보기">
            <FaBars /> <span className="menu-toggle-text">전체메뉴보기</span>
          </button>
        </div>

        <ul className="main-nav-links">
          {mainMenuItems.map((item) => (
            <li key={item.name}>
              <Link to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>

        <form className="search-container" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="종목명/종목코드 입력"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button" aria-label="검색">
            <FaSearch />
          </button>
        </form>
      </nav>

<Modal isOpen={isModalOpen} onClose={toggleModal}>
  <div className="modal-menu-content"> {/* 이 부분에 overflow-x 추가 필요 */}
    <h2 className="modal-menu-title">전체 메뉴</h2>
    {/* 이 ul이 Flex 컨테이너가 됩니다. */}
    <ul className="modal-main-nav-links"> 
      {mainMenuItems.map((mainItem) => (
        // 이 li가 Flex 아이템 (하나의 컬럼)이 됩니다.
        <li key={`modal-main-${mainItem.name}`} className="modal-main-nav-item"> 
          <Link to={mainItem.path} onClick={toggleModal} className="modal-main-category-link /* has-submenu or direct-link */">
            {mainItem.name}
          </Link>
          {mainItem.subItems && mainItem.subItems.length > 0 && (
            <ul className="modal-sub-nav-links">
              {mainItem.subItems.map((subItem) => (
                <li key={`modal-sub-${mainItem.name}-${subItem.name}`} className="modal-sub-nav-item">
                  <Link to={subItem.path} onClick={toggleModal}>
                    {subItem.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
    {/* 모달 내부에 로그인/회원가입 버튼도 추가할 수 있습니다. */}
    <div className="modal-auth-links">
        {isLoggedIn ? (
            <button onClick={() => { onLogout(); toggleModal(); }} className="auth-button logout-button modal-logout">
                로그아웃
            </button>
        ) : (
            <>
                <Link to="/login" className="auth-button login-button modal-login" onClick={toggleModal}>
                    <FaSignInAlt /> 로그인
                </Link>
                <Link to="/signup" className="auth-button signup-button modal-signup" onClick={toggleModal}>
                    <FaUserPlus /> 회원가입
                </Link>
            </>
        )}
    </div>
  </div>
</Modal>
    </>
  );
};

export default Header;