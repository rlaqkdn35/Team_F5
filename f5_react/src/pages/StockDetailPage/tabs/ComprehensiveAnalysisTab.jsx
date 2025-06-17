import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx'; // 이전에 만든 StockChart 컴포넌트
import './ComprehensiveAnalysisTab.css';

// 임시: 1개월치 목업 차트 데이터 생성 함수
const getMockMonthlyChartData = (stockCode) => {
  console.log(`Workspaceing 1-month chart data for ${stockCode} (ComprehensiveAnalysisTab)`);
  const data = [];
  const days = 22; // 대략 1개월 거래일
  const basePrice = Math.random() * 50000 + 10000; // 10,000 ~ 150,000 사이 랜덤 기초 가격
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    data.push({
      time: date.toISOString().split('T')[0], // YYYY-MM-DD
      // 라인 차트용 value 또는 캔들스틱용 ohlc. 여기서는 라인 차트 가정
      value: parseFloat((basePrice + (Math.random() * (basePrice*0.1) - (basePrice*0.05)) + i * (Math.random() * (basePrice*0.01) - (basePrice*0.005))).toFixed(2)),
    });
  }
  return data;
};

// 임시: 기업 개요 목업 데이터 생성 함수
const getMockCompanyOverview = (stockName) => {
  return `${stockName}은(는) 혁신적인 기술과 뛰어난 시장 경쟁력을 바탕으로 해당 산업 분야를 선도하고 있는 기업입니다. 최근 AI 및 신기술 도입을 통해 지속적인 성장을 추구하고 있으며, 투자자들의 많은 관심을 받고 있습니다. 주요 사업 영역으로는 ... (여기에 실제 기업 개요 데이터 필요)`;
};

const ComprehensiveAnalysisTab = ({ stockData, stockCode }) => {
  // stockData prop은 StockDetailPage에서 이미 로드한 기본 정보를 담고 있을 수 있습니다.
  // 차트 데이터나 기업 개요는 이 컴포넌트에서 추가로 로드하거나, stockData에 이미 포함되어 있을 수 있습니다.
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [companyOverview, setCompanyOverview] = useState('');
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    if (stockCode) {
      setLoadingChart(true);
      // 실제로는 API 호출: fetchMonthlyChartData(stockCode).then(...)
      // 실제로는 API 호출: fetchCompanyOverview(stockCode).then(...)
      setTimeout(() => { // 데이터 로딩 시뮬레이션
        setMonthlyChartData(getMockMonthlyChartData(stockCode));
        setCompanyOverview(getMockCompanyOverview(stockData?.name || stockCode));
        setLoadingChart(false);
      }, 300);
    }
  }, [stockCode, stockData?.name]);

  if (!stockData) {
    return <p className="loading-message-cat">종목 정보를 불러오는 중입니다...</p>; // CAT: ComprehensiveAnalysisTab
  }

  const companyOverviewText = stockData.companyOverview || '기업 개요 정보가 없습니다.';

  return (
    <div className="comprehensive-analysis-tab">
      <section className="company-overview-section-cat">
        <h3 className="tab-section-title-cat">기업 개요</h3>
        {loadingChart ? (
          <p>기업 개요 로딩 중...</p>
        ) : (
          <p className="overview-text-cat">{companyOverviewText}</p>
        )}
      </section>

      <section className="monthly-chart-section-cat">
        <h3 className="tab-section-title-cat">최근 1개월 주가 차트</h3>
        {loadingChart ? (
          <div className="chart-loading-placeholder-cat" style={{height: '300px'}}>차트 데이터 로딩 중...</div>
        ) : monthlyChartData.length > 0 ? (
          <div className="chart-wrapper-cat">
            <StockChart 
              data={monthlyChartData} 
              chartType="line" // 또는 "candlestick" 등 필요에 따라
              chartOptions={{ 
                height: 300, // 차트 높이
                // 필요한 다른 차트 옵션들
              }} 
            />
          </div>
        ) : (
          <p className="no-data-message-cat">1개월 차트 데이터가 없습니다.</p>
        )}
      </section>
      
      {/* 여기에 AI 종합 분석 의견, 주요 재무 정보 요약 등 추가 섹션 구성 가능 */}
    </div>
  );
};

ComprehensiveAnalysisTab.propTypes = {
  stockData: PropTypes.shape({ // StockDetailPage에서 전달받는 기본 정보
    name: PropTypes.string,
    // ... 기타 필요한 기본 정보
  }),
  stockCode: PropTypes.string.isRequired, // URL 파라미터로 받은 종목 코드
};

export default ComprehensiveAnalysisTab;