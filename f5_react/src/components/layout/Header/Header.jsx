import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import './Header.css';
import AnimatedOverlay from '../../common/AnimatedOverlay/AnimatedOverlay';

const Header = ({ isLoggedIn = false, onLogout = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allStocks, setAllStocks] = useState([]); // 전체 150개 데이터
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [currentOverlayTitle, setCurrentOverlayTitle] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);
  const wrapperRef = useRef(null);

  // 전체 종목 데이터 최초 1회만 받아오기
  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        const response = await axios.get('http://localhost:8084/F5/stocks');
        setAllStocks(response.data.slice(0, 150)); // 최대 150개 제한
      } catch (error) {
        console.error('전체 종목 불러오기 실패:', error);
      }
    };
    fetchAllStocks();
  }, []);

  // 외부 클릭 시 드롭다운 닫기 처리
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setFilteredStocks([]);
      setDropdownOpen(false);
      return;
    }

    // 소문자 변환 후 종목코드 또는 종목명에 포함 여부 검사
    const term = searchTerm.toLowerCase();
    const filtered = allStocks.filter(
      (stock) =>
        stock.stockCode.toLowerCase().includes(term) ||
        stock.stockName.toLowerCase().includes(term)
    );
    setFilteredStocks(filtered);
    setDropdownOpen(filtered.length > 0);
  }, [searchTerm, allStocks]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (stock) => {
    setSearchTerm(`${stock.stockCode} (${stock.stockName})`);
    setDropdownOpen(false);
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
    setFilteredStocks([]);
    setDropdownOpen(false);
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
        { name: '코스닥150', path: '/ai-picks/today' },
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
        <Link to="/ai-picks" className='app-main-logo'>
          <div>Astock</div>
        </Link>
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

        {/* 검색 부분 - input + ul 직접 구현 */}
        <div ref={wrapperRef}>
          <form onSubmit={handleSearchSubmit} className='search-stock'>
            <input
              type="text"
              placeholder="종목명 또는 종목코드 입력"
              value={searchTerm}
              onChange={handleInputChange}
              aria-autocomplete="list"
              aria-expanded={isDropdownOpen}
              aria-controls="autocomplete-list"
              aria-haspopup="listbox"
              autoComplete="off"
            />
            <button type="submit" aria-label="검색">
              <FaSearch />
            </button>
          </form>

          {isDropdownOpen && filteredStocks.length > 0 && (
            <ul
              id="autocomplete-list"
              role="listbox"

            >
              {filteredStocks.map((stock) => (
                <li
                  key={stock.stockCode}
                  role="option"
                  onClick={() => handleSelect(stock)}
                  onMouseDown={(e) => e.preventDefault()}
                  tabIndex={-1}
                >
                  {stock.stockCode} ({stock.stockName})
                </li>
              ))}
            </ul>
          )}
        </div>

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
