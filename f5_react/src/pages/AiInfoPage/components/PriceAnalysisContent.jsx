import React from 'react';

// 필요한 하위 컴포넌트들을 임포트합니다.
// 경로는 실제 프로젝트 구조에 맞게 정확히 지정해주세요.

import MarketThemesSection from './MarketThemesSection/MarketThemesSection.jsx'; 

import './PriceAnalysisContent.css'; // PriceAnalysisContent 페이지를 위한 CSS
import InteractiveIndexDisplay from './InterativeIndexDisplay/InteractiveIndexDisplay.jsx';

// InteractiveIndexDisplay에 전달할 임시 지수 기본 정보
const kospiIndexBasicInfo = { 
  name: '코스피', 
  value: '2,750.50', 
  change: '+15.20 (+0.55%)', 
  changeType: 'positive' 
  // 실제 차트 데이터는 InteractiveIndexDisplay 내부에서 기간 선택에 따라 로드됩니다.
};
const kosdaqIndexBasicInfo = { 
  name: '코스닥', 
  value: '870.10', 
  change: '-2.80 (-0.32%)', 
  changeType: 'negative' 
};

const PriceAnalysisContent = () => {
  return (
    <div className="price-analysis-content-page">
      
      {/* <h1 className="page-main-title-pac">시세 분석</h1> */}

      {/* 섹션 1: 주요 지수 인터랙티브 차트 */}
      <section className="index-interactive-charts-section-pac">
        {/* 이 섹션의 소제목은 선택 사항입니다. InteractiveIndexDisplay 내부에도 지수 이름이 표시됩니다. */}
        {/* <h2 className="section-sub-title-pac">주요 지수 현황</h2> */}
        <div className="interactive-charts-container-pac">
          <InteractiveIndexDisplay indexBasicInfo={kospiIndexBasicInfo} />
          <InteractiveIndexDisplay indexBasicInfo={kosdaqIndexBasicInfo} />

        </div>
      </section>

      {/* 섹션 2: 시장 특징 테마 (내부 탭 및 테이블 포함) */}
      {/* MarketThemesSection 컴포넌트는 자체적으로 "시장특징 테마"라는 제목을 가집니다. */}
      {/* <div className="market-themes-wrapper-pac">
        <MarketThemesSection /> 
      </div> */}

    </div>
  );
};

export default PriceAnalysisContent;