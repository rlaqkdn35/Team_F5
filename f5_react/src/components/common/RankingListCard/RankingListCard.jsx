import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './RankingListCard.css'; // 이 컴포넌트의 스타일 파일

const RankingListCard = ({ title, items = [] }) => { // items 기본값을 빈 배열로
  if (!items || items.length === 0) {
    return (
      <div className="ranking-list-card">
        <h4 className="ranking-title">{title}</h4>
        <p className="no-data-message">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="ranking-list-card">
      <h4 className="ranking-title">{title}</h4>
      <ol className="ranking-list">
        {items.slice(0, 5).map((item) => (
          <li key={item.code || item.name} className="ranking-item">
            <Link to={`/stock-detail/${item.code}`} className="ranking-item-link">
              <span className="rank">{item.rank}.</span>
              <span className="stock-name-ranking">{item.name}</span> {/* 클래스명 약간 수정 */}
              <div className="stock-financials">
                <span className="price">{item.price}</span>
                <span className={`change ${parseFloat(String(item.changeRate).replace('%','')) > 0 ? 'positive' : parseFloat(String(item.changeRate).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                  {parseFloat(String(item.changeRate).replace('%','')) > 0 ? '▲' : parseFloat(String(item.changeRate).replace('%','')) < 0 ? '▼' : ''}
                  {item.changeValue} ({item.changeRate})
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
};

RankingListCard.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      rank: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      price: PropTypes.string,
      changeValue: PropTypes.string,
      changeRate: PropTypes.string,
    })
  ),
};

export default RankingListCard;