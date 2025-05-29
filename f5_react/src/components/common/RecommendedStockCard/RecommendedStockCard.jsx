import React from 'react';
import './RecommendedStockCard.css'; // 추천 종목 카드 스타일

const RecommendedStockCard = ({ stock }) => {
  return (
    <div className="recommended-stock-card">
      <div className="stock-header">
        <h4 className="stock-name">{stock.name} ({stock.code})</h4>
        <p className={`current-price ${stock.changeType}`}>
          {stock.currentPrice}
          <span className="change-info"> {stock.change} ({stock.changeRate})</span>
        </p>
      </div>
      <div className="stock-chart-area">
        {/* 실제 차트 컴포넌트를 여기에 렌더링 */}
        <div className="mini-stock-chart-placeholder">
          <p>1번 모델 차트 {stock.name}</p>
        </div>
        <div className="mini-stock-chart-placeholder">
          <p>2번 모델 차트 {stock.name}</p>
        </div>
        <div className="mini-stock-chart-placeholder">
          <p>3번 모델 차트 {stock.name}</p>
        </div>
        
      </div>
      <div className="recommendation-reason-box">
        <strong>★☆AI 추천 이유☆★</strong>
        <p>{stock.reason}</p>
      </div>
    </div>
  );
};

export default RecommendedStockCard;