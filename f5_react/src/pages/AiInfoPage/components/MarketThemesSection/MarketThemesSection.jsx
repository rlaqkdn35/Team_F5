// src/pages/AiInfoPage/components/MarketThemesSection/MarketThemesSection.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MarketThemesSection.css'; // 이 컴포넌트의 스타일 파일

// 1단계 탭 정의
const MAIN_TABS = [
  { id: 'feature', name: '시장특징주' },
  { id: 'supplyDemand', name: '수급분석' },
  { id: 'report', name: '리포트분석' },
  { id: 'disclosure', name: '공시분석' },
];

// 2단계 서브필터/카테고리 정의 (예시)
const SUB_FILTERS = {
  feature: [
    { id: 'high52w', name: '52주 신고가 (52주간 가장 높은것)' },
    { id: 'upperLimit', name: '상한가(30%이상 오른 등락률)' },
    { id: 'topVolumeShare', name: '거래비중상위(거래량이 100%로 이상 증가한것)' },
  ],
  supplyDemand: [
    { id: 'buyVolumeShare', name: '매수비중상위' },
    { id: 'topNetBuy', name: '순매수상위' },
    { id: 'topNetBuyNew', name: '순매수상위신규진입' },
    { id: 'institutionTopNetBuy', name: '주요기관순매수상위' },
    { id: 'continuousNetBuy', name: '연속순매수' },
  ],
  report: [ // <<--- 리포트분석 하위 새로 추가
    { id: 'newReport', name: '신규리포트' },
    { id: 'institutionInterestReport', name: '기관관심리포트' },
    { id: 'foreignerInterestReport', name: '외국인관심리포트' },
    { id: 'pensionFundInterestReport', name: '연기금관심리포트' },
    { id: 'brokerInterestReport', name: '증권사관심리포트' },
    { id: 'highTargetPrice', name: '목표가높음' },
  ],
  disclosure: [ // <<--- 공시분석 하위 새로 추가
    { id: 'orderDisclosure', name: '수주공시' },
    { id: 'equityDisclosure', name: '지분공시' },
    { id: 'newInvestmentDisclosure', name: '신규투자공시' },
    { id: 'cbDisclosure', name: '전환사채공시' },
  ],
};

// 임시 목업 데이터 생성 함수
const getMockDataForSubFilter = (mainTabId, subFilterId) => {
  // 실제로는 mainTabId와 subFilterId에 따라 API를 호출하여 데이터를 가져옵니다.
  // 여기서는 간단한 시뮬레이션
  const items = [];
  for (let i = 1; i <= 5; i++) {
    items.push({
      time: `10:${i < 10 ? '0' : ''}${i * 5}`,
      name: `${subFilterId || mainTabId} 종목 ${i}`,
      code: `0000${i}`,
      price: `${Math.floor(Math.random() * 100000).toLocaleString()}`,
      changeRate: `${(Math.random() * 10 - 5).toFixed(2)}%`,
      feature: `${subFilterId || mainTabId} 관련 특징 내용 ${i}`,
    });
  }
  return items;
};


const MarketThemesSection = () => {
  const [activeMainTab, setActiveMainTab] = useState(MAIN_TABS[0].id);
  const [activeSubFilter, setActiveSubFilter] = useState(
    SUB_FILTERS[MAIN_TABS[0].id] ? SUB_FILTERS[MAIN_TABS[0].id][0].id : null
  );
  const [stockList, setStockList] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("00:00");
  const navigate = useNavigate();

  useEffect(() => {
    // activeMainTab이 바뀔 때, 해당 탭의 첫 번째 서브필터를 기본으로 설정
    const currentSubFilters = SUB_FILTERS[activeMainTab];
    setActiveSubFilter(currentSubFilters && currentSubFilters.length > 0 ? currentSubFilters[0].id : null);
  }, [activeMainTab]);

  useEffect(() => {
    // activeMainTab 또는 activeSubFilter가 변경될 때 데이터 로드
    if (activeMainTab) {
      // 실제로는 API 호출: fetchMarketThemeData(activeMainTab, activeSubFilter).then(data => setStockList(data.list));
      console.log(`${activeMainTab} - ${activeSubFilter || '기본'} 데이터 로딩...`);
      setStockList(getMockDataForSubFilter(activeMainTab, activeSubFilter));
      const now = new Date();
      setLastUpdated(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }
  }, [activeMainTab, activeSubFilter]);

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
  const currentActiveTabName = MAIN_TABS.find(tab => tab.id === activeMainTab)?.name || "";
  const currentActiveSubFilterName = currentSubFilters.find(sf => sf.id === activeSubFilter)?.name || "";


  return (
    <section className="market-themes-section"> {/* 클래스명 변경 */}
      <h2 className="section-title">시장특징 테마</h2> {/* 고정된 전체 섹션 제목 */}


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
      
      <div className="update-timestamp-mts"> {/* MTS: MarketThemesSection 약자 */}
        업데이트 {lastUpdated}
      </div>

      <div >
        <table className="stock-list-table-mts">
        <ul className="table-header-mts">
          <li className="col-time-mts">시간</li>
          <li className="col-name-mts">종목명</li>
          <li className="col-price-mts">현재가</li>
          <li className="col-change-rate-mts">등락률</li>
          <li className="col-feature-mts">특징내용</li>
        </ul>
        {stockList.length > 0 ? (
          <ul className="table-body-mts">
            {stockList.map((stock, index) => (
              <li key={stock.code || `theme-stock-${index}`} className="table-row-mts">
                <span className="col-time-mts">{stock.time}</span>
                <span className="col-name-mts">
                  <Link to={`/stock-detail/${stock.code}`}>{stock.name}</Link>
                </span>
                <span className="col-price-mts">{stock.price}</span>
                <span className={`col-change-rate-mts ${parseFloat(String(stock.changeRate).replace('%','')) > 0 ? 'positive' : parseFloat(String(stock.changeRate).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                  {stock.changeRate}
                </span>
                <span className="col-feature-mts" title={stock.feature}>{stock.feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data-message-mts">해당 조건의 종목 정보가 없습니다.</p>
        )}
        </table>
      </div>

    </section>
  );
};

export default MarketThemesSection;