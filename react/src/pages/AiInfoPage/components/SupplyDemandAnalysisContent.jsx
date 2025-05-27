// src/pages/AiInfoPage/components/SupplyDemandAnalysisContent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SupplyDemandAnalysisContent.css'; // 이 컴포넌트의 스타일 파일

// 탭 및 각 탭의 컬럼 정의
const TABS_SUPPLY_DEMAND = [
  { 
    id: 'topBuyVolumeShare', 
    name: '매수비중 상위',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-sdac' }, // SDAC: SupplyDemandAnalysisContent
      { key: 'name', header: '종목명', className: 'col-name-sdac' },
      { key: 'changeRate', header: '등락률', className: 'col-change-rate-sdac' },
      { key: 'netBuyVolume', header: '순매수량', className: 'col-netbuy-volume-sdac' },
      { key: 'volume', header: '거래량', className: 'col-volume-sdac' },
      { key: 'tradingShare', header: '매매비중', className: 'col-trading-share-sdac' },
      { key: 'recentIssue', header: '최근이슈', className: 'col-issue-sdac' },
    ]
  },
  { 
    id: 'topNetBuy', 
    name: '순매수상위',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-sdac' },
      { key: 'name', header: '종목명', className: 'col-name-sdac' },
      { key: 'changeRate', header: '등락률', className: 'col-change-rate-sdac' },
      { key: 'netBuyAmount', header: '순매수금액', className: 'col-netbuy-amount-sdac' },
      { key: 'netBuyVolume', header: '순매수량', className: 'col-netbuy-volume-sdac' },
      { key: 'recentIssue', header: '최근이슈', className: 'col-issue-sdac' },
    ]
  },
  { 
    id: 'topNetBuyNew', 
    name: '순매수상위신규진입',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-sdac' },
      { key: 'name', header: '종목명', className: 'col-name-sdac' },
      { key: 'changeRate', header: '등락률', className: 'col-change-rate-sdac' },
      { key: 'netBuyAmount', header: '순매수금액', className: 'col-netbuy-amount-sdac' },
      { key: 'netBuyVolume', header: '순매수량', className: 'col-netbuy-volume-sdac' },
      { key: 'recentIssue', header: '최근이슈', className: 'col-issue-sdac' },
    ]
  },
  { 
    id: 'institutionTopNetBuy', 
    name: '주요기관순매수상위',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-sdac' },
      { key: 'name', header: '종목명', className: 'col-name-sdac' },
      { key: 'changeRate', header: '등락률', className: 'col-change-rate-sdac' },
      { key: 'netBuyAmount', header: '순매수금액', className: 'col-netbuy-amount-sdac' },
      { key: 'netBuyVolume', header: '순매수량', className: 'col-netbuy-volume-sdac' },
      { key: 'recentIssue', header: '최근이슈', className: 'col-issue-sdac' },
    ]
  },
  { 
    id: 'continuousNetBuy', 
    name: '연속순매수',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-sdac' },
      { key: 'name', header: '종목명', className: 'col-name-sdac' },
      { key: 'changeRate', header: '등락률', className: 'col-change-rate-sdac' },
      { key: 'netBuyAmount', header: '순매수금액', className: 'col-netbuy-amount-sdac' },
      { key: 'netBuyVolume', header: '순매수량', className: 'col-netbuy-volume-sdac' },
      { key: 'recentIssue', header: '최근이슈', className: 'col-issue-sdac' },
    ]
  },
];

// '순매수상위'와 동일한 컬럼을 사용하는 탭들의 컬럼 정의를 복사
const defaultColumns = TABS_SUPPLY_DEMAND.find(tab => tab.id === 'topNetBuy').columns;
TABS_SUPPLY_DEMAND.forEach(tab => {
  if (tab.id !== 'topBuyVolumeShare' && !tab.columns) {
    tab.columns = defaultColumns;
  }
});


