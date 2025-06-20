// src/pages/AiPicksPage/components/AiPicksHomeContent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AiPicksHomeContent.css'; // 이 컴포넌트의 스타일 파일
import { Line } from 'react-chartjs-2'; // Chart.js import for graphs
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

// Chart.js 모듈 등록
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
    const [topStocks, setTopStocks] = useState([]); // 실시간 탑 종목 5개
    const [aiModels, setAiModels] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState(null); // 추가: 선택된 AI 모델 ID
    const [isLoggedIn, setIsLoggedIn] = useState(true); // 임시 로그인 상태 (Signal.jsx에서 가져옴)
    // allSignals 데이터를 상태로 관리하거나, 이 컴포넌트 내에서 정의합니다.
    const [signals, setSignals] = useState([]); // Signal 데이터 상태 추가

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. AiPicksHomeContent.jsx 기존 데이터 (시뮬레이션 유지)
                const todayPicksData = [
                    { id: 'pick1', stockName: '에이테크', stockCode: 'A001', prediction: '단기 급등 예상', targetPrice: '15,000', reason: 'AI 모델 신호 포착' },
                    { id: 'pick2', stockName: '비솔루션', stockCode: 'B002', prediction: '안정적 우상향', targetPrice: '120,000', reason: '실적 개선 기대' },
                    { id: 'pick3', stockName: '씨에너지', stockCode: 'C003', prediction: '테마주 순환매', targetPrice: '8,500', reason: '수급 집중' },
                ];
    
                const bestProfitData = [
                    { id: 'profit1', stockName: '가온칩스', stockCode: 'GA01', changeRate: '+25.8%', date: '05/06~05/13', lowBuyPrice: '60,000', highSellPrice: '75,500' },
                    { id: 'profit2', stockName: '나노신소재', stockCode: 'NA02', changeRate: '+18.2%', date: '05/06~05/13', lowBuyPrice: '120,000', highSellPrice: '141,800' },
                ];
    
                setTodayPicks(todayPicksData);
                setBestProfitStocks(bestProfitData);
    
                // 2. RecommendationsPage.jsx 핵심 데이터 (시뮬레이션 유지)
                const dummyAiModels = [
                    { id: 'modelA', name: 'AI 모델 A', score: 92, summary: '시장 데이터를 기반으로 단기 급등 종목을 예측합니다.', recommendedStock: { code: 'NVDA', name: 'NVIDIA Corp.', reason: '최근 기술 혁신 발표와 시장 수요 증가로 긍정적 모멘텀이 예상됩니다.' } },
                    { id: 'modelB', name: 'AI 모델 B', score: 88, summary: '거시 경제 지표와 기업 펀더멘털을 분석하여 장기 투자를 제안합니다.', recommendedStock: { code: 'MSFT', name: 'Microsoft Corp.', reason: '클라우드 컴퓨팅 부문의 꾸준한 성장과 안정적인 수익 구조를 갖추고 있습니다.' } },
                    { id: 'modelC', name: 'AI 모델 C', score: 95, summary: '소셜 미디어 트렌드와 뉴스 심리를 반영하여 시장 변동성을 포착합니다.', recommendedStock: { code: 'TSLA', name: 'Tesla Inc.', reason: '일론 머스크의 최신 트윗과 전기차 시장의 회복 기대감이 반영되었습니다.' } },
                ];
                setAiModels(dummyAiModels);
                if (dummyAiModels.length > 0) {
                    const initialTopAi = dummyAiModels.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                    setSelectedModelId(initialTopAi.id);
                }
    
                // 3. Signal.jsx 핵심 데이터 (allSignals 정의) (시뮬레이션 유지)
                const allSignalsData = [
                    { id: 1, type: 'BUY', stock: '삼성전자', code: '005930', price: 82000, change: '+2.5%', time: '2025-05-27 10:30', strength: '매우 강함', reason: '강력한 거래량 동반 이동평균선 돌파', premium: true },
                    { id: 2, type: 'SELL', stock: 'SK하이닉스', code: '000660', price: 195000, change: '-1.0%', time: '2025-05-27 10:00', strength: '중간', reason: '단기 과열 및 저항선 도달', premium: true },
                    { id: 3, type: 'HOLD', stock: '네이버', code: '035420', price: 180000, change: '+0.5%', time: '2025-05-27 09:45', strength: '보통', reason: '특별한 변동성 없음', premium: false },
                    { id: 4, type: 'BUY', stock: '카카오', code: '035720', price: 50000, change: '+3.2%', time: '2025-05-27 09:30', strength: '강함', reason: '바닥 다지기 후 매수 시그널 발생', premium: true },
                    { id: 5, type: 'WATCH', stock: '현대차', code: '005380', price: 230000, change: '-0.8%', time: '2025-05-27 09:00', strength: '약함', reason: '추세 전환 가능성 모니터링', premium: false },
                ];
                setSignals(allSignalsData);
    
                // 4. TodayPicksPage.jsx 핵심 데이터 (시뮬레이션 유지)
                const now = new Date();
                const hour = now.getHours();
                const minute = now.getMinutes();
                const isOpen = hour >= 10 && hour < 16; 
                const updatedTime = `${now.toLocaleDateString()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                setMarketStatus({ isOpen, lastUpdated: updatedTime });
    
                // 실시간 탑 종목 5개 데이터 불러오기 (API 호출)
                const response = await fetch('http://localhost:8084/F5/stock/daily');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
    
                // 등락률(stockFluctuation)이 양수인 종목만 필터링하고, 등락률이 높은 순서대로 5개 뽑기
                const sortedTopStocks = data
                    .filter(stock => stock.stockFluctuation > 0)
                    .sort((a, b) => b.stockFluctuation - a.stockFluctuation)
                    .slice(0, 5)
                    .map((stock, index) => ({ // 클라이언트에서 rank 세팅
                        ...stock,
                        rank: index + 1,
                        // Chart.js에서 사용될 수 있도록 changeRate, changeAmount, volume 필드 추가 (임시)
                        // 실제로는 백엔드에서 필요한 데이터를 제공하거나 프론트에서 계산해야 합니다.
                        price: stock.closePrice, // 예시: 종가 사용
                        changeRate: parseFloat(stock.stockFluctuation.toFixed(2)), // 등락률을 changeRate로 사용
                        changeAmount: null, // API 응답에 없는 필드이므로 null
                        volume: null // API 응답에 없는 필드이므로 null
                    }));
                setTopStocks(sortedTopStocks);
    
            } catch (error) {
                console.error("데이터 로딩 중 오류 발생:", error);
                // 오류 발생 시에도 loading 상태를 해제하여 UI를 보여줄 수 있도록 합니다.
                // 필요에 따라 사용자에게 오류 메시지를 표시할 수 있습니다.
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const selectedAiModel = aiModels.find(model => model.id === selectedModelId);

    // 로그인 상태에 따라 보여줄 신호 필터링 (Signal.jsx에서 가져옴)
    const displaySignals = isLoggedIn
        ? signals
        : signals.filter(signal => !signal.premium); // premium: false인 신호만 보여줌

    if (loading) {
        return <p className="loading-message-aphc">AI 종목추천 데이터를 불러오는 중입니다...</p>;
    }

    return (
        <div className="ai-picks-home-content">
            {/* 새로운 Flexbox 컨테이너 추가 */}
            <div className="top-sections-container">
                {/* 4번 코드 - 시장 상태 섹션 */}
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
                    {/* 4번 코드 - 오늘의 탑 종목 (상위 5개) */}
                    <h3 className="sub-section-title-aphc">오늘의 탑 종목 (TOP 5)</h3>
                    <div className="top-stocks-list-aphc">
                        {topStocks.map((stock, index) => (
                            <Link to={`/stock-detail/${stock.stockCode}`} className='stock-link' key={stock.priceId}> {/* stockCode를 사용하여 Link to 변경 */}
                                <div className="top-stock-item-aphc">
                                    <span className="stock-rank-aphc">{stock.rank}.</span> {/* rank 사용 */}
                                    <span className="stock-name-aphc">{stock.stockName} ({stock.stockCode})</span> {/* stockName, stockCode 사용 */}
                                    <span className={`stock-change-rate-aphc ${stock.stockFluctuation > 0 ? 'positive' : stock.stockFluctuation < 0 ? 'negative' : ''}`}>
                                        {stock.stockFluctuation > 0 ? '+' : ''}{(stock.stockFluctuation).toFixed(2)}%
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 2번 코드 - AI 모델 요약 및 추천 섹션 */}
                <section className="ai-summary-section-aphc">
                    <h2 className="section-title-aphc">오늘의 AI 모델 추천</h2>
                    <div className="ai-model-selection-bar-aphc">
                        {aiModels.map(model => (
                            <div
                                key={model.id}
                                className={`model-score-item-aphc ${selectedModelId === model.id ? 'selected-model-aphc' : ''}`}
                                onClick={() => setSelectedModelId(model.id)}
                            >
                                <span className="model-name-aphc">{model.name}</span>
                                <span className="model-score-aphc">{model.score}점</span>
                            </div>
                        ))}
                    </div>
                    {selectedAiModel && (
                        <Link to={`/stock-detail/${selectedAiModel.recommendedStock.code}`} className='stock-link'>
                        <div className="selected-ai-recommendation-box-aphc">
                            <h3><span className="top-ai-indicator-aphc">🌟</span> {selectedAiModel.name} 추천 종목</h3>
                            <p className="recommended-stock-name-aphc">
                                <span className="stock-code-tag-aphc">{selectedAiModel.recommendedStock.code}</span> {selectedAiModel.recommendedStock.name}
                            </p>
                            <p className="recommendation-reason-aphc">{selectedAiModel.recommendedStock.reason}</p>
                            <p className="ai-comment-aphc">AI 요약: {selectedAiModel.summary}</p>
                        </div>
                        </Link>
                    )}
                </section>
            </div> {/* top-sections-container 닫기 */}


            {/* 3번 코드 - AI 매매 신호 (일부만 통합) */}
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
                    {displaySignals.slice(0, 3).map(signal => ( // 최신 3개만 표시
                        <div key={signal.id} className={`signal-card-aphc ${signal.type.toLowerCase()}`}>
                            <Link to={`/stock-detail/${signal.code}`} className='stock-link'>
                            <div className="signal-header-aphc">
                                <span className={`signal-type-aphc ${signal.type.toLowerCase()}-text`}>
                                    {signal.type === 'BUY' && '매수'}
                                    {signal.type === 'SELL' && '매도'}
                                    {signal.type === 'HOLD' && '보유'}
                                    {signal.type === 'WATCH' && '관망'}
                                </span>
                                <span className="signal-time-aphc">{signal.time.substring(11, 16)}</span> {/* 시간만 표시 */}
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