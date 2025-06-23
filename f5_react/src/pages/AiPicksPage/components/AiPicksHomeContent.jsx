import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AiPicksHomeContent.css';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const AiPicksHomeContent = () => {
    const [loading, setLoading] = useState(true);
    const [todayPicks, setTodayPicks] = useState([]);
    const [bestProfitStocks, setBestProfitStocks] = useState([]);
    const [marketStatus, setMarketStatus] = useState({ isOpen: false, lastUpdated: '' });
    const [topStocks, setTopStocks] = useState([]);
    const [aiModels, setAiModels] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [signals, setSignals] = useState([]);
    const [newsData, setNewsData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const todayPicksData = [
                    { id: 'pick1', stockName: '에이테크', stockCode: 'A001', prediction: '단기 급등 예상', targetPrice: '15,000', reason: 'AI 모델 신호 포착' },
                    { id: 'pick2', stockName: '비솔루션', stockCode: 'B002', prediction: '안정적 우상향', targetPrice: '120,000', reason: '실적 개선 기대' },
                    { id: 'pick3', stockName: '씨에너지', stockCode: 'C003', prediction: '테마주 순환매', targetPrice: '8,500', reason: '수급 집중' },
                ];
                setTodayPicks(todayPicksData);

                const bestProfitData = [
                    { id: 'profit1', stockName: '가온칩스', stockCode: 'GA01', changeRate: '+25.8%', date: '05/06~05/13', lowBuyPrice: '60,000', highSellPrice: '75,500' },
                    { id: 'profit2', stockName: '나노신소재', stockCode: 'NA02', changeRate: '+18.2%', date: '05/06~05/13', lowBuyPrice: '120,000', highSellPrice: '141,800' },
                ];
                setBestProfitStocks(bestProfitData);

                const newAiModels = [];

                try {
                    const newsApiResponse = await axios.get('http://localhost:8084/F5/news/top5-latest');
                    if (newsApiResponse.data && newsApiResponse.data.length > 0) {
                        const firstNews = newsApiResponse.data[0];
                        newAiModels.push({
                            id: 'modelA',
                            name: 'AI 모델 A',
                            score: firstNews.newsAnalysisScore ? Math.round(firstNews.newsAnalysisScore * 100) : 90,
                            summary: firstNews.newsSummary || '최신 뉴스 데이터를 기반으로 추천합니다.',
                            recommendedStock: {
                                code: firstNews.stockCode || 'N/A',
                                name: firstNews.newsTitle || '뉴스 제목 없음',
                                reason: firstNews.newsSummary || '뉴스 요약 없음'
                            }
                        });
                    }
                } catch (error) {
                    console.error("AI 모델 A 데이터 로딩 중 오류 발생:", error);
                }

                try {
                    // 예측 API 호출
                    const predictionResponse = await axios.get('http://localhost:8084/F5/predictions/latest-per-stock');
                    if(predictionResponse.status === 200 && predictionResponse.data && predictionResponse.data.length > 0){
                        const firstPrediction = predictionResponse.data[0];
                        const predictionDays = firstPrediction.predictionDays;
                        let predictionReason = '예측 이유 없음';
                        if (predictionDays && predictionDays.firstDay) {
                            predictionReason = `1일차 예상 가격 ${predictionDays.firstDay.toLocaleString()}원. 장기적인 우상향 기대.`;
                        }

                        newAiModels.push({
                            id: 'modelB',
                            name: 'AI 모델 B',
                            score: 85,
                            summary: `AI 모델 B는 예측 가격 데이터를 기반으로 종목을 추천합니다. ${predictionReason}`,
                            recommendedStock: {
                                code: firstPrediction.stockCode || 'N/A',
                                name: firstPrediction.stockName || '종목명 없음',
                                reason: predictionReason,
                                predictionDays: predictionDays // 차트 데이터를 위해 predictionDays 추가
                            }
                        });
                    } else if (predictionResponse.status === 204) {
                        console.log('새로운 AI 예측 데이터 없음 (204 No Content).');
                    }
                } catch (error) {
                    console.error("AI 모델 B 데이터 로딩 중 오류 발생:", error);
                }

                setAiModels(newAiModels);
                if (newAiModels.length > 0) {
                    const initialSelectedModel = newAiModels.reduce((prev, current) =>
                        (prev.score > current.score) ? prev : current
                    );
                    setSelectedModelId(initialSelectedModel.id);
                } else {
                    setSelectedModelId(null);
                }

                const allSignalsData = [
                    { id: 1, type: 'BUY', stock: '삼성전자', code: '005930', price: 82000, change: '+2.5%', time: '2025-05-27 10:30', strength: '매우 강함', reason: '강력한 거래량 동반 이동평균선 돌파', premium: true },
                    { id: 2, type: 'SELL', stock: 'SK하이닉스', code: '000660', price: 195000, change: '-1.0%', time: '2025-05-27 10:00', strength: '중간', reason: '단기 과열 및 저항선 도달', premium: true },
                    { id: 3, type: 'HOLD', stock: '네이버', code: '035420', price: 180000, change: '+0.5%', time: '2025-05-27 09:45', strength: '보통', reason: '특별한 변동성 없음', premium: false },
                    { id: 4, type: 'BUY', stock: '카카오', code: '035720', price: 50000, change: '+3.2%', time: '2025-05-27 09:30', strength: '강함', reason: '바닥 다지기 후 매수 시그널 발생', premium: true },
                    { id: 5, type: 'WATCH', stock: '현대차', code: '005380', price: 230000, change: '-0.8%', time: '2025-05-27 09:00', strength: '약함', reason: '추세 전환 가능성 모니터링', premium: false },
                ];
                setSignals(allSignalsData);

                const now = new Date();
                const hour = now.getHours();
                const minute = now.getMinutes();
                const isOpen = hour >= 10 && hour < 16;
                const updatedTime = `${now.toLocaleDateString()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                setMarketStatus({ isOpen, lastUpdated: updatedTime });

                const topStocksResponse = await fetch('http://localhost:8084/F5/stock/daily');
                if (!topStocksResponse.ok) {
                    throw new Error(`HTTP error! status: ${topStocksResponse.status}`);
                }
                const topStocksData = await topStocksResponse.json();

                const sortedTopStocks = topStocksData
                    .filter(stock => stock.stockFluctuation > 0)
                    .sort((a, b) => b.stockFluctuation - a.stockFluctuation)
                    .slice(0, 5)
                    .map((stock, index) => ({
                        ...stock,
                        rank: index + 1,
                        price: stock.closePrice,
                        changeRate: parseFloat(stock.stockFluctuation.toFixed(2)),
                        changeAmount: null,
                        volume: null
                    }));
                setTopStocks(sortedTopStocks);

                const newsResponse = await fetch('http://localhost:8084/F5/news/top5-latest');
                if (!newsResponse.ok) {
                    throw new Error(`HTTP error! status: ${newsResponse.status}`);
                }
                const newsResult = await newsResponse.json();
                
                const processedNewsData = [];
                newsResult.forEach(newsItem => {
                    if (newsItem.stockCodes && newsItem.stockCodes.includes(',')) {
                        const codes = newsItem.stockCodes.split(',');
                        codes.forEach(code => {
                            processedNewsData.push({ ...newsItem, stockCodes: code.trim() });
                        });
                    } else {
                        processedNewsData.push(newsItem);
                    }
                });
                setNewsData(processedNewsData);

            } catch (error) {
                console.error("데이터 로딩 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const selectedAiModel = aiModels.find(model => model.id === selectedModelId);

    const displaySignals = isLoggedIn
        ? signals
        : signals.filter(signal => !signal.premium);

    if (loading) {
        return <p className="loading-message-aphc">AI 종목추천 데이터를 불러오는 중입니다...</p>;
    }

    return (
        <div className="ai-picks-home-content">
            <div className="top-sections-container">
                <section className="market-status-section-aphc">
                    <h2 className="section-title-aphc">실시간 시장 현황</h2>
                    <div className="market-info-aphc">
                        <p className="market-status-text">
                            코스닥 장 상태: {' '}
                            <span className={marketStatus.isOpen ? 'status-open' : 'status-closed'}>
                                <span className={`status-indicator ${marketStatus.isOpen ? 'open' : 'closed'}`}></span>
                                {marketStatus.isOpen ? '개장 중' : '폐장'}
                            </span>
                        </p>
                        <p className="last-updated-text">업데이트: {marketStatus.lastUpdated}</p>
                    </div>
                    <h3 className="sub-section-title-aphc">오늘의 탑 종목 (TOP 5)</h3>
                    <div className="top-stocks-list-aphc">
                        {topStocks.map((stock, index) => (
                            <Link to={`/stock-detail/${stock.stockCode}`} className='stock-link' key={stock.priceId}>
                                <div className="top-stock-item-aphc">
                                    <span className="stock-rank-aphc">{stock.rank}.</span>
                                    <span className="stock-name-aphc">{stock.stockName} ({stock.stockCode})</span>
                                    <span className={`stock-change-rate-aphc ${stock.stockFluctuation > 0 ? 'positive' : stock.stockFluctuation < 0 ? 'negative' : ''}`}>
                                        {stock.stockFluctuation > 0 ? '+' : ''}{(stock.stockFluctuation).toFixed(2)}%
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="ai-summary-section-aphc">
                    <h2 className="section-title-aphc">오늘의 AI 모델 추천</h2>
                    <div className="ai-model-selection-bar-aphc">
                        {aiModels.length > 0 ? (
                            aiModels.map(model => (
                                <div
                                    key={model.id}
                                    className={`model-score-item-aphc ${selectedModelId === model.id ? 'selected-model-aphc' : ''}`}
                                    onClick={() => setSelectedModelId(model.id)}
                                >
                                    <span className="model-name-aphc">{model.name}</span>
                                    <span className="model-score-aphc">{model.score}점</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-model-message-aphc">AI 모델 정보를 불러올 수 없습니다.</p>
                        )}
                    </div>
                    {selectedAiModel ? (
                        <Link to={`/stock-detail/${selectedAiModel.recommendedStock.code}`} className='stock-link'>
                        <div className="selected-ai-recommendation-box-aphc">
                            <h3><span className="top-ai-indicator-aphc">🌟</span> {selectedAiModel.name} 추천 종목</h3>
                            <p className="recommended-stock-name-aphc">
                                <span className="stock-code-tag-aphc">{selectedAiModel.recommendedStock.code}</span> {selectedAiModel.recommendedStock.name}
                            </p>
                            {/* <p className="recommendation-reason-aphc">{selectedAiModel.recommendedStock.reason}</p> */}
                            {/* <p className="ai-comment-aphc">AI 요약: {selectedAiModel.summary}</p> */}
                            {/* 모델 B의 차트 렌더링 */}
                            {selectedAiModel.id === 'modelB' && selectedAiModel.recommendedStock.predictionDays ? (
                                <div className="chart-container-aphc" style={{ maxHeight: '250px' }}>
                                    <Line
                                        data={getChartData(selectedAiModel.recommendedStock.name, selectedAiModel.recommendedStock.predictionDays)}
                                        options={chartOptions(selectedAiModel.recommendedStock.name)}
                                    />
                                    <small className="chart-description">향후 10일간 예측 주가</small>
                                </div>
                            ) : selectedAiModel.id === 'modelB' ? (
                                <p className="no-chart-message">모델 B 예측 차트 데이터를 불러올 수 없습니다.</p>
                            ) : null}
                        </div>
                        </Link>
                    ) : (
                        <div className="selected-ai-recommendation-box-aphc no-recommendation">
                            <p>선택된 AI 모델이 없거나 추천 정보가 없습니다.</p>
                        </div>
                    )}
                </section>
            </div>

            <section className="ai-signal-section-aphc">
                <h2 className="section-title-aphc">AI 매매 신호</h2>
                <p className="signal-page-description-aphc">
                    AI가 분석한 실시간 매매 신호를 제공합니다.
                    {!isLoggedIn && (
                        <span className="login-prompt-aphc">
                            &nbsp;더 많은 프리미엄 신호와 상세 정보를 보려면 <Link to="/login">로그인</Link>하세요!
                        </span>
                    )}
                </p>
                <div className="signal-list-aphc">
                    {displaySignals.slice(0, 3).map(signal => (
                        <div key={signal.id} className={`signal-card-aphc ${signal.type.toLowerCase()}`}>
                            <Link to={`/stock-detail/${signal.code}`} className='stock-link'>
                            <div className="signal-header-aphc">
                                <span className={`signal-type-aphc ${signal.type.toLowerCase()}-text`}>
                                    {signal.type === 'BUY' && '매수'}
                                    {signal.type === 'SELL' && '매도'}
                                    {signal.type === 'HOLD' && '보유'}
                                    {signal.type === 'WATCH' && '관망'}
                                </span>
                                <span className="signal-time-aphc">{signal.time.substring(11, 16)}</span>
                            </div>
                            <div className="stock-info-aphc">
                                <span className="stock-name-aphc">{signal.stock}</span>
                                <span className="stock-code-aphc">({signal.code})</span>
                            </div>
                            <div className="price-info-aphc">
                                <span className="current-price-aphc">{signal.price.toLocaleString()}원</span>
                                <span className={`change-aphc ${parseFloat(signal.change) > 0 ? 'positive' : 'negative'}`}>
                                    {signal.change}
                                </span>
                            </div>
                            </Link>
                            {!isLoggedIn && signal.premium && (
                                <div className="premium-overlay-aphc">
                                    <p>로그인 후 상세 정보 확인</p>
                                    <button onClick={() => window.location.href = '/login'}>로그인하기</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AiPicksHomeContent;
