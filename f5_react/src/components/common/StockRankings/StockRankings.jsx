import React from 'react';
import PropTypes from 'prop-types';
// RankingListCard 임포트 경로 수정
import RankingListCard from '../RankingListCard/RankingListCard.jsx'; 
import './StockRankings.css';

const StockRankings = ({ sectionTitle = "주요 종목 랭킹", popularItems = [], hitRateItems = [], profitRateItems = [] }) => {
  return (
    <section className="stock-rankings-section">
      {sectionTitle && <h2 className="section-title">{sectionTitle}</h2>}
      <div className="rankings-container">
        <RankingListCard title="인기 검색 종목" items={popularItems} />
        <RankingListCard title="AI 적중률 상위" items={hitRateItems} />
        <RankingListCard title="AI 수익률 상위" items={profitRateItems} />
      </div>
    </section>
  );
};

// PropTypes 정의 (RankingListCard의 itemShape과 동일하게 사용 가능)
const itemShape = PropTypes.shape({
  rank: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  price: PropTypes.string,
  changeValue: PropTypes.string,
  changeRate: PropTypes.string,
});

StockRankings.propTypes = {
  sectionTitle: PropTypes.string,
  popularItems: PropTypes.arrayOf(itemShape),
  hitRateItems: PropTypes.arrayOf(itemShape),
  profitRateItems: PropTypes.arrayOf(itemShape),
};

export default StockRankings;