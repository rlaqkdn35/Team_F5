import React from 'react';
import PropTypes from 'prop-types'; // prop-types를 사용하여 props 타입 검사 (선택 사항이지만 권장)
import './TickerItem.css'; // TickerItem 전용 CSS 파일 (필요하다면)

const TickerItem = ({ stock }) => {
  if (!stock) {
    return null; // stock 데이터가 없으면 아무것도 렌더링하지 않음
  }

  const { name, code, price, change, prediction, predictionIcon, color } = stock;

  return (
    <div className="ticker-item" data-testid={`ticker-item-${code}`}> {/* key는 부모 컴포넌트의 map에서 사용 */}
      <span className="stock-name">{name}</span>
      <span className="stock-price">{price}</span>
      <span className={`stock-change ${color === 'red' ? 'positive' : 'negative'}`}>
        {change}
      </span>
      <span className={`stock-prediction ${color === 'red' ? 'positive-prediction' : 'negative-prediction'}`}>
        {predictionIcon} {prediction}
      </span>
      {/* 필요하다면 여기에 Link 컴포넌트를 추가하여 상세 페이지로 이동하도록 할 수도 있습니다. */}
      {/* 예: <Link to={`/stock/${code}`}>상세보기</Link> */}
    </div>
  );
};

// PropTypes 정의 (타입스크립트를 사용하지 않는 경우 권장)
TickerItem.propTypes = {
  stock: PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    change: PropTypes.string.isRequired,
    prediction: PropTypes.string.isRequired,
    predictionIcon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
};

export default TickerItem;