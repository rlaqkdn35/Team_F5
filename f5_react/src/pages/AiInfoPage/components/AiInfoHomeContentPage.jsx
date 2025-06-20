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

// AI 추천 종목 데이터는 임시 데이터가 아니라 실제 프론트엔드에 필요한 데이터이므로 유지합니다.
const aiRecommendedStocks = [
    {
        name: '엔비디아',
        code: 'NVDA',
        currentPrice: '$1,000.50',
        change: '+20.30',
        changeRate: '+2.07%',
        changeType: 'positive',
        reason: 'AI 칩 선두 기업으로, 데이터 센터 및 AI 연산 수요 폭증으로 강력한 성장세가 예상됩니다. 최신 GPU 발표로 시장 기대감이 높습니다.',
        chartData: [],
    },
    {
        name: '테슬라',
        code: 'TSLA',
        currentPrice: '$175.20',
        change: '-5.80',
        changeRate: '-3.21%',
        changeType: 'negative',
        reason: '전기차 시장의 선두주자이며, FSD (Full Self-Driving) 기술 발전과 로봇택시 사업 확장으로 미래 성장 동력을 확보하고 있습니다.',
        chartData: [],
    },
    {
        name: '애플',
        code: 'AAPL',
        currentPrice: '$190.10',
        change: '+1.50',
        changeRate: '+0.79%',
        changeType: 'positive',
        reason: '강력한 브랜드 충성도와 생태계를 기반으로 서비스 매출이 꾸준히 성장하고 있으며, AI 기능 강화에 대한 기대감도 커지고 있습니다.',
        chartData: [],
    },
    {
        name: '구글 (알파벳)',
        code: 'GOOGL',
        currentPrice: '$170.80',
        change: '+3.20',
        changeRate: '+1.91%',
        changeType: 'positive',
        reason: 'AI 연구 개발에 막대한 투자를 하고 있으며, 검색, 클라우드, 자율주행 등 다양한 분야에서 AI 기술을 선도하고 있습니다. 최근 Gemini AI 모델이 주목받고 있습니다.',
        chartData: [],
    },
    {
        name: '마이크로소프트',
        code: 'MSFT',
        currentPrice: '$420.00',
        change: '+5.00',
        changeRate: '+1.20%',
        changeType: 'positive',
        reason: '클라우드 컴퓨팅 (Azure) 시장의 강자이며, OpenAI 투자 및 AI 통합 전략을 통해 기업용 AI 솔루션 시장을 선도하고 있습니다. AI 오피스 제품군의 기대감도 높습니다.',
    },
];

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