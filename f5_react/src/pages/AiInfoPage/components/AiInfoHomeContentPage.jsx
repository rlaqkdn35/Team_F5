import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiInfoHomeContentPage.css';
import StockRankings from '../../../components/common/StockRankings/StockRankings.jsx';
import MarketInfoCard from '../../../components/common/MarketInfoCard/MarketInfoCard.jsx';
import Slider from '../../../components/common/Slider/Slider.jsx';
import RecommendedStockCard from '../../../components/common/RecommendedStockCard/RecommendedStockCard.jsx';
import BubbleChart from '../../../components/charts/BubbleChart/BubbleChart.jsx';
import axios from 'axios';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx';

const initialMarketData = { name: '', value: '0.00', change: '0.00 (0.00%)', changeType: 'positive', chartData: [] };

// AI 추천 종목 데이터는 이제 백엔드에서 가져올 것이므로 임시 데이터는 삭제합니다.
// const aiRecommendedStocks = [...]

const AiInfoHomeContentPage = () => {
    const [bubbleData, setBubbleData] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState(null);
    const [detailData, setDetailData] = useState(null); // 이제 KeywordDTO 전체를 detailData로 사용
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [kospiCurrentData, setKospiCurrentData] = useState(initialMarketData);
    const [kosdaqCurrentData, setKosdaqCurrentData] = useState(initialMarketData);
    const [marketDataLoading, setMarketDataLoading] = useState(true);
    const [marketDataError, setMarketDataError] = useState(null);

    // AI 추천 종목을 위한 새로운 상태
    const [aiRecommendedStocks, setAiRecommendedStocks] = useState([]);
    const [aiStocksLoading, setAiStocksLoading] = useState(true);
    const [aiStocksError, setAiStocksError] = useState(null);

    // 시장 지수 데이터 가져오기
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

    // API 호출로 버블 데이터 가져오기 (변경된 엔드포인트 사용)
    useEffect(() => {
        const fetchBubbleData = async () => {
            setLoading(true);
            try {
                // 백엔드 API의 새로운 엔드포인트와 파라미터 사용
                // minMentionedCount는 3, limitNewsPerKeyword는 5로 고정
                const response = await axios.get(`http://localhost:8084/F5/keyword/top-with-news?minMentionedCount=2&limitNewsPerKeyword=5`);
                console.log("버블 데이터 (KeywordDTO):", response.data);

                // API 응답 (List<KeywordDTO>)를 BubbleChart가 기대하는 형식으로 변환
                const transformedData = response.data.map((item, index) => ({
                    // BubbleChart의 data prop 형식에 맞춰 매핑
                    id: item.keyword_Name + '-' + index, // 고유 ID 생성 (키워드 이름 + 인덱스)
                    text: item.keyword_Name,
                    value: item.total_count, // 언급 빈도수 (버블 크기)
                    numArticlesMentionedIn: item.numArticlesMentionedIn, // 기사 수
                    news: item.relatedNews || [], // 연관 뉴스 리스트
                }));
                
                setBubbleData(transformedData);
                setError(null);

                                // ⭐ 추가: 버블 데이터 로드 후 가장 큰 버블을 자동으로 선택
                if (transformedData.length > 0) {
                    const largestBubble = transformedData.reduce((prev, current) => 
                        (prev.value > current.value) ? prev : current
                    );
                    handleBubbleClick(largestBubble); // 가장 큰 버블 선택
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

    // AI 추천 종목 데이터 가져오기 (새로운 useEffect)
    useEffect(() => {
        const fetchAiRecommendedStocks = async () => {
            setAiStocksLoading(true);
            try {
                const response = await axios.get(`http://localhost:8084/F5/news/top5-with-details`);
                console.log("AI 추천 종목 API 응답 (원본):", response.data);

                const uniqueStocks = new Map();

                response.data.forEach(newsItem => {
                    newsItem.relatedStocks.forEach(stock => {
                        // 중복 종목을 피하고 최신 정보만 사용 (혹은 첫 번째 등장 종목)
                        if (!uniqueStocks.has(stock.stockCode)) {
                            let currentPrice = 'N/A';
                            let change = 'N/A';
                            let changeRate = 'N/A';
                            let changeType = 'neutral';
                            let chartData = [];

                            if (stock.stockPrices && stock.stockPrices.length > 0) {
                                // 가장 최근 데이터 (배열의 첫 번째)
                                const latestPriceData = stock.stockPrices[0]; 
                                currentPrice = latestPriceData.closePrice;
                                const fluctuation = latestPriceData.stockFluctuation; // 등락 값

                                change = fluctuation;
                                changeType = fluctuation >= 0 ? 'positive' : 'negative';

                                // 등락률 계산: 이전 종가가 필요
                                let previousClosePrice = null;
                                if (stock.stockPrices.length > 1) {
                                    // 두 번째 데이터 포인트가 이전 가격이라고 가정 (가장 최근 이전)
                                    // 하지만 `stockFluctuation`이 이미 최신 가격 대비 변화량을 나타낼 가능성이 높으므로
                                    // `currentPrice - fluctuation`을 이전 가격으로 간주하여 비율 계산
                                    previousClosePrice = currentPrice - fluctuation;
                                }

                                if (previousClosePrice !== null && previousClosePrice !== 0) {
                                    changeRate = (fluctuation / previousClosePrice) * 100;
                                } else if (fluctuation !== 0 && currentPrice !== 0) {
                                    // 이전 가격 정보가 없지만 현재 가격과 변동폭이 있다면 임시로 계산
                                    // (이전 종가 정보가 가장 정확합니다)
                                    changeRate = (fluctuation / currentPrice) * 100;
                                } else {
                                    changeRate = 0; // 변화가 없거나 계산 불가
                                }
                                
                                // 표시 형식 맞추기
                                currentPrice = currentPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }); // 소수점 없음
                                change = `${change >= 0 ? '+' : ''}${change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; // 소수점 2자리
                                changeRate = `${changeRate >= 0 ? '+' : ''}${changeRate.toFixed(2)}%`; // 소수점 2자리, %
                                
                                // 차트 데이터 변환
                                chartData = stock.stockPrices.map(price => ({
                                    time: price.priceDate.split('T')[0], // 'YYYY-MM-DD' 형식으로
                                    value: price.closePrice
                                })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                            }

                            uniqueStocks.set(stock.stockCode, {
                                name: stock.stockName,
                                code: stock.stockCode,
                                currentPrice: currentPrice, // KRW이므로 '$' 제거
                                change: change,
                                changeRate: changeRate,
                                changeType: changeType,
                                reason: stock.companyInfo, // companyInfo를 추천 사유로 사용
                                chartData: chartData,
                            });
                        }
                    });
                });
                
                // 최대 5개의 종목만 표시
                const transformedStocks = Array.from(uniqueStocks.values()).slice(0, 5); 
                setAiRecommendedStocks(transformedStocks);
                setAiStocksError(null);
            } catch (err) {
                console.error('AI 추천 종목 데이터를 가져오는 중 오류 발생:', err);
                setAiStocksError('AI 추천 종목을 불러오지 못했습니다.');
                setAiRecommendedStocks([]); // 오류 발생 시 빈 배열로 설정
            } finally {
                setAiStocksLoading(false);
            }
        };

        fetchAiRecommendedStocks();
    }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨

    // 뉴스 탭 (선택된 뉴스 내용) 상태
    const [activeNewsTab, setActiveNewsTab] = useState(null); // 현재 활성화된 뉴스 탭의 newsIdx
    const [selectedNewsUrl, setSelectedNewsUrl] = useState(''); // 선택된 뉴스의 URL
    const [selectedNewsTitle, setSelectedNewsTitle] = useState(''); // 선택된 뉴스의 제목 (선택적으로 사용)

    const handleBubbleClick = (bubble) => {
        setSelectedKeyword(bubble);
        // detailData를 선택된 버블 (이미 relatedNews를 포함하고 있음)로 설정
        // DTO 구조와 일치하도록 매핑
        setDetailData({
            keyword_Name: bubble.text,
            total_count: bubble.value,
            numArticlesMentionedIn: bubble.numArticlesMentionedIn,
            relatedNews: bubble.news || [],
        });
        setSelectedNewsUrl(''); // 새로운 버블 선택 시 뉴스 URL 초기화
        setSelectedNewsTitle(''); // 새로운 버블 선택 시 뉴스 제목 초기화
        setActiveNewsTab(null); // 새로운 버블 선택 시 활성 뉴스 탭 초기화
    };

    // handleNewsClick 함수 수정
    const handleNewsClick = (newsItem) => {
        // 새 탭 대신 /news/{newsIdx} 경로로 이동
        navigate(`/news/${newsItem.newsIdx}`); // ⭐ 수정
    };

    // 페이지 이동 핸들러
    const handleNavigateToIssueNews = () => {
        navigate('/ai-info/issue-analysis');
    };
    const handleNavigateToAirecommend = () => {
        navigate('/ai-picks');
    };

    // 랭킹 데이터 (임시 데이터) - 사용하지 않으므로 삭제합니다.
    // const [popularItems, setPopularItems] = useState(popularSearchesData);
    // const [hitRateItems, setHitRateItems] = useState(topHitRatesData);
    // const [profitRateItems, setProfitRateItems] = useState(topProfitRatesData);


    return (
        <div className="ai-info-home-dashboard">
            {/* 새로운 왼쪽 컬럼 컨테이너 */}
            <div className="left-column-container">
                {/* 섹션 1: 국내 주요 지수 */}
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

                {/* 주요 종목 랭킹 섹션 (주석 처리된 부분 유지)
                    주석 처리된 <StockRankings /> 컴포넌트가 임시 데이터를 사용하고 있으므로,
                    이 섹션을 활성화하려면 해당 데이터를 API로 대체하거나 필요한 임시 데이터를 다시 추가해야 합니다.
                */}
                {/* <section className="stock-rankings-container">
                    <StockRankings
                        sectionTitle="주요 종목 랭킹"
                        popularItems={popularItems}
                        hitRateItems={hitRateItems}
                        profitRateItems={profitRateItems}
                    />
                </section> */}

            </div>

            {/* 섹션 2: AI 추천 종목 */}
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
                        {aiRecommendedStocks.map((stock, index) => (
                            <RecommendedStockCard key={index} stock={stock} />
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

            {/* 섹션 3: AI 이슈분석 */}
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
                                    <div className="news-cards-wrapper"> {/* 새로운 래퍼 클래스 */}
                                        {detailData.relatedNews.map((newsItem) => (
                                            <div
                                                key={newsItem.newsIdx}
                                                className="news-card-item" // 각 뉴스 항목의 새로운 클래스
                                                onClick={() => handleNewsClick(newsItem)}
                                                title={newsItem.newsTitle} // 마우스 오버 시 전체 제목 표시
                                            >
                                                <div className="news-content-area">
                                                    <p className="news-card-title">{newsItem.newsTitle}</p> {/* 뉴스 제목 */}
                                                    <span className="news-card-press">{newsItem.pressName}</span> {/* 신문사 이름 */}
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