// 임시 목업 데이터 생성 함수
const getMockDataForSupplyTab = (tabId) => {
  console.log(`Workspaceing data for supply tab: ${tabId}`);
  const items = [];
  const currentTab = TABS_SUPPLY_DEMAND.find(t => t.id === tabId);
  const categoryName = currentTab?.name || tabId;

  for (let i = 1; i <= 10; i++) { // 각 탭마다 10개 정도의 목업 데이터
    const item = {
      id: `${tabId}_${i}`,
      date: `05/${String(10 + i).padStart(2, '0')}`, // "MM/DD" 형식으로 변경
      name: `${categoryName} 종목 ${i}`,
      code: `B000${i < 10 ? '0' : ''}${i}`,
      price: `${Math.floor(Math.random() * 50000 + 10000).toLocaleString()}`,
      changeRate: `${(Math.random() * 10 - 3).toFixed(2)}%`,
      recentIssue: `${categoryName} 관련 최근 이슈 요약 ${i}`,
    };
    if (tabId === 'topBuyVolumeShare') {
      item.netBuyVolume = `${Math.floor(Math.random() * 10000).toLocaleString()}주`;
      item.volume = `${Math.floor(Math.random() * 500000).toLocaleString()}주`;
      item.tradingShare = `${(Math.random() * 20).toFixed(2)}%`;
    } else {
      item.netBuyAmount = `${(Math.random() * 1000).toFixed(0)}억`;
      item.netBuyVolume = `${Math.floor(Math.random() * 10000).toLocaleString()}주`;
    }
    items.push(item);
  }
  return items;
};


const SupplyDemandAnalysisContent = () => {
  const [activeTab, setActiveTab] = useState(TABS_SUPPLY_DEMAND[0].id);
  const [stockListData, setStockListData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // activeTab이 변경될 때마다 해당 탭에 맞는 데이터 로드 (시뮬레이션)
    const data = getMockDataForSupplyTab(activeTab);
    setStockListData(data);
    setLoading(false);
  }, [activeTab]);

  const currentTabConfig = TABS_SUPPLY_DEMAND.find(tab => tab.id === activeTab);
  const currentColumns = currentTabConfig ? currentTabConfig.columns : [];

  return (
    <div className="supply-demand-analysis-content">
      {/* 페이지 제목은 AiInfoPageLayout의 SubNavigation에서 이미 표시될 수 있음 */}
      {/* 필요하다면 <h1 className="page-main-title-sdac">수급 분석</h1> 추가 */}
      <div className="sdac-tabs-container">
        {TABS_SUPPLY_DEMAND.map(tab => (
          <button
            key={tab.id}
            className={`sdac-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="sdac-tab-content">
        {loading ? (
          <p className="loading-message-sdac">데이터를 불러오는 중입니다...</p>
        ) : stockListData.length > 0 ? (
          <div className="stock-list-table-sdac">
            <div className="table-header-sdac">
              {currentColumns.map(col => (
                <span key={col.key} className={col.className}>{col.header}</span>
              ))}
            </div>
            <ul className="table-body-sdac">
              {stockListData.map(stock => (
                <li key={stock.id} className="table-row-sdac">
                  {currentColumns.map(col => (
                    <span key={col.key} className={col.className} title={col.key === 'recentIssue' ? stock[col.key] : undefined}>
                      {col.key === 'name' ? (
                        <Link to={`/stock-detail/${stock.code}`}>{stock[col.key]}</Link>
                      ) : col.key === 'changeRate' ? (
                        <span className={`${parseFloat(String(stock[col.key]).replace('%','')) > 0 ? 'positive' : parseFloat(String(stock[col.key]).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                          {stock[col.key]}
                        </span>
                      ) : (
                        stock[col.key]
                      )}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="no-data-message-sdac">해당 조건의 종목 정보가 없습니다.</p>
        )}
      </div>
      {/* 이 페이지의 '더보기' 버튼이나 페이지네이션이 필요하다면 여기에 추가 */}
    </div>
  );
};

export default SupplyDemandAnalysisContent;