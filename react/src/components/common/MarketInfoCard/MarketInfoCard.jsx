// src/components/common/MarketInfoCard/MarketInfoCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './MarketInfoCard.css'; // 이 컴포넌트의 스타일 파일

const MarketInfoCard = ({ marketData, chartNode }) => {
  if (!marketData) return null;

  const changeClass = marketData.changeType === 'positive' ? 'positive'
                    : marketData.changeType === 'negative' ? 'negative'
                    : 'neutral';
  return (
    // market-section 클래스명을 좀 더 범용적인 market-info-card-ui 로 변경 (선택적)
    <div className={`market-info-card-ui ${marketData.name.toLowerCase().replace(/\s+/g, '-')}-section`}>
      <div className="market-info-main"> {/* 정보 텍스트를 위한 컨테이너 */}
        <h3 className="market-name">{marketData.name}</h3>
        <p className="market-value">{marketData.value}</p>
        <p className={`market-change ${changeClass}`}>{marketData.change}</p>
      </div>
      <div className="market-chart-area">
        {/* chartNode prop으로 받은 JSX를 렌더링, 없으면 기본 플레이스홀더 */}
        {chartNode || <div className="chart-placeholder">차트 데이터 없음</div>}
      </div>
    </div>
  );
};

MarketInfoCard.propTypes = {
  marketData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    change: PropTypes.string.isRequired,
    changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']).isRequired,
  }).isRequired,
  chartNode: PropTypes.node, // 어떤 React 노드든 차트 영역에 전달 가능
};

export default MarketInfoCard;