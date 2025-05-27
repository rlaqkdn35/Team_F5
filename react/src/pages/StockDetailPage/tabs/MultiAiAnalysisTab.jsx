import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx'; // 공용 StockChart 컴포넌트
import './MultiAiAnalysisTab.css'; // 이 탭의 스타일

// 임시: 다중 AI 분석 목업 데이터 생성 함수
const getMockMultiAiData = (stockCode) => {
  console.log(`Workspaceing multi-AI data for ${stockCode} (MultiAiAnalysisTab)`);
  const generateSeriesData = (base, volatility, days = 30) => {
    const data = [];
    let currentDate = new Date();
    for (let i = 0; i < days; i++) {
      const pointDate = new Date(currentDate);
      pointDate.setDate(currentDate.getDate() - (days - 1 - i) + Math.floor(days/2)); // 예측 기간을 현재 근처로
      data.push({
        time: pointDate.toISOString().split('T')[0],
        value: parseFloat((base + (Math.random() * volatility * 2 - volatility) + (i - days/2) * (Math.random() * (volatility/5))).toFixed(2)),
      });
    }
    return data;
  };

  const basePrice = Math.random() * 100000 + 50000;

  return {
    stockName: `종목 ${stockCode}`,
    // 종합 차트용 데이터: 실제 주가 + 각 AI 예측치 또는 평균 예측치 + 신뢰구간 등
    // 여기서는 간단히 AI 1의 예측을 메인으로 사용하고, 다른 AI 예측을 추가 라인으로 그릴 수 있다고 가정
    aggregatedChart: {
      actualPrice: generateSeriesData(basePrice, basePrice * 0.02, 60), // 과거 30일 + 현재 + 미래 29일 가정
      ai1Prediction: generateSeriesData(basePrice * 1.05, basePrice * 0.03, 30), // 향후 30일 예측
      ai2Prediction: generateSeriesData(basePrice * 1.02, basePrice * 0.04, 30),
      ai3Prediction: generateSeriesData(basePrice * 1.08, basePrice * 0.025, 30),
      // 또는 하나의 종합 예측 라인과 신뢰 구간(상단/하단 밴드) 데이터
      // combinedPrediction: generateSeriesData(basePrice * 1.05, basePrice * 0.03, 30),
      // upperBand: generateSeriesData(basePrice * 1.10, basePrice * 0.03, 30),
      // lowerBand: generateSeriesData(basePrice * 1.00, basePrice * 0.03, 30),
    },
    // 개별 AI 미니 차트용 데이터
    individualAiPredictions: [
      { aiName: 'AI 모델 A (알파고수)', predictionData: generateSeriesData(basePrice * 1.05, basePrice * 0.03, 30), summary: '단기 상승 후 조정 예상' },
      { aiName: 'AI 모델 B (베타고수)', predictionData: generateSeriesData(basePrice * 1.02, basePrice * 0.04, 30), summary: '점진적 우상향 패턴' },
      { aiName: 'AI 모델 C (감마고수)', predictionData: generateSeriesData(basePrice * 1.08, basePrice * 0.025, 30), summary: '변동성 확대, 단기 고점 가능성' },
    ]
  };
};


const MultiAiAnalysisTab = ({ stockData, stockCode }) => {
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stockCode) {
      setLoading(true);
      // 실제로는 API 호출: fetchMultiAiAnalysis(stockCode).then(data => setAiAnalysisData(data));
      setTimeout(() => { // 데이터 로딩 시뮬레이션
        setAiAnalysisData(getMockMultiAiData(stockCode));
        setLoading(false);
      }, 300);
    }
  }, [stockCode]);

  if (loading || !aiAnalysisData) {
    return <p className="loading-message-mat">다중 AI 분석 정보를 불러오는 중입니다...</p>; // MAT: MultiAiAnalysisTab
  }

  // Recharts에서 여러 라인을 그리려면 data 배열의 각 객체가 모든 라인의 y값을 가져야 함.
  // 예: { time: '2024-01-01', actual: 100, ai1: 105, ai2: 103, ai3: 108 }
  // 또는 각 AI 예측을 별도의 <Line> 컴포넌트로 추가하고 각자 다른 data prop을 받을 수 있도록 StockChart 수정 필요.
  // 여기서는 StockChart가 단일 data prop에 단일 value 키를 사용한다고 가정하고,
  // 종합 차트는 AI 1의 예측을 대표로 보여주거나, 또는 여러 <Line>을 그릴 수 있도록 StockChart를 확장해야 함.
  // 지금은 AI 1의 예측만 사용.
  const mainChartDisplayData = aiAnalysisData.aggregatedChart.ai1Prediction;


  return (
    <div className="multi-ai-analysis-tab">
      <section className="aggregated-chart-section-mat">
        <h3 className="tab-section-title-mat">3개 AI 종합 예측 분석 (예시: AI 모델 A)</h3>
        {mainChartDisplayData.length > 0 ? (
          <div className="large-chart-wrapper-mat">
            <StockChart 
              data={mainChartDisplayData} 
              chartType="line"
              chartOptions={{ 
                height: 350, // 큰 차트 높이
                lineColor: '#ff7300', // 예시: 종합 또는 대표 AI 라인 색상
                // 여기에 종합 차트에 필요한 추가 옵션 (예: 다른 AI 예측 라인, 신뢰 구간 등)
              }} 
            />
          </div>
        ) : (
          <p className="no-data-message-mat">종합 예측 차트 데이터가 없습니다.</p>
        )}
      </section>

      <section className="individual-ai-charts-section-mat">
        <h3 className="tab-section-title-mat">개별 AI 모델 예측 상세</h3>
        <div className="mini-charts-container-mat">
          {aiAnalysisData.individualAiPredictions.map((aiPred, index) => (
            <div key={aiPred.aiName} className="mini-chart-card-mat">
              <h4 className="ai-model-name-mat">{aiPred.aiName}</h4>
              <div className="mini-chart-wrapper-mat">
                {aiPred.predictionData.length > 0 ? (
                  <StockChart 
                    data={aiPred.predictionData} 
                    chartType="line"
                    chartOptions={{ 
                      height: 150, // 미니 차트 높이
                      lineWidth: 1.5,
                      lineColor: ['#8884d8', '#82ca9d', '#ffc658'][index % 3], // 각 AI별 다른 색상
                      // 미니 차트이므로 축, 그리드, 툴팁 등은 간소화하거나 숨김 처리 가능
                      // 예: hideXAxis: true, hideYAxis: true, hideGrid: true, enableTooltip: false
                      // 이러한 옵션들을 StockChart 컴포넌트가 지원하도록 만들어야 함
                    }} 
                  />
                ) : (
                  <div className="chart-placeholder-mat" style={{height: '150px'}}>데이터 없음</div>
                )}
              </div>
              <p className="ai-summary-mat">{aiPred.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

MultiAiAnalysisTab.propTypes = {
  stockData: PropTypes.object, // StockDetailPage에서 전달받는 기본 정보 (필요시 사용)
  stockCode: PropTypes.string.isRequired,
};

export default MultiAiAnalysisTab;