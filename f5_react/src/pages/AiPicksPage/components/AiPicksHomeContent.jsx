// src/pages/AiPicksPage/AiPicksHomeContent.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const MarketStatusAndTopStocks = ({ marketStatus, topStocks, isLoading, error }) => (
    <section className="market-status-section-aphc">
        <h2 className="section-title-aphc">실시간 시장 현황</h2>
        {isLoading ? (
            <p className="loading-message-section">시장 데이터를 불러오는 중입니다...</p>
        ) : error ? (
            <p className="error-message-section">시장 현황 데이터를 불러오는 데 실패했습니다: {error}</p>
        ) : (
            <>
                <div className="market-info-aphc">
                    <p className="market-status-text">
                        코스닥 장 상태:{' '}
                        <span className={marketStatus.isOpen ? 'status-open' : 'status-closed'}>
                            <span className={`status-indicator ${marketStatus.isOpen ? 'open' : 'closed'}`}></span>
                            {marketStatus.isOpen ? '개장 중' : '폐장'}
                        </span>
                    </p>
                    <p className="last-updated-text">업데이트: {marketStatus.lastUpdated}</p>
                </div>
                <h3 className="sub-section-title-aphc">오늘의 탑 종목 (TOP 5)</h3>
                <div className="top-stocks-list-aphc">
                    {topStocks.length > 0 ? (
                        topStocks.map((stock) => (
                            <Link to={`/stock-detail/${stock.stockCode}`} className='stock-link' key={stock.priceId || stock.stockCode}>
                                <div className="top-stock-item-aphc">
                                    <span className="stock-rank-aphc">{stock.rank}.</span>
                                    <span className="stock-name-aphc">{stock.stockName} ({stock.stockCode})</span>
                                    <span className={`stock-change-rate-aphc ${stock.stockFluctuation > 0 ? 'positive' : stock.stockFluctuation < 0 ? 'negative' : ''}`}>
                                        {stock.stockFluctuation > 0 ? '+' : ''}{(stock.stockFluctuation ?? 0).toFixed(2)}%
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="no-data-message">탑 종목 데이터가 없습니다.</p>
                    )}
                </div>
            </>
        )}
    </section>
);

const AiTradingSignals = ({ signals, isLoggedIn, isLoading, error }) => {
    const displaySignals = useMemo(() => isLoggedIn
        ? signals
        : signals.filter(signal => !signal.premium),
        [signals, isLoggedIn]
    );

    return (
        <section className="ai-signal-section-aphc">
            <h2 className="section-title-aphc">AI 매매 신호</h2>
            {isLoading ? (
                <p className="loading-message-section">매매 신호를 불러오는 중입니다...</p>
            ) : error ? (
                <p className="error-message-section">매매 신호를 불러오는 데 실패했습니다: {error}</p>
            ) : (
                <>
                    <p className="signal-page-description-aphc">
                        AI가 분석한 실시간 매매 신호를 제공합니다.
                        {!isLoggedIn && (
                            <span className="login-prompt-aphc">
                                &nbsp;더 많은 프리미엄 신호와 상세 정보를 보려면 <Link to="/login">로그인</Link>하세요!
                            </span>
                        )}
                    </p>
                    <div className="signal-list-aphc">
                        {displaySignals.slice(0, 3).length > 0 ? (
                            displaySignals.slice(0, 3).map(signal => (
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
                            ))
                        ) : (
                            <p className="no-data-message">표시할 AI 매매 신호가 없습니다.</p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};

const AiModelRecommendation = ({ aiModels, selectedModelId, setSelectedModelId, isLoading, error }) => {
    const selectedAiModel = useMemo(() => aiModels.find(model => model.id === selectedModelId), [aiModels, selectedModelId]);

    const chartLabels = useMemo(() => [
        '1일차', '2일차', '3일차', '4일차', '5일차',
        '6일차', '7일차', '8일차', '9일차', '10일차'
    ], []);

    const getChartData = useCallback((stockName, predictionDays) => {
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
    }, [chartLabels]);

    const chartOptions = useCallback((stockName) => ({
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
                grid: { display: false },
                ticks: {
                    display: false,
                    autoSkip: true, maxTicksLimit: 2, font: { size: 8 }
                },
                title: { display: false }
            },
            y: {
                display: true,
                position: 'right',
                grid: { display: false },
                ticks: {
                    display: true,
                    callback: function(value) { return value.toLocaleString('ko-KR'); },
                    maxTicksLimit: 3, font: { size: 8 }, padding: 2
                },
                title: { display: false }
            }
        },
        layout: {
            padding: { left: 0, right: 5, top: 0, bottom: 0 }
        }
    }), []);

    return (
        <section className="ai-summary-section-aphc">
            <h2 className="section-title-aphc">오늘의 AI 모델 추천</h2>
            {isLoading ? (
                <p className="loading-message-section">AI 모델 정보를 불러오는 중입니다...</p>
            ) : error ? (
                <p className="error-message-section">AI 모델 정보를 불러오는 데 실패했습니다: {error}</p>
            ) : (
                <>
                    <div className="ai-model-selection-bar-aphc">
                        {aiModels.length > 0 ? (
                            aiModels.map(model => (
                                <div
                                    key={model.id}
                                    className={`model-score-item-aphc ${selectedModelId === model.id ? 'selected-model-aphc' : ''}`}
                                    onClick={() => setSelectedModelId(model.id)}
                                >
                                    <span className="model-name-aphc">{model.name}</span>
                                    {model.id === 'modelB' ? (
                                        <span className="model-score-aphc">{model.score > 0 ? '+' : ''}{model.score.toFixed(2)}%</span>
                                    ) : (
                                        <span className="model-score-aphc">{model.score}점</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-data-message">AI 모델 정보를 불러올 수 없습니다.</p>
                        )}
                    </div>

                    {selectedAiModel ? (
                        <Link to={`/stock-detail/${selectedAiModel.recommendedStock.code}`} className='stock-link'>
                            <div className="selected-ai-recommendation-box-aphc">
                                <h3><span className="top-ai-indicator-aphc">🌟</span> {selectedAiModel.name} 추천 종목</h3>
                                <p className="recommended-stock-name-aphc">
                                    <span className="stock-code-tag-aphc">{selectedAiModel.recommendedStock.code}</span> {selectedAiModel.recommendedStock.name}
                                </p>
                                <p className="recommendation-reason-aphc">{selectedAiModel.recommendedStock.reason}</p>
                                {/* AI 요약 문구 삭제 */}
                                {/* <p className="ai-comment-aphc">AI 요약: {selectedAiModel.summary}</p> */}

                                {selectedAiModel.id === 'modelB' && selectedAiModel.recommendedStock.predictionDays &&
                                   getChartData(selectedAiModel.recommendedStock.name, selectedAiModel.recommendedStock.predictionDays).datasets[0].data.length > 0 ? (
                                        <div className="chart-container-aphc">
                                            <Line
                                                data={getChartData(selectedAiModel.recommendedStock.name, selectedAiModel.recommendedStock.predictionDays)}
                                                options={chartOptions(selectedAiModel.recommendedStock.name)}
                                            />
                                            <small className="chart-description">향후 10일간 예측 주가 (원)</small>
                                        </div>
                                    ) : selectedAiModel.id === 'modelB' ? (
                                        <p className="no-chart-message">모델 B 예측 차트 데이터를 불러올 수 없습니다.</p>
                                    ) : null}
                            </div>
                        </Link>
                    ) : (
                        <div className="selected-ai-recommendation-box-aphc no-recommendation">
                            <p>선택된 AI 모델이 없거나 추천 정보가 없습니다. 다른 모델을 선택해 보세요.</p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};


const AiPicksHomeContent = () => {
    const [marketDataLoading, setMarketDataLoading] = useState(true);
    const [marketDataError, setMarketDataError] = useState(null);
    const [aiModelLoading, setAiModelLoading] = useState(true);
    const [aiModelError, setAiModelError] = useState(null);
    const [signalLoading, setSignalLoading] = useState(true);
    const [signalError, setSignalError] = useState(null);

    const [marketStatus, setMarketStatus] = useState({ isOpen: false, lastUpdated: '' });
    const [topStocks, setTopStocks] = useState([]);
    const [aiModels, setAiModels] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setMarketDataLoading(true);
            try {
                const now = new Date();
                const hour = now.getHours();
                const minute = now.getMinutes();
                const isOpen = hour >= 10 && hour < 16;
                const updatedTime = `${now.toLocaleDateString()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                setMarketStatus({ isOpen, lastUpdated: updatedTime });

                const topStocksResponse = await axios.get('http://localhost:8084/F5/stock/daily');
                const topStocksData = topStocksResponse.data;

                const sortedTopStocks = topStocksData
                    .filter(stock => (stock.stockFluctuation ?? 0) > 0)
                    .sort((a, b) => (b.stockFluctuation ?? 0) - (a.stockFluctuation ?? 0))
                    .slice(0, 5)
                    .map((stock, index) => ({
                        ...stock,
                        rank: index + 1,
                        priceId: stock.stockCode,
                        price: stock.closePrice,
                        changeRate: parseFloat((stock.stockFluctuation ?? 0).toFixed(2)),
                        changeAmount: null,
                        volume: null
                    }));
                setTopStocks(sortedTopStocks);
                setMarketDataError(null);
            } catch (error) {
                console.error("시장 현황 및 탑 종목 데이터 로딩 중 오류 발생:", error);
                setMarketDataError('시장 데이터를 불러오는 데 실패했습니다.');
                setTopStocks([]);
            } finally {
                setMarketDataLoading(false);
            }

            setAiModelLoading(true);
            try {
                const newAiModels = [];
                const newsApiResponse = await axios.get('http://localhost:8084/F5/news/top5-latest');
                if (newsApiResponse.data && newsApiResponse.data.length > 0) {
                    const firstNews = newsApiResponse.data[0];
                    newAiModels.push({
                        id: 'modelA',
                        name: '뉴스 AI 모델',
                        score: firstNews.newsAnalysisScore ? Math.round(firstNews.newsAnalysisScore * 100) : 90,
                        summary: firstNews.newsSummary || '최신 뉴스 데이터를 기반으로 시장 흐름을 분석하여 추천합니다.',
                        recommendedStock: {
                            code: firstNews.stockCode || 'N/A',
                            name: firstNews.newsTitle || '뉴스 제목 없음',
                            reason: firstNews.newsSummary || '뉴스 요약 없음'
                        }
                    });
                }

                const predictionResponse = await axios.get('http://localhost:8084/F5/predictions/latest-per-stock');
                console.log("Prediction API 응답 상태:", predictionResponse.status);
                console.log("Prediction API 응답 데이터:", predictionResponse.data);

                if (predictionResponse.status === 200 && predictionResponse.data && predictionResponse.data.length > 0) {
                    let bestPrediction = null;
                    let maxFluctuation = -Infinity;

                    predictionResponse.data.forEach(prediction => {
                        const predictionDays = prediction.predictionDays;
                        // 1일차 대비 10일차 예측 수익률 계산
                        if (predictionDays && typeof predictionDays.firstDay === 'number' && typeof predictionDays.tenthDay === 'number' && predictionDays.firstDay !== 0) {
                            const firstDayPrice = predictionDays.firstDay;
                            const tenthDayPrice = predictionDays.tenthDay;
                            const currentFluctuation = ((tenthDayPrice - firstDayPrice) / firstDayPrice) * 100;

                            if (currentFluctuation > maxFluctuation) {
                                maxFluctuation = currentFluctuation;
                                bestPrediction = prediction;
                            }
                        }
                    });

                    if (bestPrediction) {
                        console.log("선택된 최고 예측 종목 (10일 등락율 기준):", bestPrediction);

                        const predictionDays = bestPrediction.predictionDays;
                        let displayedFluctuationRate = maxFluctuation.toFixed(2);
                        
                        // 'reason' 문구에서 불필요한 부분 제거 및 간결화
                        let predictionReason = `1일차 예상 가격 ${predictionDays.firstDay.toLocaleString()}원. 10일차 예상 가격 ${predictionDays.tenthDay.toLocaleString()}원. 등락율 ${ displayedFluctuationRate}% 예상.`;
                        
                        newAiModels.push({
                            id: 'modelB',
                            name: '예측 AI 모델',
                            score: parseFloat(displayedFluctuationRate),
                            // AI 요약 문구 제거
                            summary: '', // summary를 빈 문자열로 설정하여 AI 요약 표시 안 함
                            recommendedStock: {
                                code: bestPrediction.stockCode || 'N/A',
                                name: bestPrediction.stockName || '종목명 없음',
                                reason: predictionReason,
                                predictionDays: predictionDays
                            }
                        });
                    } else {
                        console.log("유효한 1일차 및 10일차 예측 가격을 가진 종목이 없어 모델 B 추천을 생성할 수 없습니다.");
                    }
                } else if (predictionResponse.status === 204) {
                    console.log('새로운 AI 예측 데이터 없음 (204 No Content).');
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
                setAiModelError(null);
            } catch (error) {
                console.error("AI 모델 추천 데이터 로딩 중 오류 발생:", error);
                setAiModelError('AI 모델 데이터를 불러오는 데 실패했습니다.');
                setAiModels([]);
            } finally {
                setAiModelLoading(false);
            }

            setSignalLoading(true);
            try {
                const allSignalsData = [
                    { id: 1, type: 'BUY', stock: '삼성전자', code: '005930', price: 82000, change: '+2.5%', time: '2025-05-27 10:30', strength: '매우 강함', reason: '강력한 거래량 동반 이동평균선 돌파', premium: true },
                    { id: 2, type: 'SELL', stock: 'SK하이닉스', code: '000660', price: 195000, change: '-1.0%', time: '2025-05-27 10:00', strength: '중간', reason: '단기 과열 및 저항선 도달', premium: true },
                    { id: 3, type: 'HOLD', stock: '네이버', code: '035420', price: 180000, change: '+0.5%', time: '2025-05-27 09:45', strength: '보통', reason: '특별한 변동성 없음', premium: false },
                    { id: 4, type: 'BUY', stock: '카카오', code: '035720', price: 50000, change: '+3.2%', time: '2025-05-27 09:30', strength: '강함', reason: '바닥 다지기 후 매수 시그널 발생', premium: true },
                    { id: 5, type: 'WATCH', stock: '현대차', code: '005380', price: 230000, change: '-0.8%', time: '2025-05-27 09:00', strength: '약함', reason: '추세 전환 가능성 모니터링', premium: false },
                ];
                setSignals(allSignalsData);
                setSignalError(null);
            } catch (error) {
                console.error("AI 매매 신호 데이터 로딩 중 오류 발생:", error);
                setSignalError('매매 신호 데이터를 불러오는 데 실패했습니다.');
                setSignals([]);
            } finally {
                setSignalLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return (
        <div className="ai-picks-home-content">
            <div className="top-sections-container">
                <MarketStatusAndTopStocks
                    marketStatus={marketStatus}
                    topStocks={topStocks}
                    isLoading={marketDataLoading}
                    error={marketDataError}
                />

                <AiModelRecommendation
                    aiModels={aiModels}
                    selectedModelId={selectedModelId}
                    setSelectedModelId={setSelectedModelId}
                    isLoading={aiModelLoading}
                    error={aiModelError}
                />
            </div>

            {/* <AiTradingSignals
                signals={signals}
                isLoggedIn={isLoggedIn}
                isLoading={signalLoading}
                error={signalError}
            /> */}
        </div>
    );
};

export default AiPicksHomeContent;