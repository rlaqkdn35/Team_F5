import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MarketFeatureStocks.css'; // 이 컴포넌트의 스타일 파일

const TABS = [
  { id: 'issue', name: '이슈종목' },
  { id: 'high52w', name: '52주 신고가' },
  { id: 'upperLimit', name: '상한가' },
  { id: 'topVolumeShare', name: '거래비중상위' },
];

// 임시 목업 데이터 생성 함수 (실제로는 API 호출)
const getMockStockDataForTab = (tabId) => {
  // 각 탭에 따라 다른 목업 데이터를 반환하도록 간단히 시뮬레이션
  const baseData = [
    { time: '11:36', name: '종목A', code: '0000A', price: '10,500', changeRate: '+2.50%', feature: 'AI 반도체 관련주 부각' },
    { time: '11:20', name: '종목B', code: '0000B', price: '22,700', changeRate: '-1.79%', feature: '2분기 실적 호조 전망' },
    { time: '11:01', name: '종목C', code: '0000C', price: '8,780', changeRate: '+6.68%', feature: '신규 계약 체결 공시' },
    { time: '10:56', name: '종목D', code: '0000D', price: '170,000', changeRate: '+0.50%', feature: '외국인/기관 동시 순매수' },
    { time: '10:42', name: '종목E', code: '0000E', price: '37,600', changeRate: '+3.44%', feature: '52주 신고가 경신 (2024-05-13)' },
  ];
  // 실제로는 tabId에 따라 다른 데이터를 가져오거나 필터링해야 합니다.
  // 여기서는 간단히 섞거나 일부만 반환하는 식으로 차이를 줄 수 있습니다.
  return baseData.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3));
};


const MarketFeatureStocks = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id); // 기본 활성 탭: 이슈종목
  const [stockList, setStockList] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("00:00"); // 실제로는 데이터와 함께 받아옴
  const navigate = useNavigate();

  useEffect(() => {
    // activeTab이 변경될 때마다 해당 탭에 맞는 데이터 로드 (시뮬레이션)
    console.log(`${activeTab} 탭에 대한 데이터 로딩...`);
    setStockList(getMockStockDataForTab(activeTab));
    // 실제 데이터 로딩 시 업데이트 시간도 함께 설정
    const now = new Date();
    setLastUpdated(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  }, [activeTab]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleViewMoreClick = () => {
    // 선택된 탭(activeTab)에 따라 다른 '더보기' 페이지로 이동하거나,
    // 공통 '시장특징주' 상세 페이지로 이동 후 해당 탭을 기본으로 보여줄 수 있음
    navigate(`/market-features/${activeTab}`); // 예시 경로
  };

  return (
    <section className="market-feature-stocks-section">
      <div className="mfs-header"> {/* 필터 태그와 업데이트 시간을 묶는 헤더 */}
        <div className="filter-tabs-mfs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`filter-tab-mfs ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="update-timestamp-mfs">
          업데이트 {lastUpdated}
        </div>
      </div>

      <div className="stock-list-table-mfs">
        <div className="table-header-mfs">
          <span className="col-time-mfs">시간</span>
          <span className="col-name-mfs">종목명</span>
          <span className="col-price-mfs">현재가</span>
          <span className="col-change-rate-mfs">등락률</span>
          <span className="col-feature-mfs">특징내용</span> {/* "이슈내용"에서 좀 더 일반적인 용어로 */}
        </div>
        {stockList.length > 0 ? (
          <ul className="table-body-mfs">
            {stockList.map((stock, index) => (
              <li key={stock.code || `feature-stock-${index}`} className="table-row-mfs">
                <span className="col-time-mfs">{stock.time}</span>
                <span className="col-name-mfs">
                  <Link to={`/stock-detail/${stock.code}`}>{stock.name}</Link>
                </span>
                <span className="col-price-mfs">{stock.price}</span>
                <span className={`col-change-rate-mfs ${parseFloat(String(stock.changeRate).replace('%','')) > 0 ? 'positive' : parseFloat(String(stock.changeRate).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                  {stock.changeRate}
                </span>
                <span className="col-feature-mfs" title={stock.feature}>{stock.feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data-message-mfs">해당 조건의 종목 정보가 없습니다.</p>
        )}
      </div>

      <div className="actions-footer-mfs">
        <button onClick={handleViewMoreClick} className="view-more-button-mfs">
          {TABS.find(tab => tab.id === activeTab)?.name || '시장특징주'} 더보기
        </button>
      </div>
    </section>
  );
};

export default MarketFeatureStocks;