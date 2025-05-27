// src/pages/AiPicksPage/components/AiPicksHomeContent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AiPicksHomeContent.css'; // 이 컴포넌트의 스타일 파일

// --- 임시 목업 데이터 ---
const todayPicksData = [
  { id: 'pick1', stockName: '에이테크', stockCode: 'A001', prediction: '단기 급등 예상', targetPrice: '15,000', reason: 'AI 모델 신호 포착' },
  { id: 'pick2', stockName: '비솔루션', stockCode: 'B002', prediction: '안정적 우상향', targetPrice: '120,000', reason: '실적 개선 기대' },
  { id: 'pick3', stockName: '씨에너지', stockCode: 'C003', prediction: '테마주 순환매', targetPrice: '8,500', reason: '수급 집중' },
  { id: 'pick4', stockName: '디네트웍스', stockCode: 'D004', prediction: '조정 후 반등 기대', targetPrice: '45,000', reason: '기술적 분석 유리' },
  { id: 'pick5', stockName: '이퓨처', stockCode: 'E005', prediction: '신규 계약 체결', targetPrice: '22,000', reason: '공시 기반 예측' },
];

const bestProfitData = [
  { id: 'profit1', stockName: '가온칩스', stockCode: 'GA01', changeRate: '+25.8%', date: '05/06~05/13', lowBuyPrice: '60,000', highSellPrice: '75,500' },
  { id: 'profit2', stockName: '나노신소재', stockCode: 'NA02', changeRate: '+18.2%', date: '05/06~05/13', lowBuyPrice: '120,000', highSellPrice: '141,800' },
  { id: 'profit3', stockName: '다올투자증권', stockCode: 'DA03', changeRate: '+15.5%', date: '05/06~05/13', lowBuyPrice: '3,000', highSellPrice: '3,465' },
  { id: 'profit4', stockName: '라온테크', stockCode: 'RA04', changeRate: '+12.3%', date: '05/06~05/13', lowBuyPrice: '25,000', highSellPrice: '28,075' },
];
// --- 임시 목업 데이터 끝 ---


// 슬라이더 내부 아이템 컴포넌트 (간단 버전)
const TodayPickItem = ({ pick }) => {
  return (
    <Link to={`/stock-detail/${pick.stockCode}`} className="card-link"> {/* Unified link class */}
      <div className="stock-card"> {/* Unified card container class */}
        <h4 className="stock-name">{pick.stockName}</h4> {/* Unified stock name heading */}
        {/* You can add stockCode here if you want to display it */}
        <p className="card-prediction-text">{pick.prediction}</p> {/* Specific class for prediction */}
        <div className="card-details"> {/* Unified details container */}
          <span className="card-target-price">목표가: {pick.targetPrice}</span> {/* Specific class for target price */}
          <span className="card-reason-badge">{pick.reason}</span> {/* Specific class for reason badge */}
        </div>
      </div>
    </Link>
  );
};

// Best Profit Rate Card Component (Remains mostly the same for its specific content)
const BestProfitRateCard = ({ item }) => {
  return (
    <Link to={`/stock-detail/${item.stockCode}`} className="card-link"> {/* Unified link class */}
      <div className="stock-card"> {/* Unified card container class */}
        <h5 className="stock-name">{item.stockName}</h5> {/* Unified stock name heading */}
        <p className="card-change-rate positive">{item.changeRate}</p> {/* Specific class for change rate */}
        <div className="card-details"> {/* Unified details container */}
          <span className="card-date">기간: {item.date}</span> {/* Specific class for date */}
          <span className="card-price-info">매수(최저): {item.lowBuyPrice}</span> {/* Specific class for price info */}
          <span className="card-price-info">매도(최대): {item.highSellPrice}</span> {/* Specific class for price info */}
        </div>
      </div>
    </Link>
  );
};

const AiPicksHomeContent = () => {
  const [todayPicks, setTodayPicks] = useState([]);
  const [bestProfitStocks, setBestProfitStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 슬라이더를 위한 상태 (선택적: 현재 보이는 슬라이드 인덱스 등)
  // const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setLoading(true);
    setTimeout(() => {
      setTodayPicks(todayPicksData);
      setBestProfitStocks(bestProfitData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <p className="loading-message-aphc">AI 종목추천 데이터를 불러오는 중입니다...</p>; // APHC: AiPicksHomeContent
  }

  return (
    <div className="ai-picks-home-content">
      <section className="today-picks-slider-section">
        <h2 className="section-title-aphc">AI 오늘의 종목 Pick</h2>
        <div className="slider-container-aphc">
          {todayPicks.map(pick => (
            <div key={pick.id} className="slide-item-aphc">
              <TodayPickItem pick={pick} />
            </div>
          ))}
        </div>
      </section>

      <section className="best-profit-section">
        <h2 className="section-title-aphc">주간 Best 추천 수익률</h2>
        <div className="best-profit-cards-container">
          {bestProfitStocks.map(item => (
            <BestProfitRateCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AiPicksHomeContent;