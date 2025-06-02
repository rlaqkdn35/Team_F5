import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import './Header.css';
import AnimatedOverlay from '../../common/AnimatedOverlay/AnimatedOverlay';

const Header = ({ isLoggedIn = false, onLogout = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const [currentOverlayTitle, setCurrentOverlayTitle] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);

  const handleSearchChange = async (e) => {
    const input = e.target.value;
    setSearchTerm(input);

    if (input.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8084/F5/api/stocks/search?query=${encodeURIComponent(input.trim())}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('자동완성 검색 실패:', error);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const match = searchTerm.match(/^(\d{4,6})/);
    const stockCode = match ? match[1] : null;

    if (stockCode) {
      navigate(`/stock-detail/${stockCode}`);
    } else {
      alert('올바른 종목코드를 선택하세요!');
    }

    setSearchTerm('');
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
    let newTitle = '';
    let matched = false;

    const findMatchingTitle = (items, currentPath) => {
      for (const item of items) {
        if (item.path === currentPath) return item.name;
        if (item.subItems) {
          const subItemTitle = findMatchingTitle(item.subItems, currentPath);
          if (subItemTitle) return subItemTitle;
        }
      }
      return null;
    };

    const matchedTitle = findMatchingTitle(mainMenuItems, location.pathname);

    if (matchedTitle) {
      newTitle = matchedTitle;
      matched = true;
    } else if (location.pathname === '/') {
      newTitle = '홈';
      matched = true;
    } else if (location.pathname.startsWith('/search')) {
      newTitle = '검색 결과';
      matched = true;
    }

    setCurrentOverlayTitle(newTitle);
    setShowOverlay(matched);
  }, [location.pathname]);

  return (
    <>
      <nav className="app-main-menu-bar">
        <div>Astock</div>
        <ul className="main-nav-links">
          {mainMenuItems.map((item) => (
            <li
              key={item.name}
              className="main-nav-item"
              onMouseEnter={() => setActiveMenu(item.name)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link to={item.path} onClick={() => handleMenuItemClick(item.path, item.name)}>
                {item.name}
              </Link>
              {item.subItems && item.subItems.length > 0 && (
                <ul className={`dropdown-submenu ${activeMenu === item.name ? 'active' : ''}`}>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link to={subItem.path} onClick={() => handleMenuItemClick(subItem.path, subItem.name)}>
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* 🔍 자동완성 검색 입력 */}
        <form className="search-container" onSubmit={handleSearchSubmit}>
          <input
            list="stockOptions"
            id="stockSearch"
            name="stockSearch"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="종목명 또는 종목코드 입력"
            className="search-input"
          />
          <datalist id="stockOptions">
            {searchResults.map((stock) => (
              <option key={stock.stock_code} value={`${stock.stock_code} (${stock.stock_name})`}>
                {stock.stock_name} ({stock.stock_code})
              </option>
            ))}
          </datalist>
          <button type="submit" className="search-button" aria-label="검색">
            <FaSearch />
          </button>
        </form>

        {/* 로그인/회원가입 영역 */}
        <div className="auth-area">
          {isLoggedIn ? (
            <button onClick={onLogout} className="auth-button">
              로그아웃
            </button>
          ) : (
            <>
              <Link to="/login" className="auth-button">
                <FaSignInAlt /> 로그인
              </Link>
              <Link to="/signup" className="auth-button">
                <FaUserPlus /> 회원가입
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 페이지 이동 시 애니메이션 오버레이 */}
      {showOverlay && (
        <AnimatedOverlay
          key={location.pathname}
          title={currentOverlayTitle}
          backgroundImageUrl={`${currentOverlayTitle}.png`}
        />
      )}
    </>
  );
};

export default Header;
