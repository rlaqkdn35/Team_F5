import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './InteractiveIndexDisplay.css';
import MarketInfoCard from '../../../../components/common/MarketInfoCard/MarketInfoCard.jsx';
import StockChart from '../../../../components/charts/StockChart/StockChart.jsx';

// 임시: 기간별 목업 데이터 생성 함수 (이전과 동일)
const getMockIndexDataForPeriod = (indexName, period) => {
  console.log(`${indexName} (${period}) 데이터 요청 (InteractiveIndexDisplay)`);
  const baseValue = indexName === '코스피' ? 2700 : 850;
  const data = [];
  const days = period === '1D' ? 1 : period === '1M' ? 22 : period === '3M' ? 66 : period === '1Y' ? 250 : 5; // 거래일 기준 유사하게
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    data.push({
      time: date.toISOString().split('T')[0], // YYYY-MM-DD
      value: parseFloat((baseValue + (Math.random() * 100 - 50) + i * (Math.random() * 2 - 1)).toFixed(2)),
    });
  }
  return data;
};

const PERIODS = [
  { id: '1D', name: '1일' }, { id: '1M', name: '1개월' }, { id: '3M', name: '3개월' },
  { id: '1Y', name: '1년' }, { id: 'YTD', name: '연초대비' }, { id: 'ALL', name: '전체' }
];

const InteractiveIndexDisplay = ({ indexBasicInfo }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[1].id); // 기본 '1개월'
  const [dynamicChartData, setDynamicChartData] = useState([]);

  useEffect(() => {
    setDynamicChartData(getMockIndexDataForPeriod(indexBasicInfo.name, selectedPeriod));
  }, [indexBasicInfo.name, selectedPeriod]);

  // StockChart 컴포넌트를 생성하여 MarketInfoCard에 전달
  const actualChartNode = dynamicChartData.length > 0 ? (
    <StockChart data={dynamicChartData} chartType="line" /> // StockChart의 높이는 StockChart.css에서 조절
  ) : (
    <div className="chart-loading-placeholder">차트 데이터 로딩 중...</div>
  );

  return (
    <div className="interactive-index-display-wrapper">
      {/* MarketInfoCard는 정보 표시와 차트 '슬롯'만 제공 */}
      <MarketInfoCard
        marketData={indexBasicInfo} 
        chartNode={actualChartNode} // 여기에 동적 차트를 전달
      />
      {/* 기간 선택 버튼들은 MarketInfoCard 바깥 또는 다른 방식으로 배치 가능 */}
      <div className="period-selector-iid"> {/* IID: InteractiveIndexDisplay 약자 */}
        {PERIODS.map(period => (
          <button
            key={period.id}
            className={`period-button-iid ${selectedPeriod === period.id ? 'active' : ''}`}
            onClick={() => setSelectedPeriod(period.id)}
          >
            {period.name}
          </button>
        ))}
      </div>
    </div>
  );
};

InteractiveIndexDisplay.propTypes = {
  indexBasicInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    change: PropTypes.string.isRequired,
    changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']).isRequired,
  }).isRequired,
};

export default InteractiveIndexDisplay;