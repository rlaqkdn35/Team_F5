import React, { useState } from 'react'; // useState 훅 임포트
import PropTypes from 'prop-types';
import RankingListCard from '../RankingListCard/RankingListCard.jsx';
import './StockRankings.css'; // StockRankings 스타일 (탭 관련 CSS 추가 필요)

const StockRankings = ({ sectionTitle = "주요 종목 랭킹", popularItems = [], hitRateItems = [], profitRateItems = [] }) => {
  // 현재 활성화된 탭을 관리하는 상태 (기본값: 'popular')
  const [activeTab, setActiveTab] = useState('popular');

  // 탭 클릭 핸들러
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // 탭 내용에 따라 렌더링할 RankingListCard 선택
  const renderRankingContent = () => {
    switch (activeTab) {
      case 'popular':
        return <RankingListCard title="인기 검색 종목" items={popularItems} />;
      case 'hitRate':
        return <RankingListCard title="AI 적중률 상위" items={hitRateItems} />;
      case 'profitRate':
        return <RankingListCard title="AI 수익률 상위" items={profitRateItems} />;
      default:
        return null;
    }
  };

  return (
    <section className="stock-rankings-section">
      {sectionTitle && <h2 className="section-title">{sectionTitle}</h2>}

      {/* 탭 네비게이션 */}
      <div className="ranking-tabs">
        <button
          className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => handleTabClick('popular')}
        >
          인기 검색 종목
        </button>
        <button
          className={`tab-button ${activeTab === 'hitRate' ? 'active' : ''}`}
          onClick={() => handleTabClick('hitRate')}
        >
          AI 적중률 상위
        </button>
        <button
          className={`tab-button ${activeTab === 'profitRate' ? 'active' : ''}`}
          onClick={() => handleTabClick('profitRate')}
        >
          AI 수익률 상위
        </button>
      </div>

      {/* 탭 내용 */}
      <div className="rankings-content">
        {renderRankingContent()}
      </div>
    </section>
  );
};

// PropTypes 정의는 기존과 동일
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