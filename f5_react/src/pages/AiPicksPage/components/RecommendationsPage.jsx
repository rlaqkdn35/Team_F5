// src/pages/AiPicksPage/components/RecommendationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx'; // 재사용 가능한 차트 컴포넌트
import './RecommendationsPage.css';
// src/pages/AiPicksPage/components/RecommendationsPage.jsx

// ... (React, Link 등 import는 동일)
// import StockChart from '../../../components/charts/StockChart/StockChart.jsx'; // <<--- 이 줄은 이제 필요 없습니다.
import './RecommendationsPage.css';

// --- 임시 목업 데이터 (aiChartsData 변경) ---
const mockApiDataAI1 = {
  'A001': { prediction: '+5.5%', imageUrl: '/img/placeholder/ai1_chart_a001.png' }, // chartData -> imageUrl
  'B002': { prediction: '+3.0%', imageUrl: '/img/placeholder/ai1_chart_b002.png' },
  'C003': { prediction: '+8.2%', imageUrl: '/img/placeholder/ai1_chart_c003.png' },
};
const mockApiDataAI2 = {
  'A001': { prediction: '+6.0%', imageUrl: '/img/placeholder/ai2_chart_a001.png' },
  'B002': { prediction: '+2.5%', imageUrl: '/img/placeholder/ai2_chart_b002.png' },
  'C003': { prediction: '+7.5%', imageUrl: '/img/placeholder/ai2_chart_c003.png' },
};
const mockApiDataAI3 = {
  'A001': { prediction: '+4.8%', imageUrl: '/img/placeholder/ai3_chart_a001.png' },
  'B002': { prediction: '+3.5%', imageUrl: '/img/placeholder/ai3_chart_b002.png' },
  'C003': { prediction: '+8.0%', imageUrl: '/img/placeholder/ai3_chart_c003.png' },
};

// processRecommendations 함수 수정
const processRecommendations = (stockCode, stockName, currentPrice) => {
  const preds = [
    parseFloat(mockApiDataAI1[stockCode]?.prediction) || 0,
    parseFloat(mockApiDataAI2[stockCode]?.prediction) || 0,
    parseFloat(mockApiDataAI3[stockCode]?.prediction) || 0,
  ];
  const avgPrediction = (preds.reduce((a, b) => a + b, 0) / preds.filter(p => p !== 0).length || 0 ).toFixed(2) + '%'; // 0인 값 제외하고 평균
  
  return {
    stockCode,
    stockName,
    currentPrice,
    avgPrediction,
    // aiChartsData가 이제 이미지 URL 배열이 됩니다.
    aiChartImageUrls: [ // 필드명 변경: aiChartsData -> aiChartImageUrls
      mockApiDataAI1[stockCode]?.imageUrl || '/img/placeholder/no_chart_data.png', // 데이터 없을 시 기본 이미지
      mockApiDataAI2[stockCode]?.imageUrl || '/img/placeholder/no_chart_data.png',
      mockApiDataAI3[stockCode]?.imageUrl || '/img/placeholder/no_chart_data.png',
    ]
  };
};

const recommendationsData = {
  daily: [
    processRecommendations('A001', '에이스전자', '10,500'),
    processRecommendations('B002', '베타솔루션', '205,000'),
    processRecommendations('C003', '감마에너지', '5,200'),
  ],
  weekly: [ /* ... 유사하게 imageUrls 포함 ... */ ],
  monthly: [ /* ... 유사하게 imageUrls 포함 ... */ ],
};
// --- 임시 목업 데이터 끝 ---


