// src/pages/AiInfoPage/components/MarketThemesSection/MarketThemesSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios 임포트 추가
import './MarketThemesSection.css'; // 이 컴포넌트의 스타일 파일

// 1단계 탭 정의 (변화 없음)
const MAIN_TABS = [
  { id: 'feature', name: '시장특징주' },
];

// 2단계 서브필터/카테고리 정의
const SUB_FILTERS = {
  feature: [
    { id: 'high52w', name: '52주 신고가' }, // 백엔드 API 엔드포인트 ID와 매칭
    { id: 'upperLimit', name: '상한가' },
    { id: 'topVolumeShare', name: '거래비중상위' },
  ]
};

const MarketThemesSection = () => {
  const [activeMainTab, setActiveMainTab] = useState(MAIN_TABS[0].id);
  const [activeSubFilter, setActiveSubFilter] = useState(
    SUB_FILTERS[MAIN_TABS[0].id] ? SUB_FILTERS[MAIN_TABS[0].id][0].id : null
  );
  const [stockList, setStockList] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("00:00");
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null);     // 에러 상태 추가
  const navigate = useNavigate();

  // 데이터를 백엔드에서 가져오는 함수
  const fetchMarketThemeData = useCallback(async (mainTabId, subFilterId) => {
    setLoading(true); // 데이터 로딩 시작
    setError(null);   // 이전 에러 메시지 초기화
    setStockList([]); // 데이터 로딩 전 목록 비우기

    // 서브필터가 유효하지 않으면 API 호출하지 않음
    if (!subFilterId) {
      setLoading(false);
      return;
    }

    try {
      // 백엔드 API 엔드포인트 URL
      const apiUrl = `http://localhost:8084/F5/market-themes/${subFilterId}`;
      const response = await axios.get(apiUrl);
      
      // 백엔드에서 받은 데이터로 stockList 업데이트
      setStockList(response.data);
      
      // 마지막 업데이트 시간 설정
      const now = new Date();
      setLastUpdated(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    } catch (err) {
      console.error(`Error fetching ${subFilterId} data:`, err);
      setError('데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      setStockList([]); // 에러 발생 시 목록 초기화
    } finally {
      setLoading(false); // 데이터 로딩 완료
    }
  }, []); // 의존성 배열이 비어 있어 컴포넌트 마운트 시 한 번만 생성

  // activeMainTab이 바뀔 때, 해당 탭의 첫 번째 서브필터를 기본으로 설정
  useEffect(() => {
    const currentSubFilters = SUB_FILTERS[activeMainTab];
    const initialSubFilterId = currentSubFilters && currentSubFilters.length > 0 ? currentSubFilters[0].id : null;
    setActiveSubFilter(initialSubFilterId);
  }, [activeMainTab]);

  // activeMainTab 또는 activeSubFilter가 변경될 때 데이터 로드
  useEffect(() => {
    // 유효한 activeMainTab과 activeSubFilter가 있을 때만 데이터 요청
    if (activeMainTab && activeSubFilter) {
      fetchMarketThemeData(activeMainTab, activeSubFilter);
    }
  }, [activeMainTab, activeSubFilter, fetchMarketThemeData]); // fetchMarketThemeData를 의존성 배열에 추가

  const handleMainTabClick = (tabId) => {
    setActiveMainTab(tabId);
    // 서브 필터는 useEffect에서 자동으로 첫 번째 것으로 설정됨
  };

  const handleSubFilterClick = (subFilterId) => {
    setActiveSubFilter(subFilterId);
  };
  
  const handleViewMoreClick = () => {
    // 선택된 탭과 서브필터에 따라 적절한 '더보기' 페이지로 이동
    let path = `/market-themes/${activeMainTab}`;
    if (activeSubFilter) {
      path += `/${activeSubFilter}`;
    }
    navigate(path); 
  };

  const currentSubFilters = SUB_FILTERS[activeMainTab] || [];

  return (
    <section className="market-themes-section">
      <h2 className="section-title">시장특징 테마</h2>

      {currentSubFilters.length > 0 && (
        <div className="sub-filters-container">
          {currentSubFilters.map(subFilter => (
            <button
              key={subFilter.id}
              className={`sub-filter-button ${activeSubFilter === subFilter.id ? 'active' : ''}`}
              onClick={() => handleSubFilterClick(subFilter.id)}
            >
              {subFilter.name}
            </button>
          ))}
        </div>
      )}
      
      <div className="update-timestamp-mts">
        업데이트 {lastUpdated}
      </div>

      <div>
        <table className="stock-list-table-mts">
          <ul className="table-header-mts">
            <li className="col-time-mts">시간</li>
            <li className="col-name-mts">종목명</li>
            <li className="col-price-mts">현재가</li>
            <li className="col-change-rate-mts">등락률</li>
            {/* '특징내용' 컬럼 제거 */}
          </ul>
          {loading ? (
            <p className="loading-message-mts">데이터를 불러오는 중입니다...</p>
          ) : error ? (
            <p className="error-message-mts">{error}</p>
          ) : stockList.length > 0 ? (
            <ul className="table-body-mts">
              {stockList.map((stock, index) => (
                // DTO 필드명에 맞춰 key와 데이터 접근 방식 변경
                <li key={stock.stockCode || `theme-stock-${index}`} className="table-row-mts">
                  <span className="col-time-mts">{stock.priceDate}</span>       {/* DTO: priceDate */}
                  <span className="col-name-mts">
                    <Link to={`/stock-detail/${stock.stockCode}`}>{stock.stockName}</Link> {/* DTO: stockCode, stockName */}
                  </span>
                  <span className="col-price-mts">{stock.closePrice}</span>     {/* DTO: closePrice */}
                  <span className={`col-change-rate-mts ${parseFloat(String(stock.stockFluctuation).replace('%','')) > 0 ? 'positive' : parseFloat(String(stock.stockFluctuation).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                    {stock.stockFluctuation}
                  </span> {/* DTO: stockFluctuation */}
                  {/* '특징내용' 데이터 출력 부분 제거 */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data-message-mts">해당 조건의 종목 정보가 없습니다.</p>
          )}
        </table>
      </div>

      <div className="view-more-button-container">
        <button onClick={handleViewMoreClick} className="view-more-button">
          더보기
        </button>
      </div>
    </section>
  );
};

export default MarketThemesSection;