import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './Header.css';
import AnimatedOverlay from '../../common/AnimatedOverlay/AnimatedOverlay';

const Header = ({ isLoggedIn = false, onLogout = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [currentOverlayTitle, setCurrentOverlayTitle] = useState('전체 메뉴');
  const location = useLocation();
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleMenuItemClick = (path, name) => {
    setCurrentOverlayTitle(name);
    navigate(path);
  };

  const mainMenuItems = [
    {
      name: 'AI정보분석',
      path: '/ai-info',
      subItems: [
        { name: 'AI정보분석 홈', path: '/ai-info' },
        { name: '시세분석', path: '/ai-info/price-analysis' },
        { name: '이슈분석', path: '/ai-info/issue-analysis' },
        { name: '테마/업종', path: '/ai-info/theme-sector' },
        { name: '뉴스', path: '/ai-info/news' },
      ],
    },
    {
      name: 'AI 종목추천',
      path: '/ai-picks',
      subItems: [
        { name: 'AI 종목추천 홈', path: '/ai-picks' },
        { name: '오늘의 종목', path: '/ai-picks/today' },
        { name: 'AI 추천', path: '/ai-picks/recommendations' },
        { name: '매매신호', path: '/ai-picks/signal' },
      ],
    },
    {
      name: '토론실',
      path: '/forum',
    },
    {
      name: 'My종목',
      path: '/mypage',
      subItems: [
        { name: 'AI비서', path: '/mypage' },
        { name: '관심 종목', path: '/mypage/favorite' },
        { name: '계정 정보', path: '/mypage/profile' },
      ],
    },
  ];

  useEffect(() => {
    let newTitle = '전체 메뉴'; // 기본값 (일치하는 경로가 없을 경우)

    // 모든 메뉴 아이템을 순회하며 현재 경로와 일치하는지 확인
    // 가장 구체적인(긴) 경로가 먼저 매칭되도록 역순으로 정렬하거나, 중첩된 루프 사용
    // 여기서는 간단하게 모든 subItems까지 검사하도록 구현합니다.
    const findMatchingTitle = (items, currentPath) => {
        for (const item of items) {
            if (item.path === currentPath) {
                return item.name;
            }
            if (item.subItems) {
                const subItemTitle = findMatchingTitle(item.subItems, currentPath);
                if (subItemTitle) {
                    return subItemTitle;
                }
            }
        }
        return null; // 일치하는 것을 찾지 못함
    };

    // 현재 경로를 찾아서 제목 설정
    const matchedTitle = findMatchingTitle(mainMenuItems, location.pathname);

    if (matchedTitle) {
        newTitle = matchedTitle;
    } else if (location.pathname === '/') {
        newTitle = '홈'; // 루트 경로에 대한 특별 처리 (MainPage가 주석 처리되어 있긴 하지만)
    }
    // 여기에 다른 특정 경로에 대한 제목을 추가할 수 있습니다.
    // 예: if (location.pathname.startsWith('/stock-detail')) newTitle = '종목 상세';

    setCurrentOverlayTitle(newTitle);
  }, [location.pathname]);

  return (
    <>
      <header className="app-header-top">
        <div className="logo-area">
          <Link to="/" className="logo-link">
            <img src='Mainlogo.png' alt='주식AI로고'/>
          </Link>
        </div>
        <div className='right-section'>
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
          <img src='Mainlogo1.png' alt='주식AI로고'/>
        </div>
      </header>

      <nav className="app-main-menu-bar">
        <div className="menu-icon-container">
          <button className="menu-toggle-button" aria-label="전체 메뉴 보기">
            <FaBars /> <span className="menu-toggle-text">전체메뉴보기</span>
          </button>
        </div>

        <ul className="main-nav-links">
          {mainMenuItems.map((item) => (
            <li key={item.name} className="main-nav-item">
              <Link to={item.path} onClick={() => handleMenuItemClick(item.path, item.name)}>{item.name}</Link>
              {item.subItems && item.subItems.length > 0 && (
                <ul className="dropdown-submenu">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link to={subItem.path} onClick={() => handleMenuItemClick(subItem.path, subItem.name)}>{subItem.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
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

      <AnimatedOverlay key={location.pathname} title={currentOverlayTitle} />
    </>
  );
};

export default Header;