// 각 추천 종목을 표시하는 카드 컴포넌트 (StockChart 대신 img 태그 사용)
const RecommendationItemCard = ({ item }) => {
  return (
    <div className="recommendation-item-card-rpc">
      <div className="stock-info-rpc">
        <Link to={`/stock-detail/${item.stockCode}`} className="stock-name-link-rpc">
          <h3>{item.stockName} <span className="stock-code-rpc">({item.stockCode})</span></h3>
        </Link>
        <div className="price-prediction-rpc">
          <span className="current-price-rpc">현재가: {item.currentPrice}</span>
          <span className={`avg-prediction-rpc ${parseFloat(item.avgPrediction) > 0 ? 'positive' : parseFloat(item.avgPrediction) < 0 ? 'negative' : 'neutral'}`}>
            3AI 평균예측: {item.avgPrediction}
          </span>
        </div>
      </div>
      <div className="ai-charts-container-rpc">
        {item.aiChartImageUrls.map((imageUrl, index) => ( // aiChartsData -> aiChartImageUrls
          <div key={`ai-chart-img-${index}`} className="mini-chart-wrapper-rpc">
            <span className="ai-label-rpc">AI {index + 1} 예측 차트</span>
            <img 
              src={imageUrl} 
              alt={`AI ${index + 1} ${item.stockName} 예측 차트`} 
              className="ai-chart-image" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};


// RecommendationsPage 컴포넌트 (useEffect 및 return 부분은 이전과 동일)
const RecommendationsPage = () => {
  const [dailyRecs, setDailyRecs] = useState([]);
  const [weeklyRecs, setWeeklyRecs] = useState([]);
  const [monthlyRecs, setMonthlyRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDailyRecs(recommendationsData.daily);
      // 주간/월간 데이터도 processRecommendations를 통해 imageUrls를 포함하도록 채워야 합니다.
      // 예시:
      const sampleWeeklyStockCodes = ['A001', 'C003']; // 실제로는 API 등에서 받아옴
      setWeeklyRecs(sampleWeeklyStockCodes.map(code => processRecommendations(code, `${mockStockData[code]?.name || '주간종목'} (주간)`, mockStockData[code]?.price || 'N/A')));
      
      const sampleMonthlyStockCodes = ['B002']; // 실제로는 API 등에서 받아옴
      setMonthlyRecs(sampleMonthlyStockCodes.map(code => processRecommendations(code, `${mockStockData[code]?.name || '월간종목'} (월간)`, mockStockData[code]?.price || 'N/A')));

      setLoading(false);
    }, 500);
  }, []);
  
  // 목업데이터를 위한 추가 정의 (실제로는 필요 없음)
  const mockStockData = {
    'A001': { name: '에이스전자', price: '10,500' },
    'B002': { name: '베타솔루션', price: '205,000' },
    'C003': { name: '감마에너지', price: '5,200' },
  };


  if (loading) {
    return <p className="loading-message-rpc">AI 추천 데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div className="recommendations-page-content">
      <h1 className="page-main-title-rpc">AI 통합 추천</h1>

      <section className="recommendation-section-rpc">
        <h2 className="section-title-rpc">하루 추천 (1 Day)</h2>
        {dailyRecs.length > 0 ? dailyRecs.map(item => (
          <RecommendationItemCard key={item.stockCode + '_daily'} item={item} />
        )) : <p className="no-data-message-rpc">오늘의 추천 종목이 없습니다.</p>}
      </section>

      <section className="recommendation-section-rpc">
        <h2 className="section-title-rpc">일주일 추천 (1 Week)</h2>
        {weeklyRecs.length > 0 ? weeklyRecs.map(item => (
          <RecommendationItemCard key={item.stockCode + '_weekly'} item={item} />
        )) : <p className="no-data-message-rpc">금주의 추천 종목이 없습니다.</p>}
      </section>

      <section className="recommendation-section-rpc">
        <h2 className="section-title-rpc">한달 추천 (1 Month)</h2>
        {monthlyRecs.length > 0 ? monthlyRecs.map(item => (
          <RecommendationItemCard key={item.stockCode + '_monthly'} item={item} />
        )) : <p className="no-data-message-rpc">이달의 추천 종목이 없습니다.</p>}
      </section>
    </div>
  );
};

export default RecommendationsPage;