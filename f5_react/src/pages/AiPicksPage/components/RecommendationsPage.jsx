import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecommendationsPage.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js에 필요한 컴포넌트들을 등록합니다.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RecommendationsPage = () => {
  const [aiModels, setAiModels] = useState([]);
  const [recommendedStocks, setRecommendedStocks] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [newsData, setNewsData] = useState({});
  const [stockPredictions, setStockPredictions] = useState([]);

  useEffect(() => {
    const initialAiModels = [
      {
        id: 'alpha-model',
        name: '알파 모델',
        score: 93,
        summary: '주가 흐름 데이터를 분석하여 단기 변동성을 예측합니다.',
        recommendedStock: { code: '000250', name: '코스피200 (예시)', reason: '종합 시장 지표 개선 예상으로 긍정적입니다.' }
      },
      {
        id: 'beta-model',
        name: '베타 모델',
        score: 89,
        summary: '기업 재무 상태와 산업 동향을 고려한 중장기 투자를 제안합니다.',
        recommendedStock: { code: '003380', name: '하림 (예시)', reason: '새로운 사업 확장 소식으로 성장 기대감이 높습니다.' }
      },
      {
        id: 'gamma-model',
        name: '감마 모델',
        score: 96,
        summary: '소셜 트렌드와 뉴스 감성을 파악하여 시장 심리를 반영합니다.',
        recommendedStock: { code: '000250', name: '코스피200 (예시)', reason: '시장 전반의 긍정적 심리가 반영될 것입니다.' }
      },
    ];
    setAiModels(initialAiModels);

    if (initialAiModels.length > 0) {
      const topModel = initialAiModels.reduce((prev, current) => (prev.score > current.score ? prev : current));
      setSelectedModelId(topModel.id);
    }

    const fetchNewsData = async () => {
      try {
        const response = await axios.get('http://localhost:8084/F5/news/latest-per-individual-stock');
        const processedNews = {};
        response.data.forEach(news => {
          const code = news.stockCode.trim();
          if (!processedNews[code] || new Date(news.newsDt) > new Date(processedNews[code].newsDt)) {
            processedNews[code] = news;
          }
        });
        setNewsData(processedNews);
      } catch (error) {
        console.error('뉴스 데이터 불러오기 실패:', error);
      }
    };

    fetchNewsData();
    fetchStockPredictions(); 
  }, []);

  const fetchStockPredictions = async () => {
    try {
      const response = await axios.get('http://localhost:8084/F5/predictions/latest-per-stock');
      if (response.status === 200) {
        setStockPredictions(response.data);
        console.log('새로운 AI 예측 데이터 성공적으로 로드됨:', response.data);
      } else if (response.status === 204) {
        console.log('새로운 AI 예측 데이터 없음 (204 No Content).');
        setStockPredictions([]); 
      }
    } catch (error) {
      console.error('새로운 AI 예측 데이터 불러오기 실패:', error);
      setStockPredictions([]); 
    }
  };

  useEffect(() => {
    if (stockPredictions.length > 0) {
      const combinedStocks = stockPredictions.map(prediction => {
        const news = newsData[prediction.stockCode] || null;
        return {
          code: prediction.stockCode,
          name: prediction.stockName || `종목 ${prediction.stockCode}`,
          modelAPrediction: prediction.predictionDays?.firstDay, // 모델 A 예측 데이터: firstDay 값
          newsInfo: news, 
          predictionDays: prediction.predictionDays // 차트 생성을 위해 필요
        };
      });
      setRecommendedStocks(combinedStocks);
      console.log('생성된 recommendedStocks (예측 및 뉴스 기반):', combinedStocks);
    } else if (Object.keys(newsData).length > 0) {
      const stocksFromNewsOnly = Object.keys(newsData).map(code => {
        return {
          code: code,
          name: newsData[code]?.stockName || `종목 ${code}`,
          modelAPrediction: null, // firstDay 없음
          modelBPrediction: null,
          newsInfo: newsData[code],
          predictionDays: null // 뉴스만 있을 경우 차트 데이터 없음
        };
      });
      setRecommendedStocks(stocksFromNewsOnly);
      console.log('생성된 recommendedStocks (뉴스만 기반):', stocksFromNewsOnly);
    }
  }, [stockPredictions, newsData]);

  const getPredictionStatus = (predictionValues) => {
    if (!predictionValues || predictionValues.length < 2 || predictionValues.some(val => typeof val !== 'number' || isNaN(val))) {
      return { score: '예측 불가능', state: '데이터 부족', class: 'neutral' };
    }
    
    const first = Number(predictionValues[0]);
    const last = Number(predictionValues[predictionValues.length - 1]);

    if (isNaN(first) || isNaN(last)) {
        return { score: '예측 불가능', state: '데이터 오류', class: 'neutral' };
    }

    const safeFirst = first === 0 ? 1 : first; 
    const changeRatio = (last - first) / safeFirst;

    const scoreToDisplay = last.toFixed(2);

    if (changeRatio > 0.02) return { score: scoreToDisplay, state: '강한 상승', class: 'positive' };
    else if (changeRatio > 0.005) return { score: scoreToDisplay, state: '상승', class: 'positive' };
    else if (changeRatio < -0.02) return { score: scoreToDisplay, state: '강한 하락', class: 'negative' };
    else if (changeRatio < -0.005) return { score: scoreToDisplay, state: '하락', class: 'negative' };
    else return { score: scoreToDisplay, state: '횡보', class: 'neutral' };
  };

  const currentSelectedModel = aiModels.find(model => model.id === selectedModelId);

  const combinedRecommendation = {
    stock: { code: 'KOSPI', name: '코스피 지수', reason: '다양한 AI 모델의 분석을 종합하여 시장 전반의 안정적인 성장을 예상합니다.' },
    summary: '전반적인 시장 상황을 고려한 균형 잡힌 투자 기회입니다.'
  };
  const newsAnalysisTerms = {
    'positive': '상승',
    'negative': '하락',
    'neutral': '중립',
    'N/A': '분석불가' 
  };

  // --- 차트 데이터 생성 함수 ---
  const chartLabels = [
    '1일차', '2일차', '3일차', '4일차', '5일차',
    '6일차', '7일차', '8일차', '9일차', '10일차'
  ];

  const getChartData = (stockName, predictionDays) => {
    if (!predictionDays) {
      return { labels: [], datasets: [] };
    }

    const dataValues = [
      predictionDays.firstDay,
      predictionDays.secondDay,
      predictionDays.thirdDay,
      predictionDays.fourthDay,
      predictionDays.fifthDay,
      predictionDays.sixthDay,
      predictionDays.seventhDay,
      predictionDays.eighthDay,
      predictionDays.ninthDay,
      predictionDays.tenthDay
    ].filter(val => typeof val === 'number' && !isNaN(val));

    return {
      labels: chartLabels.slice(0, dataValues.length),
      datasets: [
        {
          label: `${stockName} 예측 가격`,
          data: dataValues,
          fill: false,
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgba(75, 192, 192, 0.8)',
          tension: 0.1,
          pointRadius: 2,
          pointBackgroundColor: 'rgb(75, 192, 192)',
        },
      ],
    };
  };

  const chartOptions = (stockName) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: `${stockName} 예측`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
        x: {
            display: true, // X축 표시
            grid: {
                display: false // 그리드 라인 숨김 (필요시 true로 변경)
            },
            ticks: {
                display: false, // X축 틱(라벨) 숨김 (1일차, 2일차 등)
                autoSkip: true, // 자동 스킵 활성화
                maxTicksLimit: 2, // 표시할 최대 틱 수 (시작과 끝만 보이도록)
                font: {
                    size: 8 // 틱 폰트 크기 조절
                }
            },
            title: {
                display: false, // X축 제목 숨김
            }
        },
        y: {
            display: true, // Y축 표시
            position: 'right', // Y축을 오른쪽에 표시하여 공간 절약
            grid: {
                display: false // 그리드 라인 숨김
            },
            ticks: {
                display: true, // Y축 틱(라벨) 표시
                callback: function(value, index, values) {
                    return value.toFixed(0); // 정수로 표시하여 간결하게
                },
                maxTicksLimit: 3, // 표시할 최대 틱 수 (3개 정도만)
                font: {
                    size: 8 // 틱 폰트 크기 조절
                },
                padding: 2 // 틱과 축 라인 사이의 간격
            },
            title: {
                display: false, // Y축 제목 숨김
            }
        }
    },
    layout: {
      padding: {
        left: 0,
        right: 5, // Y축 라벨을 위한 오른쪽 패딩 추가
        top: 0,
        bottom: 0
      }
    }
  });
  // --- 차트 데이터 생성 함수 끝 ---

  return (
    <div className="recommendations-page">
      {/* <div className="ai-summary-section">
        <h2 className="section-title">오늘의 AI 추천 & 모델별 분석</h2>

        <div className="summary-grid">
          <div className="recommendation-card combined-recommendation">
            <h3>📈 종합 AI 추천 종목</h3>
            <p className="stock-info">
              <span className="stock-code">{combinedRecommendation.stock.code}</span>
              <span className="stock-name">{combinedRecommendation.stock.name}</span>
            </p>
            <p className="reason">{combinedRecommendation.stock.reason}</p>
            <p className="summary-text">{combinedRecommendation.summary}</p>
          </div>

          <div className="ai-models-list">
            <h4>모델별 AI 성능 스코어</h4>
            <div className="model-selection-bar">
              {aiModels.map(model => (
                <div
                  key={model.id}
                  className={`model-item ${selectedModelId === model.id ? 'selected' : ''}`}
                  onClick={() => setSelectedModelId(model.id)}
                >
                  <span className="model-name">{model.name}</span>
                  <span className="model-score">{model.score}점</span>
                </div>
              ))}
            </div>
            {currentSelectedModel && (
              <div className="recommendation-card selected-ai-recommendation">
                <h3>✨ {currentSelectedModel.name} 추천 종목</h3>
                <p className="stock-info">
                  <span className="stock-code">{currentSelectedModel.recommendedStock.code}</span>
                  <span className="stock-name">{currentSelectedModel.recommendedStock.name}</span>
                </p>
                <p className="reason">{currentSelectedModel.recommendedStock.reason}</p>
                <p className="summary-text">{currentSelectedModel.summary}</p>
                {newsData[currentSelectedModel.recommendedStock.code] ? (
                  <div className="related-news">
                    <h5>관련 최신 뉴스 ({newsData[currentSelectedModel.recommendedStock.code]?.pressName ?? '알 수 없음'})</h5>
                    <p>{newsData[currentSelectedModel.recommendedStock.code]?.newsTitle ?? '제목 없음'}</p>
                    <p className={`news-analysis ${newsData[currentSelectedModel.recommendedStock.code]?.newsAnalysis ?? 'neutral'}`}>
                      감성: {newsData[currentSelectedModel.recommendedStock.code]?.newsAnalysis ?? 'N/A'} ({newsData[currentSelectedModel.recommendedStock.code]?.newsAnalysisScore?.toFixed(2) ?? 'N/A'})
                    </p>
                  </div>
                ) : (
                  <div className="related-news no-news">
                    <p>관련된 뉴스가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div> */}


      {/* 📊 종목 예측 테이블 섹션 */}
      <div className="stock-prediction-section">
        <h2 className="section-title">AI 모델별 종목 예측</h2>
        <div className="table-container">
          <table className="stock-data-table">
            <thead>
              <tr>
                <th>종목명<br></br>(코드)</th>
                {/* <th>주가예측모델<br></br>(1일차)</th>  */}
                <th>주가예측모델 예측 (차트)</th>
                <th>관련 뉴스</th>
                <th>뉴스별 분류 예측 모델</th>
              </tr>
            </thead>
            <tbody>
              {recommendedStocks.length > 0 ? (
                recommendedStocks.map(stock => (
                  <tr key={stock.code}>
                    <td>{stock.name} <br></br>({stock.code})</td>
                    {/* 모델 A 예측 셀: firstDay 값 표시 */}
                    {/* <td>
                      {stock.modelAPrediction !== null && typeof stock.modelAPrediction === 'number'
                        ? stock.modelAPrediction.toFixed(2) // 숫자인 경우 소수점 두 자리까지 표시
                        : 'N/A'}
                    </td> */}
                    {/* 모델 B 예측 셀 (차트) */}
                    <td className="chart-cell">
                      {stock.predictionDays ? (
                        <div className="small-chart-container">
                          <Line
                            data={getChartData(stock.name, stock.predictionDays)}
                            options={chartOptions(stock.name)}
                          />
                        </div>
                      ) : (
                        <small>예측 데이터 없음</small>
                      )}
                    </td>
                    {stock.newsInfo ? (
                        <>
                        <td>
                            <p className="news-summary-table">{stock.newsInfo?.newsSummary ?? '요약 없음'}</p>
                        </td>

                        <td>
                        <p className={`news-analysis-table ${stock.newsInfo?.newsAnalysis ?? 'neutral'}`}>
                        {newsAnalysisTerms[stock.newsInfo?.newsAnalysis] ?? newsAnalysisTerms['N/A']}
                            {/* 괄호 제거 */}
                            {stock.newsInfo?.newsAnalysisScore !== undefined && stock.newsInfo?.newsAnalysisScore !== null
                                ? <><br />점수: {stock.newsInfo.newsAnalysisScore.toFixed(2)*100}</>
                                : ''
                            }
                        </p>
                        </td>
                        </>
                    ) : (
                        <td colSpan="2">
                        관련된 뉴스가 없습니다.
                        </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data-message">
                    AI 예측 데이터를 불러오는 중입니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;