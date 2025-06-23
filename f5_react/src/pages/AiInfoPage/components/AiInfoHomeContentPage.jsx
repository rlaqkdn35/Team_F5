import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiInfoHomeContentPage.css';
import StockRankings from '../../../components/common/StockRankings/StockRankings.jsx';
import MarketInfoCard from '../../../components/common/MarketInfoCard/MarketInfoCard.jsx';
import Slider from '../../../components/common/Slider/Slider.jsx';
import BubbleChart from '../../../components/charts/BubbleChart/BubbleChart.jsx';
import axios from 'axios';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx';

const initialMarketData = { name: '', value: '0.00', change: '0.00 (0.00%)', changeType: 'positive', chartData: [] };

const AiInfoHomeContentPage = () => {
    const [bubbleData, setBubbleData] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [kospiCurrentData, setKospiCurrentData] = useState(initialMarketData);
    const [kosdaqCurrentData, setKosdaqCurrentData] = useState(initialMarketData);
    const [marketDataLoading, setMarketDataLoading] = useState(true);
    const [marketDataError, setMarketDataError] = useState(null);

    const [aiRecommendedStocks, setAiRecommendedStocks] = useState([]);
    const [aiStocksLoading, setAiStocksLoading] = useState(true);
    const [aiStocksError, setAiStocksError] = useState(null);

    // 시장 지수 데이터 가져오기 (기존 로직 유지)
    useEffect(() => {
        const fetchMarketData = async () => {
            setMarketDataLoading(true);
            try {
                const response = await axios.get(`http://localhost:8084/F5/index/daily/recent`);
                console.log("시장 데이터 (전체):", response.data);

                const { KOSPI, KOSDAQ } = response.data;

                const aggregateDailyData = (dataArray) => {
                    if (!dataArray || dataArray.length === 0) return [];
                    
                    dataArray.sort((a, b) => {
                        const dateA = new Date(a.date + 'T' + a.createdAt.split('T')[1].split('+')[0]);
                        const dateB = new Date(b.date + 'T' + b.createdAt.split('T')[1].split('+')[0]);
                        return dateA.getTime() - dateB.getTime();
                    });

                    const dailyLatestDataMap = new Map();
                    dataArray.forEach(item => {
                        const dateKey = item.date;
                        const currentTime = new Date(item.createdAt).getTime();
                        const existingItem = dailyLatestDataMap.get(dateKey);

                        if (!existingItem || currentTime > new Date(existingItem.createdAt).getTime()) {
                            dailyLatestDataMap.set(dateKey, item);
                        }
                    });
                    return Array.from(dailyLatestDataMap.values())
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                };

                const aggregatedKospiData = aggregateDailyData(KOSPI);
                const aggregatedKosdaqData = aggregateDailyData(KOSDAQ);

                const getLatestValueAndChange = (aggregatedData, rawData) => {
                    let latestValue = 0;
                    let changeValue = 0;
                    let changeRate = 0;
                    let changeType = 'neutral';

                    const now = new Date();
                    const todayStr = now.toISOString().slice(0, 10);
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().slice(0, 10);
                    
                    const todayRawDataPoints = rawData.filter(item => item.date === todayStr);
                    const latestTodayRawItem = todayRawDataPoints.length > 0 
                                                                    ? todayRawDataPoints[todayRawDataPoints.length - 1]
                                                                    : null;
                    latestValue = latestTodayRawItem ? latestTodayRawItem.averagePrice : 0;

                    const prevDayLatestAggregatedItem = aggregatedData.find(item => item.date === yesterdayStr);
                    const prevDayLastValue = prevDayLatestAggregatedItem ? prevDayLatestAggregatedItem.averagePrice : null;

                    if (latestValue && prevDayLastValue !== null) {
                        changeValue = latestValue - prevDayLastValue;
                        changeRate = (changeValue / prevDayLastValue) * 100;
                        changeType = changeValue >= 0 ? 'positive' : 'negative';
                    } else if (latestValue && todayRawDataPoints.length > 1) { 
                        const firstTodayRawValue = todayRawDataPoints[0].averagePrice;
                        changeValue = latestValue - firstTodayRawValue;
                        changeRate = (changeValue / firstTodayRawValue) * 100;
                        changeType = changeValue >= 0 ? 'positive' : 'negative';
                    }

                    return { latestValue, changeValue, changeRate, changeType };
                };

                const { 
                    latestValue: kospiLatestValue, 
                    changeValue: kospiChangeValue, 
                    changeRate: kospiChangeRate, 
                    changeType: kospiChangeType 
                } = getLatestValueAndChange(aggregatedKospiData, KOSPI);

                setKospiCurrentData({
                    name: '코스피',
                    value: kospiLatestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    change: `${kospiChangeValue >= 0 ? '+' : ''}${kospiChangeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${kospiChangeRate.toFixed(2)}%)`,
                    changeType: kospiChangeType,
                    chartData: aggregatedKospiData.filter(item => {
                        const itemDate = new Date(item.date);
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        oneMonthAgo.setHours(0,0,0,0);
                        return itemDate.getTime() >= oneMonthAgo.getTime();
                    }).map(item => ({
                        time: item.date,
                        value: item.averagePrice
                    })),
                });

                const { 
                    latestValue: kosdaqLatestValue, 
                    changeValue: kosdaqChangeValue, 
                    changeRate: kosdaqChangeRate, 
                    changeType: kosdaqChangeType 
                } = getLatestValueAndChange(aggregatedKosdaqData, KOSDAQ);

                setKosdaqCurrentData({
                    name: '코스닥',
                    value: kosdaqLatestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    change: `${kosdaqChangeValue >= 0 ? '+' : ''}${kosdaqChangeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${kosdaqChangeRate.toFixed(2)}%)`,
                    changeType: kosdaqChangeType,
                    chartData: aggregatedKosdaqData.filter(item => {
                        const itemDate = new Date(item.date);
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        oneMonthAgo.setHours(0,0,0,0);
                        return itemDate.getTime() >= oneMonthAgo.getTime();
                    }).map(item => ({
                        time: item.date,
                        value: item.averagePrice
                    })),
                });
                setMarketDataError(null);
            } catch (err) {
                console.error('시장 지수 데이터를 가져오는 중 오류 발생:', err);
                setMarketDataError('시장 지수 데이터를 불러오지 못했습니다.');
                setKospiCurrentData(initialMarketData);
                setKosdaqCurrentData(initialMarketData);
            } finally {
                setMarketDataLoading(false);
            }
        };

        fetchMarketData();
    }, []);

    // API 호출로 버블 데이터 가져오기 (기존 로직 유지)
    useEffect(() => {
        const fetchBubbleData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8084/F5/keyword/top-with-news?minMentionedCount=2&limitNewsPerKeyword=5`);
                console.log("버블 데이터 (KeywordDTO):", response.data);

                const transformedData = response.data.map((item, index) => ({
                    id: item.keyword_Name + '-' + index,
                    text: item.keyword_Name,
                    value: item.total_count,
                    numArticlesMentionedIn: item.numArticlesMentionedIn,
                    news: item.relatedNews || [],
                }));
                
                setBubbleData(transformedData);
                setError(null);

                if (transformedData.length > 0) {
                    const largestBubble = transformedData.reduce((prev, current) => 
                        (prev.value > current.value) ? prev : current
                    );
                    handleBubbleClick(largestBubble);
                }
            } catch (error) {
                console.error('버블 데이터를 가져오는 중 오류 발생:', error.message);
                setError('데이터를 불러오지 못했습니다. 서버를 확인하세요.');
                setBubbleData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBubbleData();
    }, []);

    // AI 추천 종목 데이터 가져오기 및 가공 로직 (RecommendedStockCard 없이 직접 렌더링)
    useEffect(() => {
        const fetchAiRecommendedStocks = async () => {
            setAiStocksLoading(true);
            try {
                const response = await axios.get(`http://localhost:8084/F5/predictions/latest-per-stock`);
                console.log("AI 추천 종목 API 응답 (PredictionDto 리스트):", response.data);

                const transformedStocks = response.data.map(prediction => {
                    const predictionDays = prediction.predictionDays;

                    if (!predictionDays || predictionDays.firstDay === undefined || predictionDays.tenthDay === undefined) {
                        console.warn(`종목 ${prediction.stockName} (${prediction.stockCode})에 1일차 또는 10일차 예측 데이터가 없습니다. 이 종목은 제외됩니다.`);
                        return null;
                    }

                    const firstDayPrice = predictionDays.firstDay;
                    const tenthDayPrice = predictionDays.tenthDay; 
                    
                    const currentPrice = firstDayPrice; 
                    const changeValue = tenthDayPrice - firstDayPrice;
                    
                    let changeRate = 0;
                    if (firstDayPrice !== 0) { 
                        changeRate = (changeValue / firstDayPrice) * 100;
                    }
                    
                    const changeType = changeValue >= 0 ? 'positive' : 'negative';

                    // prediction.createdAt을 기준으로 날짜 계산
                    const predictionBaseDate = new Date(prediction.createdAt);
                    const chartData = [
                        { day: 1, value: predictionDays.firstDay },
                        { day: 2, value: predictionDays.secondDay },
                        { day: 3, value: predictionDays.thirdDay },
                        { day: 4, value: predictionDays.fourthDay },
                        { day: 5, value: predictionDays.fifthDay },
                        { day: 6, value: predictionDays.sixthDay },
                        { day: 7, value: predictionDays.seventhDay },
                        { day: 8, value: predictionDays.eighthDay },
                        { day: 9, value: predictionDays.ninthDay },
                        { day: 10, value: predictionDays.tenthDay },
                    ].filter(item => item.value !== undefined) // undefined 값 필터링
                    .map(item => {
                        const date = new Date(predictionBaseDate);
                        date.setDate(predictionBaseDate.getDate() + item.day); // 예측 생성일 + 예측 일수
                        
                        // YYYY-MM-DD 형식으로 포맷
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;

                        return {
                            time: formattedDate,
                            value: item.value
                        };
                    });

                    return {
                        name: prediction.stockName,
                        code: prediction.stockCode,
                        currentPrice: currentPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
                        change: `${changeValue >= 0 ? '+' : ''}${changeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        changeRate: `${changeRate >= 0 ? '+' : ''}${changeRate.toFixed(2)}%`,
                        changeType: changeType,
                        reason: prediction.reason || 'AI 예측 기반 추천 종목입니다.',
                        chartData: chartData,
                        rawChangeRate: changeRate
                    };
                })
                .filter(stock => stock !== null)
                .sort((a, b) => b.rawChangeRate - a.rawChangeRate);

                setAiRecommendedStocks(transformedStocks.slice(0, 5));
                setAiStocksError(null);

            } catch (err) {
                console.error('AI 추천 종목 데이터를 가져오는 중 오류 발생:', err);
                setAiStocksError('AI 추천 종목을 불러오지 못했습니다.');
                setAiRecommendedStocks([]);
            } finally {
                setAiStocksLoading(false);
            }
        };

        fetchAiRecommendedStocks();
    }, []);

    // 뉴스 탭 (선택된 뉴스 내용) 상태 및 핸들러 (기존 로직 유지)
    const [activeNewsTab, setActiveNewsTab] = useState(null);
    const [selectedNewsUrl, setSelectedNewsUrl] = useState('');
    const [selectedNewsTitle, setSelectedNewsTitle] = useState('');

    const handleBubbleClick = useCallback((bubble) => {
        setSelectedKeyword(bubble);
        setDetailData({
            keyword_Name: bubble.text,
            total_count: bubble.value,
            numArticlesMentionedIn: bubble.numArticlesMentionedIn,
            relatedNews: bubble.news || [],
        });
        setSelectedNewsUrl('');
        setSelectedNewsTitle('');
        setActiveNewsTab(null);
    }, []);

    const handleNewsClick = useCallback((newsItem) => {
        navigate(`/news/${newsItem.newsIdx}`);
    }, [navigate]);

    const handleNavigateToIssueNews = useCallback(() => {
        navigate('/ai-info/issue-analysis');
    }, [navigate]);

    const handleNavigateToAirecommend = useCallback(() => {
        navigate('/ai-picks');
    }, [navigate]);


    return (
        <div className="ai-info-home-dashboard">
            {/* 왼쪽 컬럼 컨테이너: 국내 주요 지수 섹션 (변경 없음) */}
            <div className="left-column-container">
                <section className="market-overview-section">
                    <h2 className="section-title">국내 주요 지수</h2>
                    <div className="market-summary-container">
                        {marketDataLoading ? (
                            <p>시장 지수 로딩 중...</p>
                        ) : marketDataError ? (
                            <p className="error-message">{marketDataError}</p>
                        ) : (
                            <>
                                <MarketInfoCard
                                    marketData={kospiCurrentData}
                                    chartNode={<StockChart
                                        data={kospiCurrentData.chartData}
                                        chartOptions={{
                                            timeUnit: 'daily',
                                            height: 200,
                                        }}/>}
                                />
                                <MarketInfoCard
                                    marketData={kosdaqCurrentData}
                                    chartNode={<StockChart
                                        data={kosdaqCurrentData.chartData}
                                        chartOptions={{
                                            timeUnit: 'daily',
                                            height: 200,
                                        }}/>}
                                />
                            </>
                        )}
                    </div>
                </section>
                {/* 주요 종목 랭킹 섹션 (주석 처리된 부분 유지) */}
            </div>

            {/* AI 추천 종목 섹션 (RecommendedStockCard 없이 직접 렌더링) */}
            <section className="ai-recommendation-section">
                <h2 className="section-title">AI 추천 종목</h2>
                {aiStocksLoading ? (
                    <p>AI 추천 종목 로딩 중...</p>
                ) : aiStocksError ? (
                    <p className="error-message">{aiStocksError}</p>
                ) : aiRecommendedStocks.length > 0 ? (
                    <Slider
                        slidesToShow={1}
                        slidesToScroll={1}
                        autoPlay={true}
                        autoPlayInterval={7000}
                        showDots={true}
                        showArrows={true}
                    >
                        {/* RecommendedStockCard 대신 종목 정보를 직접 렌더링 */}
                        {aiRecommendedStocks.map((stock) => (
                            // 이 div는 RecommendedStockCard의 역할을 대신합니다.
                            // 필요에 따라 'recommended-stock-card-inline' 클래스에 스타일을 추가해주세요.
                            <div key={stock.code} className="recommended-stock-card-inline">
                                <div className="stock-header">
                                    <span className="stock-name">{stock.name}</span>
                                    <span className="stock-code">{stock.code}</span>
                                </div>
                                <div className="stock-price-info">
                                    <span className="current-price">{stock.currentPrice} 원</span>
                                    <span className={`change-value ${stock.changeType}`}>
                                        {stock.change} ({stock.changeRate})
                                    </span>
                                </div>
                                <div className="stock-chart">
                                    <StockChart 
                                        data={stock.chartData} 
                                        chartOptions={{ 
                                            timeUnit: 'daily', 
                                            height: 200 
                                        }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p>AI 추천 종목 데이터가 없습니다.</p>
                )}
                <div className="actions-footer">
                    <button onClick={handleNavigateToAirecommend} className="view-more-button">
                        AI추천 보러가기
                    </button>
                </div>
            </section>

            {/* AI 이슈분석 섹션 (변경 없음) */}
            <section className="keyword-analysis-section">
                <h2 className="section-title">AI 이슈분석</h2>
                <div className="content-wrapper">
                    <div className="bubble-chart-area">
                        <h3>주요 키워드 분포</h3>
                        {loading ? (
                            <p>버블 차트 로딩 중...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : bubbleData.length > 0 ? (
                            <BubbleChart
                                data={bubbleData}
                                onBubbleClick={handleBubbleClick}
                                activeBubbleId={selectedKeyword ? selectedKeyword.id : null}
                                width={700}
                                height={600}
                            />
                        ) : (
                            <p>표시할 키워드 데이터가 없습니다.</p>
                        )}
                    </div>

                    {selectedKeyword && detailData ? (
                        <aside className="details-pane visible">
                            <h3><span className="keyword-highlight">{detailData.keyword_Name}</span> </h3>
                            <div className="detail-item"><strong>언급 빈도수:</strong> {detailData.total_count}</div>
                            <div className="detail-item"><strong>언급된 기사 수 :</strong> {detailData.numArticlesMentionedIn}</div>
                            
                            <div className="detail-item news-list-container">
                                <strong>관련 뉴스:</strong>
                                {detailData.relatedNews.length > 0 ? (
                                    <div className="news-cards-wrapper">
                                        {detailData.relatedNews.map((newsItem) => (
                                            <div
                                                key={newsItem.newsIdx}
                                                className="news-card-item"
                                                onClick={() => handleNewsClick(newsItem)}
                                                title={newsItem.newsTitle}
                                            >
                                                <div className="news-content-area">
                                                    <p className="news-card-title">{newsItem.newsTitle}</p>
                                                    <span className="news-card-press">{newsItem.pressName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-news-message">관련 뉴스가 없습니다.</p>
                                )}
                            </div>
                        </aside>
                    ) : (
                        <aside className="details-pane">
                            <p className="details-pane-placeholder">버블을 클릭하면 상세 정보가 표시됩니다.</p>
                        </aside>
                    )}
                </div>
                <div className="actions-footer">
                    <button onClick={handleNavigateToIssueNews} className="view-more-button">
                        관련 이슈 및 뉴스 더보기
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AiInfoHomeContentPage;