// src/pages/MyPage/components/AiAssistantPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AiAssistantPage.css'; // 이 컴포넌트의 스타일 파일
// import StockChartMini from '../../../components/charts/StockChartMini.jsx'; // 미니 차트 컴포넌트 (예시)

// --- 임시 목업 데이터 ---
const mockWatchlistData = [
  { id: 'wl1', stockCode: '005930', stockName: '삼성전자', currentPrice: '78,500', changeRate: '+1.20%', changeType: 'positive', aiSignal: '매수 유지' },
  { id: 'wl2', stockCode: '035720', stockName: '카카오', currentPrice: '47,500', changeRate: '-0.50%', changeType: 'negative', aiSignal: '관망' },
  { id: 'wl3', stockCode: '000660', stockName: 'SK하이닉스', currentPrice: '188,000', changeRate: '+2.17%', changeType: 'positive', aiSignal: '강력 매수' },
  // ... 사용자가 추가한 다른 관심 종목들
];

const mockPersonalizedPicks = [
  { id: 'pp1', stockCode: 'A12345', stockName: 'AI 추천종목 알파', currentPrice: '25,300', changeRate: '+3.10%', changeType: 'positive', reason: '관심종목 "삼성전자"와 유사한 AI 성장성 포착', prediction: '단기 목표가 28,000원' },
  { id: 'pp2', stockCode: 'B67890', stockName: 'AI 추천종목 베타', currentPrice: '12,800', changeRate: '-1.15%', changeType: 'negative', reason: '최근 관심 섹터 "2차 전지" 내 저평가 분석', prediction: '조정 후 반등 유력, 분할 매수 고려' },
  { id: 'pp3', stockCode: 'C13579', stockName: 'AI 추천종목 감마', currentPrice: '5,500', changeRate: '+0.90%', changeType: 'positive', reason: '사용자 투자 성향(안정형) 및 최근 시장 상황 고려', prediction: '안정적 배당 및 점진적 상승 기대' },
];
// --- 임시 목업 데이터 끝 ---


// 관심 종목 아이템을 위한 내부 컴포넌트
const WatchlistItem = ({ item }) => (
  <li className="watchlist-item-aia"> {/* AIA: AiAssistantPage */}
    <Link to={`/stock-detail/${item.stockCode}`} className="watchlist-item-link-aia">
      <div className="item-info-aia">
        <span className="stock-name-aia">{item.stockName} ({item.stockCode})</span>
        <span className="current-price-aia">{item.currentPrice}</span>
      </div>
      <div className="item-status-aia">
        <span className={`change-rate-aia ${item.changeType}`}>{item.changeRate}</span>
        <span className="ai-signal-aia">{item.aiSignal}</span>
      </div>
    </Link>
  </li>
);

// 개인 맞춤 추천 아이템을 위한 내부 컴포넌트
const PersonalizedPickItem = ({ item }) => (
  <div className="personalized-pick-card-aia">
    <Link to={`/stock-detail/${item.stockCode}`} className="stock-name-link-aia">
      <h4>{item.stockName} <span className="stock-code-aia">({item.stockCode})</span></h4>
    </Link>
    <div className="price-info-aia">
      <span className="current-price-aia">현재가: {item.currentPrice}</span>
      <span className={`change-rate-aia ${item.changeType}`}>{item.changeRate}</span>
    </div>
    <p className="recommendation-reason-aia"><strong>AI 추천 이유:</strong> {item.reason}</p>
    <p className="ai-prediction-aia"><strong>AI 예측:</strong> {item.prediction}</p>
    {/* <div className="mini-chart-placeholder-aia">관련 미니차트</div> */}
  </div>
);


const AiAssistantPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [personalizedPicks, setPersonalizedPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제로는 로그인한 사용자의 관심 종목과 맞춤 추천 데이터를 API로 가져옵니다.
    setLoading(true);
    setTimeout(() => {
      setWatchlist(mockWatchlistData);
      setPersonalizedPicks(mockPersonalizedPicks);
      setLoading(false);
    }, 500);
  }, []); // currentUser.id 등이 변경될 때 다시 로드할 수 있음

  if (loading) {
    return <p className="loading-message-aia">AI 비서 정보를 불러오는 중입니다...</p>;
  }

  return (
    <div className="ai-assistant-page">
      {/* 페이지 제목은 MyPageLayout의 SubNavigation에서 "AI 비서"로 이미 표시됨 */}
      {/* <h1 className="page-main-title-aia">AI 비서</h1> */}

      <section className="watchlist-section-aia">
        <div className="section-header-aia">
          <h2 className="section-title-aia">나의 관심 종목 현황</h2>
          <Link to="/my-stocks" className="view-all-link-aia">관심 종목 전체보기 &rarr;</Link>
        </div>
        {watchlist.length > 0 ? (
          <ul className="watchlist-list-aia">
            {watchlist.map(item => (
              <WatchlistItem key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="no-data-message-aia">등록된 관심 종목이 없습니다. <Link to="/search">종목을 검색</Link>하여 추가해보세요.</p>
        )}
      </section>

      <section className="personalized-picks-section-aia">
        <h2 className="section-title-aia">AI 개인 맞춤 추천</h2>
        {personalizedPicks.length > 0 ? (
          <div className="personalized-picks-grid-aia">
            {personalizedPicks.map(item => (
              <PersonalizedPickItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="no-data-message-aia">현재 맞춤 추천 종목이 없습니다.</p>
        )}
        {/* 맞춤 추천 더보기 또는 설정 변경 링크가 필요하다면 여기에 추가 */}
      </section>
    </div>
  );
};

export default AiAssistantPage;