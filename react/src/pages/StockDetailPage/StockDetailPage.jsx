import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaChartLine, FaNewspaper, FaComments, FaBookOpen, FaBrain, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import './StockDetailPage.css';

// --- 실제 탭 콘텐츠 컴포넌트들을 임포트 ---
import ComprehensiveAnalysisTab from './tabs/ComprehensiveAnalysisTab.jsx';
import PriceChartTab from './tabs/PriceChartTab.jsx';
import MultiAiAnalysisTab from './tabs/MultiAiAnalysisTab.jsx';
import StockDiscussionTab from './tabs/StockDiscussionTab.jsx';
import ReportsTabContent from './tabs/ReportsTabContent.jsx';
import NewsDisclosureTabContent from './tabs/NewsDisclosureTabContent.jsx';
import IssuesTabContent from './tabs/IssuesTabContent.jsx';



const TABS_STOCK_DETAIL = [
  { id: 'comprehensive', name: '종합 분석', icon: <FaInfoCircle />, content: ComprehensiveAnalysisTab },
  { id: 'priceChart', name: '시세 차트', icon: <FaChartLine />, content: PriceChartTab },
  { id: 'multiAi', name: '다중 AI', icon: <FaBrain />, content: MultiAiAnalysisTab }, 
  { id: 'discussion', name: '종목 토론', icon: <FaComments />, content: StockDiscussionTab }, 
  { id: 'issues', name: '이슈', icon: <FaBookOpen />, content: IssuesTabContent }, 
  { id: 'newsDisclosure', name: '뉴스/공시', icon: <FaNewspaper />, content: NewsDisclosureTabContent }, 
  { id: 'reports', name: '리포트', icon: <FaFileAlt />, content: ReportsTabContent }, 
];

const StockDetailPage = () => {
  const { stockCode } = useParams();
  const [stockData, setStockData] = useState(null); // 이 stockData는 각 탭에 공통적으로 필요한 기본 정보 또는 탭별 상세 데이터 포함 가능
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS_STOCK_DETAIL[0].id);

  useEffect(() => {
    setLoading(true);
    console.log(`StockDetailPage: Fetching data for stock: ${stockCode}`);
    // 이 API 호출은 페이지 상단 정보 바에 필요한 최소한의 데이터를 가져오거나,
    // 또는 모든 탭에서 공유할 수 있는 기본 데이터를 가져옵니다.
    // 각 탭 컴포넌트는 필요에 따라 자체적으로 추가 데이터를 로드할 수 있습니다.
    setTimeout(() => {
      setStockData({
        name: `종목 ${stockCode}`, // 예시 이름
        price: `${(Math.random() * 100000 + 50000).toLocaleString()}`,
        changeRate: `${(Math.random() * 10 - 5).toFixed(2)}%`,
        changeType: Math.random() > 0.5 ? 'positive' : 'negative',
        updateTime: new Date().toLocaleTimeString('ko-KR'),
        // 여기에 기업 개요, 초기 차트 데이터 등 공통적으로 쓰일 수 있는 데이터를 미리 포함시킬 수 있습니다.
        // 예: companyOverview: "이 회사는...", historicalPriceDataFor1M: [...] 
      });
      setIsFavorite(Math.random() > 0.5);
      setLoading(false);
    }, 500);
  }, [stockCode]);

  const toggleFavorite = () => {
    console.log(`${stockCode} 관심종목 ${isFavorite ? '삭제' : '추가'}`);
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return <p className="loading-message-sdtp">종목 상세 정보를 불러오는 중입니다...</p>;
  }
  if (!stockData) {
    return <p className="no-data-message-sdtp">해당 종목 정보를 찾을 수 없습니다.</p>;
  }

  const ActiveTabContent = TABS_STOCK_DETAIL.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="stock-detail-page">
      <div className="stock-summary-header-sdtp">
        {/* ... (상단 정보 바 JSX는 이전과 동일) ... */}
        <div className="stock-title-price">
          <h1 className="stock-name-sdtp">{stockData.name} <span className="stock-code-sdtp">({stockCode})</span></h1>
          <div className="price-info-sdtp">
            <span className={`current-price-sdtp ${stockData.changeType}`}>{stockData.price}</span>
            <span className={`change-rate-sdtp ${stockData.changeType}`}>{stockData.changeRate}</span>
            <span className="update-time-sdtp">(기준: {stockData.updateTime})</span>
          </div>
        </div>
        <button onClick={toggleFavorite} className="favorite-button-sdtp" aria-label="관심종목 추가/삭제">
          {isFavorite ? <FaStar style={{ color: '#ffc107' }} /> : <FaRegStar />}
          <span style={{ marginLeft: '5px' }}>관심 {isFavorite ? '해제' : '설정'}</span>
        </button>
      </div>

      <nav className="stock-detail-tabs-sdtp">
        {/* ... (탭 버튼 렌더링 JSX는 이전과 동일) ... */}
        {TABS_STOCK_DETAIL.map(tab => (
          <button
            key={tab.id}
            className={`tab-button-sdtp ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="tab-icon-sdtp">{tab.icon}</span>}
            {tab.name}
          </button>
        ))}
      </nav>

      <div className="stock-detail-tab-content-sdtp">
        {/* ActiveTabContent에 stockData와 stockCode를 prop으로 전달 */}
        {ActiveTabContent ? (
          <ActiveTabContent stockData={stockData} stockCode={stockCode} />
        ) : (
          <p>선택된 탭의 콘텐츠를 불러올 수 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default StockDetailPage;