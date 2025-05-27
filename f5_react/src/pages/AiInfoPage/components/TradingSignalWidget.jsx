// src/pages/AiInfoPage/components/TradingSignalWidget/TradingSignalWidget.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TradingSignalWidget.css'; // 같은 폴더 내 CSS 파일

const TradingSignalWidget = () => {
  const navigate = useNavigate();
  const [signalStatus, setSignalStatus] = useState({ buyCount: 0, sellCount: 0 });

  useEffect(() => {
    // 임시 데이터 로딩 (실제로는 API 호출)
    const timer = setTimeout(() => {
      setSignalStatus({ buyCount: 7, sellCount: 3 });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToTradingSignals = (signalType) => {
    // 클릭 시 '/trading-signals' 메인 페이지로 이동
    // 필요하다면 signalType을 사용하여 경로에 추가 정보를 전달할 수 있습니다.
    // 예: navigate(`/trading-signals?filter=${signalType}`);
    navigate('/trading-signals'); 
  };

  return (
    <div className="trading-signal-widget">
      <h4 className="widget-title">오늘의 AI매매신호 현황</h4>
      <div className="signal-cards-container">
        <div 
          className="signal-card buy-signal-card" 
          onClick={() => handleNavigateToTradingSignals('buy')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigateToTradingSignals('buy'); }}
          aria-label={`매수 신호 ${signalStatus.buyCount} 종목, 상세 보기`}
        >
          <span className="signal-card-title">매수 신호</span>
          <span className="signal-card-value">{signalStatus.buyCount} <span className="unit">종목</span></span>
        </div>
        <div 
          className="signal-card sell-signal-card" 
          onClick={() => handleNavigateToTradingSignals('sell')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigateToTradingSignals('sell'); }}
          aria-label={`매도 신호 ${signalStatus.sellCount} 종목, 상세 보기`}
        >
          <span className="signal-card-title">매도 신호</span>
          <span className="signal-card-value">{signalStatus.sellCount} <span className="unit">종목</span></span>
        </div>
      </div>
    </div>
  );
};

export default TradingSignalWidget;