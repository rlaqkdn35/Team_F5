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
    const [top5Stocks, setTop5Stocks] = useState([]); // 뉴스에서 추출된 상위 5개 종목 데이터
    const [recommendedStocks, setRecommendedStocks] = useState([]); // 최종 결합된 종목 데이터
    const [selectedModelId, setSelectedModelId] = useState(null);
    const [stockPredictions, setStockPredictions] = useState([]);

    // 1. 초기 AI 모델 설정 및 초기 데이터 로드 (첫 렌더링 시 한 번만 실행)
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

        // 초기 데이터 호출
        fetchTop5NewsDetails();
        fetchStockPredictions();
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

    // 2. 뉴스 데이터 가져오기 및 종목 중심으로 재구성 (새로운 /F5/news/top5-with-details 엔드포인트)
    const fetchTop5NewsDetails = async () => {
        try {
            const response = await axios.get('http://localhost:8084/F5/news/top5-with-details');
            console.log('Top 5 뉴스 상세 데이터:', response.data);

            const stocksMap = {}; // 종목 코드를 키로 하여 데이터 저장

            response.data.forEach(newsItem => {
                // 뉴스 자체의 감성 분석 점수 (없으면 neutral, N/A로 처리)
                // 백엔드에서 newsAnalysis와 newsAnalysisScore가 필수가 아니므로 기본값 처리
                const newsAnalysis = newsItem.newsAnalysis ?? 'N/A';
                const newsAnalysisScore = newsItem.newsAnalysisScore ?? null;

                newsItem.relatedStocks.forEach(relatedStock => {
                    const stockCode = relatedStock.stockCode;
                    if (!stocksMap[stockCode]) {
                        stocksMap[stockCode] = {
                            code: stockCode,
                            name: relatedStock.stockName,
                            companyInfo: relatedStock.companyInfo,
                            // stockPrices 배열이 있다면 가장 최신 (배열의 첫 번째) 가격을 latestPrice로 설정
                            latestPrice: relatedStock.stockPrices?.length > 0 ? relatedStock.stockPrices[0] : null,
                            relatedNews: [], // 이 종목과 관련된 뉴스들을 저장할 배열
                            predictionDays: null, // 초기에는 예측 데이터 없음
                            modelAPrediction: null, // 초기에는 모델 A 예측 없음
                        };
                    }
                    // 현재 뉴스를 해당 종목의 relatedNews 배열에 추가
                    stocksMap[stockCode].relatedNews.push({
                        newsTitle: newsItem.newsTitle,
                        newsSummary: newsItem.newsSummary,
                        newsUrl: newsItem.newsUrl,
                        pressName: newsItem.pressName,
                        newsDt: newsItem.newsDt,
                        newsAnalysis: newsAnalysis, // 뉴스 자체의 감성 분석
                        newsAnalysisScore: newsAnalysisScore, // 뉴스 자체의 감성 분석 점수
                    });
                });
            });
            setTop5Stocks(Object.values(stocksMap)); // 맵의 값들을 배열로 변환하여 저장
            console.log('종목 중심으로 재구성된 데이터:', Object.values(stocksMap));

        } catch (error) {
            console.error('Top 5 뉴스 상세 데이터 불러오기 실패:', error);
            setTop5Stocks([]); // 에러 발생 시 빈 배열로 초기화
        }
    };

    // 3. 주가 예측 데이터 가져오기
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

    // 4. 뉴스 기반 종목 데이터 (top5Stocks)와 예측 데이터 (stockPredictions)를 결합
    useEffect(() => {
        const combinedStocksMap = new Map(); // 종목 코드를 키로 Map 사용

        // 1단계: 뉴스에서 가져온 종목 데이터를 기본으로 설정
        top5Stocks.forEach(stock => {
            // 깊은 복사를 통해 원본 객체 변경 방지
            combinedStocksMap.set(stock.code, { ...stock });
        });

        // 2단계: 예측 데이터를 결합
        stockPredictions.forEach(prediction => {
            const stockCode = prediction.stockCode;
            if (combinedStocksMap.has(stockCode)) {
                // 이미 뉴스 데이터가 있는 종목이면, 예측 데이터 추가
                const existingStock = combinedStocksMap.get(stockCode);
                existingStock.predictionDays = prediction.predictionDays;
                existingStock.modelAPrediction = prediction.predictionDays?.firstDay;
            } else {
                // 뉴스 데이터는 없지만 예측 데이터만 있는 새로운 종목이면, Map에 추가
                combinedStocksMap.set(stockCode, {
                    code: stockCode,
                    name: prediction.stockName || `종목 ${stockCode}`,
                    modelAPrediction: prediction.predictionDays?.firstDay,
                    predictionDays: prediction.predictionDays,
                    relatedNews: [], // 뉴스 정보 없음
                    companyInfo: '정보 없음', // 기본값
                    latestPrice: null, // 기본값
                });
            }
        });

        // Map의 값들을 배열로 변환하여 최종 recommendedStocks 상태 업데이트
        setRecommendedStocks(Array.from(combinedStocksMap.values()));
        console.log('최종 결합된 recommendedStocks:', Array.from(combinedStocksMap.values()));

    }, [top5Stocks, stockPredictions]); // top5Stocks와 stockPredictions가 변경될 때마다 실행

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
                display: true,
                grid: {
                    display: false
                },
                ticks: {
                    display: false,
                    autoSkip: true,
                    maxTicksLimit: 2,
                    font: {
                        size: 8
                    }
                },
                title: {
                    display: false,
                }
            },
            y: {
                display: true,
                position: 'right',
                grid: {
                    display: false
                },
                ticks: {
                    display: true,
                    callback: function(value, index, values) {
                        return value.toFixed(0);
                    },
                    maxTicksLimit: 3,
                    font: {
                        size: 8
                    },
                    padding: 2
                },
                title: {
                    display: false,
                }
            }
        },
        layout: {
            padding: {
                left: 0,
                right: 5,
                top: 0,
                bottom: 0
            }
        }
    });
    // --- 차트 데이터 생성 함수 끝 ---

    return (
        <div className="recommendations-page">
            {/* 📊 종목 예측 테이블 섹션 */}
            <div className="stock-prediction-section">
                <h2 className="section-title">AI 모델별 종목 예측</h2>
                <div className="table-container">
                    <table className="stock-data-table">
                        <thead>
                            <tr>
                                <th>종목명<br></br>(코드)</th>
                                <th>주가예측모델 예측 (차트)</th>
                                <th>관련 뉴스</th>
                                <th>뉴스별 분류 예측 모델</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recommendedStocks.length > 0 ? (
                                recommendedStocks.map(stock => (
                                    <tr key={stock.code}>
                                        <td>
                                            {stock.name} <br />({stock.code})
                                            {/* 최신 주가 정보 표시 */}
                                            {stock.latestPrice && (
                                                <div className={`stock-price-info ${stock.latestPrice.stockFluctuation > 0 ? 'positive' : stock.latestPrice.stockFluctuation < 0 ? 'negative' : 'neutral'}`}>
                                                    <br />
                                                    현재가: {stock.latestPrice.closePrice?.toLocaleString()}원
                                                    ({stock.latestPrice.stockFluctuation > 0 ? '▲' : stock.latestPrice.stockFluctuation < 0 ? '▼' : ''}
                                                    {stock.latestPrice.stockFluctuation?.toFixed(2)}%)
                                                </div>
                                            )}
                                        </td>
                                        {/* 모델 예측 차트 셀 */}
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
                                        {/* 관련 뉴스 및 뉴스 분류 예측 */}
                                        {stock.relatedNews && stock.relatedNews.length > 0 ? (
                                            <>
                                                {/* 관련 뉴스 요약 */}
                                                <td>
                                                    <div className="news-list-container">
                                                        {stock.relatedNews.map((news, newsIdx) => (
                                                            <div key={newsIdx} className="individual-news-item">
                                                                <a href={news.newsUrl} target="_blank" rel="noopener noreferrer" className="news-title-link">
                                                                    {news.newsTitle}
                                                                </a>
                                                                <p className="news-summary-table">({news.pressName}) {news.newsSummary}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                {/* 뉴스별 분류 예측 모델 */}
                                                <td>
                                                    <div className="news-analysis-list">
                                                        {stock.relatedNews.map((news, newsIdx) => (
                                                            <p key={newsIdx} className={`news-analysis-table ${news.newsAnalysis ?? 'neutral'}`}>
                                                                {newsAnalysisTerms[news.newsAnalysis] ?? newsAnalysisTerms['N/A']}
                                                                {news.newsAnalysisScore !== undefined && news.newsAnalysisScore !== null
                                                                    ? <><br />점수: {(news.newsAnalysisScore * 100).toFixed(2)}%</> 
                                                                    : ''
                                                                }
                                                            </p>
                                                        ))}
                                                    </div>
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
                                    <td colSpan="4" className="no-data-message">
                                        데이터를 불러오는 중이거나, 표시할 데이터가 없습니다.
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