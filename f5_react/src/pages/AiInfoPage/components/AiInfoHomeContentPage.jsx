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

// 임시 데이터 (이 부분은 기존과 동일하므로 생략)
const popularSearchesData = [
    { rank: 1, name: '삼성전자', code: '005930', price: '75,200', changeValue: '+200', changeRate: '+0.27%' },
    { rank: 2, name: '에코프로비엠', code: '247540', price: '230,000', changeValue: '-3,500', changeRate: '-1.50%' },
    { rank: 3, name: 'SK하이닉스', code: '000660', price: '185,000', changeValue: '+1,000', changeRate: '+0.54%' },
    { rank: 4, name: '카카오', code: '035720', price: '47,800', changeValue: '-150', changeRate: '-0.31%' },
    { rank: 5, name: 'POSCO홀딩스', code: '005490', price: '382,000', changeValue: '+500', changeRate: '+0.13%' },
    { rank: 6, name: '삼성전자', code: '005930', price: '75,200', changeValue: '+200', changeRate: '+0.27%' },
    { rank: 7, name: '에코프로비엠', code: '247540', price: '230,000', changeValue: '-3,500', changeRate: '-1.50%' },
    { rank: 8, name: 'SK하이닉스', code: '000660', price: '185,000', changeValue: '+1,000', changeRate: '+0.54%' },
    { rank: 9, name: '카카오', code: '035720', price: '47,800', changeValue: '-150', changeRate: '-0.31%' },
    { rank: 10, name: 'POSCO홀딩스', code: '005490', price: '382,000', changeValue: '+500', changeRate: '+0.13%' },
];
const topHitRatesData = [
    { rank: 1, name: '현대로템', code: '064350', price: '35,200', changeValue: '+700', changeRate: '+2.03%' },
    { rank: 2, name: '한화에어로스페이스', code: '012450', price: '211,000', changeValue: '-500', changeRate: '-0.24%' },
    { rank: 3, name: '두산에너빌리티', code: '034020', price: '17,500', changeValue: '+120', changeRate: '+0.69%' },
    { rank: 4, name: 'LG이노텍', code: '011070', price: '240,000', changeValue: '+2,500', changeRate: '+1.05%' },
    { rank: 5, name: '기아', code: '000270', price: '115,000', changeValue: '-1,000', changeRate: '-0.86%' },
    { rank: 6, name: '현대로템', code: '064350', price: '35,200', changeValue: '+700', changeRate: '+2.03%' },
    { rank: 7, name: '한화에어로스페이스', code: '012450', price: '211,000', changeValue: '-500', changeRate: '-0.24%' },
    { rank: 8, name: '두산에너빌리티', code: '034020', price: '17,500', changeValue: '+120', changeRate: '+0.69%' },
    { rank: 9, name: 'LG이노텍', code: '011070', price: '240,000', changeValue: '+2,500', changeRate: '+1.05%' },
    { rank: 10, name: '기아', code: '000270', price: '115,000', changeValue: '-1,000', changeRate: '-0.86%' },
];
const topProfitRatesData = [
    { rank: 1, name: 'HLB', code: '028300', price: '95,800', changeValue: '+3,200', changeRate: '+3.45%' },
    { rank: 2, name: '알테오젠', code: '196170', price: '171,000', changeValue: '-1,500', changeRate: '-0.87%' },
    { rank: 3, name: '엔켐', code: '348370', price: '250,000', changeValue: '+5,000', changeRate: '+2.04%' },
    { rank: 4, name: 'LS머트리얼즈', code: '417200', price: '30,000', changeValue: '+300', changeRate: '+1.01%' },
    { rank: 5, name: '한미반도체', code: '042700', price: '140,000', changeValue: '-1,200', changeRate: '-0.85%' },
    { rank: 6, name: 'HLB', code: '028300', price: '95,800', changeValue: '+3,200', changeRate: '+3.45%' },
    { rank: 7, name: '알테오젠', code: '196170', price: '171,000', changeValue: '-1,500', changeRate: '-0.87%' },
    { rank: 8, name: '엔켐', code: '348370', price: '250,000', changeValue: '+5,000', changeRate: '+2.04%' },
    { rank: 9, name: 'LS머트리얼즈', code: '417200', price: '30,000', changeValue: '+300', changeRate: '+1.01%' },
    { rank: 10, name: '기아', code: '000270', price: '115,000', changeValue: '-1,000', changeRate: '-0.86%' },
];

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
    const [detailData, setDetailData] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [kospiCurrentData, setKospiCurrentData] = useState(initialMarketData);
    const [kosdaqCurrentData, setKosdaqCurrentData] = useState(initialMarketData);
    const [marketDataLoading, setMarketDataLoading] = useState(true);
    const [marketDataError, setMarketDataError] = useState(null);

    useEffect(() => {
        const fetchMarketData = async () => {
            setMarketDataLoading(true);
            try {
                const response = await axios.get(`http://localhost:8084/F5/index/daily/recent`);
                console.log("시장 데이터 (전체):", response.data);

                const { KOSPI, KOSDAQ } = response.data;

                // --- 각 날짜별로 '딱 하나의' 데이터 (가장 최신 시간 데이터)만 선택하는 공통 로직 ---
                const aggregateDailyData = (dataArray) => {
                    if (!dataArray || dataArray.length === 0) return [];
                    
                    // 데이터 정렬: 오래된 날짜, 같은 날짜면 오래된 시간 순으로
                    dataArray.sort((a, b) => {
                        const dateA = new Date(a.date + 'T' + a.createdAt.split('T')[1].split('+')[0]);
                        const dateB = new Date(b.date + 'T' + b.createdAt.split('T')[1].split('+')[0]);
                        return dateA.getTime() - dateB.getTime();
                    });

                    const dailyLatestDataMap = new Map(); // "YYYY-MM-DD" -> 해당 날짜의 가장 최신 시간 데이터 포인트
                    dataArray.forEach(item => {
                        const dateKey = item.date; // "YYYY-MM-DD" 형식
                        const currentTime = new Date(item.createdAt).getTime();
                        const existingItem = dailyLatestDataMap.get(dateKey);

                        if (!existingItem || currentTime > new Date(existingItem.createdAt).getTime()) {
                            dailyLatestDataMap.set(dateKey, item);
                        }
                    });
                    // Map의 값들을 배열로 변환하고 date 기준 오름차순 정렬 (차트 표시 순서)
                    return Array.from(dailyLatestDataMap.values())
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                };

                const aggregatedKospiData = aggregateDailyData(KOSPI);
                const aggregatedKosdaqData = aggregateDailyData(KOSDAQ);

                console.log("코스피 일별 집계 데이터:", aggregatedKospiData);
                console.log("코스닥 일별 집계 데이터:", aggregatedKosdaqData);

                // --- MarketInfoCard의 현재 값 및 변화율 계산 ---
                // 오늘 날짜의 가장 최신 시간 데이터 (MarketInfoCard용)
                const now = new Date();
                const todayStr = now.toISOString().slice(0, 10);
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().slice(0, 10);
                
                const getLatestValueAndChange = (aggregatedData, rawData) => {
                    let latestValue = 0;
                    let changeValue = 0;
                    let changeRate = 0;
                    let changeType = 'neutral';

                    // 오늘 날짜의 가장 최신 시간 데이터 (allIndexData에서 찾아야 가장 정확)
                    const todayRawDataPoints = rawData.filter(item => item.date === todayStr);
                    const latestTodayRawItem = todayRawDataPoints.length > 0 
                                              ? todayRawDataPoints[todayRawDataPoints.length - 1] // 이미 rawData 정렬되어있다고 가정
                                              : null;
                    latestValue = latestTodayRawItem ? latestTodayRawItem.averagePrice : 0;

                    // 어제 날짜의 가장 최신 데이터 (aggregatedData에서 찾아야 함)
                    const prevDayLatestAggregatedItem = aggregatedData.find(item => item.date === yesterdayStr);
                    const prevDayLastValue = prevDayLatestAggregatedItem ? prevDayLatestAggregatedItem.averagePrice : null;

                    if (latestValue && prevDayLastValue !== null) {
                        changeValue = latestValue - prevDayLastValue;
                        changeRate = (changeValue / prevDayLastValue) * 100;
                        changeType = changeValue >= 0 ? 'positive' : 'negative';
                    } else if (latestValue && todayRawDataPoints.length > 1) { 
                        // 오늘 데이터만 있고 어제 데이터가 없는 경우, 오늘 첫 데이터와 비교
                        const firstTodayRawValue = todayRawDataPoints[0].averagePrice;
                        changeValue = latestValue - firstTodayRawValue;
                        changeRate = (changeValue / firstTodayRawValue) * 100;
                        changeType = changeValue >= 0 ? 'positive' : 'negative';
                    }

                    return { latestValue, changeValue, changeRate, changeType };
                };

                // 코스피 현재 값 및 변화율 설정
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
                    // 차트 데이터는 필터링된 한 달치 일별 데이터를 사용합니다.
                    chartData: aggregatedKospiData.filter(item => {
                        const itemDate = new Date(item.date);
                        const oneMonthAgo = new Date(now);
                        oneMonthAgo.setMonth(now.getMonth() - 1);
                        oneMonthAgo.setHours(0,0,0,0); // 시간 초기화
                        return itemDate.getTime() >= oneMonthAgo.getTime();
                    }).map(item => ({
                        time: item.date, // StockChart의 timeUnit:'daily'에 맞게 YYYY-MM-DD 전달
                        value: item.averagePrice
                    })),
                });

                // 코스닥 현재 값 및 변화율 설정
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
                     // 차트 데이터는 필터링된 한 달치 일별 데이터를 사용합니다.
                    chartData: aggregatedKosdaqData.filter(item => {
                        const itemDate = new Date(item.date);
                        const oneMonthAgo = new Date(now);
                        oneMonthAgo.setMonth(now.getMonth() - 1);
                        oneMonthAgo.setHours(0,0,0,0); // 시간 초기화
                        return itemDate.getTime() >= oneMonthAgo.getTime();
                    }).map(item => ({
                        time: item.date, // StockChart의 timeUnit:'daily'에 맞게 YYYY-MM-DD 전달
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
    }, []); // 컴포넌트 마운트 시 한 번만 실행

    // API 호출로 버블 데이터 가져오기 (axios.get 사용)
    useEffect(() => {
        const fetchBubbleData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8084/F5/keyword/keywordData`);
                console.log(response.data);
                setBubbleData(response.data); // Axios는 자동으로 JSON 파싱
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

    // 뉴스 탭
    const [activeNewsTab, setActiveNewsTab] = useState(null); // 현재 활성화된 뉴스 탭의 ID
    const [selectedNewsContent, setSelectedNewsContent] = useState(''); 
    const handleBubbleClick = (bubble) => {
        setSelectedKeyword(bubble);
        setDetailData({
            keyword: bubble.text,
            articleFrequency: bubble.numArticlesMentionedIn,
            relatedItems: ['관련 품목 1', '관련 품목 2'],
            news: bubble.news || [],
        });
        setSelectedNewsContent(''); // 새로운 버블 선택 시 뉴스 내용 초기화
        setActiveNewsTab(null); // 새로운 버블 선택 시 활성 뉴스 탭 초기화
    };

    // handleNewsClick 함수 수정 (이제 뉴스 탭 활성화 역할도 겸함)
    const handleNewsClick = (newsItem) => {
        setSelectedNewsContent(newsItem.content || '뉴스 내용을 불러올 수 없습니다.');
        setActiveNewsTab(newsItem.id); // 클릭한 뉴스의 ID를 활성 탭으로 설정
    };




    // 페이지 이동 핸들러
    const handleNavigateToIssueNews = () => {
        navigate('/ai-info/issue-analysis');
    };
    const handleNavigateToAirecommend = () => {
        navigate('/ai-picks');
    };

    // 랭킹 데이터 (임시 데이터)
    const [popularItems, setPopularItems] = useState(popularSearchesData);
    const [hitRateItems, setHitRateItems] = useState(topHitRatesData);
    const [profitRateItems, setProfitRateItems] = useState(topProfitRatesData);


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
                                            timeUnit: 'daily', // 한 달치 데이터이므로 'daily'가 적합
                                            height: 200, // MarketInfoCard에 맞춰 차트 높이 조절
                                        }}/>}
                                />
                                <MarketInfoCard
                                    marketData={kosdaqCurrentData}
                                    chartNode={<StockChart
                                        data={kosdaqCurrentData.chartData}
                                        chartOptions={{
                                            timeUnit: 'daily', // 한 달치 데이터이므로 'daily'가 적합
                                            height: 200, // MarketInfoCard에 맞춰 차트 높이 조절
                                        }}/>}
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* 주요 종목 랭킹 섹션 */}
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
                            <h3><span className="keyword-highlight">{detailData.keyword}</span> </h3>
                            <div className="detail-item"><strong>언급 빈도수:</strong> {selectedKeyword.value}</div>
                            <div className="detail-item"><strong>언급된 기사 수 :</strong> {detailData.articleFrequency}</div>
                            <div className="detail-item news-tabs-container"> {/* 새 컨테이너 div 추가 */}
                                <strong>관련 뉴스:</strong>
                                <div className="news-tabs-header"> {/* 탭 버튼들을 담을 헤더 */}
                                    {detailData.news.map(newsItem => (
                                        <button
                                            key={newsItem.id}
                                            className={`news-tab-button ${activeNewsTab === newsItem.id ? 'active' : ''}`}
                                            onClick={() => handleNewsClick(newsItem)}
                                        >
                                            뉴스 {newsItem.id} {/* 예: 뉴스 1, 뉴스 2 등으로 표시 */}
                                        </button>
                                    ))}
                                </div>
                                {/* 선택된 뉴스 내용 표시 영역 (기존 코드와 동일) */}
                                {selectedNewsContent && (
                                    <div className="news-content-display">
                                        <h4>뉴스 내용:</h4>
                                        <p>{selectedNewsContent}</p>
                                    </div>
                                )}
                            </div>
                            {/* <div className="detail-item">
                                <strong>최신 뉴스:</strong>
                                <ul>
                                    {detailData.news.map(newsItem => (
                                        <li key={newsItem.id}>

                                            <a href="#" onClick={(e) => { e.preventDefault(); handleNewsClick(newsItem); }}>
                                                {newsItem.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>    
                                
                                
                                
                            </div>

                            {selectedNewsContent && (
                                <div className="news-content-display">
                                    <h4>뉴스 내용:</h4>
                                    <p>{selectedNewsContent}</p>
                                </div>
                            )} */}
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