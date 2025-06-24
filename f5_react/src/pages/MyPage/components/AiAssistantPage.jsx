// src/pages/MyPage/components/AiAssistantPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AiAssistantPage.css'; // 이 컴포넌트의 스타일 파일

// --- 헬퍼 함수: 숫자 포맷팅 및 CSS 클래스 반환 ---
const formatNumberAndGetClass = (value, isPercentage = false) => {
    if (value === null || value === undefined) {
        return { displayValue: '-', className: '' };
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
        return { displayValue: '-', className: '' };
    }

    let displayValue;
    let className = '';

    if (num > 0) {
        className = 'positive'; // CSS에서 양수 색상 정의 필요
        displayValue = `+${num.toLocaleString()}`; // 양수는 '+' 부호 붙임
    } else if (num < 0) {
        className = 'negative'; // CSS에서 음수 색상 정의 필요
        displayValue = num.toLocaleString(); // 음수는 자동으로 '-' 부호 붙음
    } else { // 0인 경우
        displayValue = '0';
        className = ''; // 0은 특별한 색상 없음
    }

    if (isPercentage) {
        displayValue += '%'; // 퍼센트일 경우 '%' 붙임
    }
    return { displayValue, className };
};

// --- 헬퍼 함수: 등락률 계산 ---


// --- 개인 맞춤 추천 목업 데이터 (아직 백엔드 연동이 없으므로 유지) ---
const mockPersonalizedPicks = [
    { id: 'pp1', stockCode: 'A12345', stockName: 'AI 추천종목 알파', currentPrice: '25,300', changeRate: '+3.10%', changeType: 'positive', reason: '관심종목 "삼성전자"와 유사한 AI 성장성 포착', prediction: '단기 목표가 28,000원' },
    { id: 'pp2', stockCode: 'B67890', stockName: 'AI 추천종목 베타', currentPrice: '12,800', changeRate: '-1.15%', changeType: 'negative', reason: '최근 관심 섹터 "2차 전지" 내 저평가 분석', prediction: '조정 후 반등 유력, 분할 매수 고려' },
    { id: 'pp3', stockCode: 'C13579', stockName: 'AI 추천종목 감마', currentPrice: '5,500', changeRate: '+0.90%', changeType: 'positive', reason: '사용자 투자 성향(안정형) 및 최근 시장 상황 고려', prediction: '안정적 배당 및 점진적 상승 기대' },
];

const calculateChangeRate = (stockFluctuation, closePrice) => {
    let displayValue;
    let className;

    if (closePrice === 0) {
        displayValue = '0.00%';
        className = 'text-gray-500'; // 또는 적절한 기본 클래스
    } else {
        const changeRate = (stockFluctuation / closePrice) * 100;

        displayValue = changeRate.toFixed(2) + '%';

        if (changeRate > 0) {
            className = 'positive'; // 양수일 경우 빨간색 (상승)
            displayValue = '+' + displayValue; // 양수일 경우 + 부호 추가
        } else if (changeRate < 0) {
            className = 'negative'; // 음수일 경우 파란색 (하락)
        } else {
            className = 'text-gray-500'; // 0일 경우 회색 (변동 없음)
        }
    }

    return { displayValue, className };
};

// --- 관심 종목 아이템 컴포넌트 ---
// DTO (UserFavStockDetailDto) 구조에 맞춰 필드명 사용 및 포맷팅
const WatchlistItem = ({ item }) => {
    // 등락률 계산
   const { displayValue: changeRateDisplay, className: changeRateClass } =
        calculateChangeRate(item.stockFluctuation, item.closePrice);

    return (
        <li className="watchlist-item-aia">
            <Link to={`/stock-detail/${item.stockCode}`} className="watchlist-item-link-aia">
                <div className="item-info-aia">
                    <span className="stock-name-aia">{item.stockName} ({item.stockCode})</span>
                    <span className="current-price-aia">
                        {item.closePrice !== null && item.closePrice !== undefined
                            ? item.closePrice.toLocaleString() + '원'
                            : '-'}
                    </span>
                </div>
                <div className="item-status-aia">
                    <span className={`change-rate-aia ${changeRateClass}`}>{item.stockFluctuation}%</span>
                    {/* AI 시그널은 DTO에 없으므로 임시로 빈 값 또는 "정보 없음" 처리 */}
                </div>
            </Link>
        </li>
    );
};

// --- 개인 맞춤 추천 아이템 컴포넌트 ---
const PersonalizedPickItem = ({ item }) => (
    <div className="personalized-pick-card-aia">
        <Link to={`/stock-detail/${item.stockCode}`} className="stock-name-link-aia">
            <h4>{item.stockName} <span className="stock-code-aia">({item.stockCode})</span></h4>
        </Link>
        <div className="price-info-aia">
            <span className="current-price-aia">현재가: {item.currentPrice}</span>
            {/* mock 데이터의 changeType 사용 */}
            <span className={`change-rate-aia ${item.changeType}`}>{item.changeRate}</span>
        </div>
        <p className="recommendation-reason-aia"><strong>AI 추천 이유:</strong> {item.reason}</p>
        <p className="ai-prediction-aia"><strong>AI 예측:</strong> {item.prediction}</p>
        {/* <div className="mini-chart-placeholder-aia">관련 미니차트</div> */}
    </div>
);

// --- AiAssistantPage 메인 컴포넌트 ---
const AiAssistantPage = () => {
    const [userId, setUserId] = useState(null); // 로컬 스토리지에서 가져올 userId 상태
    const [watchlist, setWatchlist] = useState([]); // 백엔드에서 가져올 관심 종목 (최신 3개)
    const [personalizedPicks, setPersonalizedPicks] = useState([]); // 개인 맞춤 추천 (목업 유지)
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 오류 메시지 상태

    useEffect(() => {
        // 컴포넌트 마운트 시 로컬 스토리지에서 userId 가져오기
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId); // userId 상태 업데이트
        } else {
            // userId가 없으면 로그인 필요 메시지 표시
            setError("로그인이 필요합니다. 사용자 정보를 찾을 수 없습니다.");
            setLoading(false);
            setWatchlist([]); // 관심 종목 초기화
            setPersonalizedPicks(mockPersonalizedPicks); // 추천 종목은 목업 유지 (선택 사항)
            return; // userId가 없으므로 API 호출 로직을 더 이상 진행하지 않음
        }

        const fetchAiAssistantData = async () => {
            setLoading(true);
            setError(null); // 이전 오류 초기화

            try {
                // 1. 관심 종목 현황 데이터 가져오기 (최신 3개)
                // 백엔드 URL을 정확하게 설정해야 합니다. (예: http://localhost:8084)
                // /F5/userfav/list 엔드포인트가 userId로 조회하고 최신 순으로 데이터를 준다고 가정
                const watchlistResponse = await fetch(`http://localhost:8084/F5/userfav/list?userId=${storedUserId}`);

                if (!watchlistResponse.ok) {
                    const errorText = await watchlistResponse.text();
                    throw new Error(`관심 종목 데이터를 불러오는 데 실패했습니다: ${watchlistResponse.status} ${watchlistResponse.statusText} - ${errorText}`);
                }
                const watchlistData = await watchlistResponse.json();
                console.log("AI 비서 - 관심 종목 데이터 (원시):", watchlistData);

                // 백엔드에서 이미 정렬되어 온다고 가정하고, 상위 3개만 잘라 사용
                setWatchlist(watchlistData.slice(0, 3));

                // 2. 개인 맞춤 추천 데이터 (현재는 목업 유지)
                setPersonalizedPicks(mockPersonalizedPicks);

            } catch (err) {
                console.error("AI 비서 데이터 조회 중 오류 발생:", err);
                setError(`AI 비서 정보를 불러오는 데 실패했습니다: ${err.message}`);
                setWatchlist([]); // 오류 발생 시 관심 종목 초기화
                setPersonalizedPicks([]); // 오류 발생 시 추천 종목도 초기화 (선택 사항)
            } finally {
                setLoading(false);
            }
        };

        // userId가 유효할 때만 데이터 가져오는 함수 호출
        if (storedUserId) { // useEffect 내에서 이미 체크했으므로 다시 체크
            fetchAiAssistantData();
        }
    }, [userId]); // userId 상태가 변경될 때마다 useEffect 재실행

    if (loading) {
        return <p className="loading-message-aia">AI 비서 정보를 불러오는 중입니다...</p>;
    }

    if (error) {
        return <div className="error-message-aia">오류: {error}</div>;
    }

    return (
        <div className="ai-assistant-page">
            {/* 페이지 제목은 MyPageLayout의 SubNavigation에서 "AI 비서"로 이미 표시됨 */}
            {/* <h1 className="page-main-title-aia">AI 비서</h1> */}

            <section className="watchlist-section-aia">
                <div className="section-header-aia">
                    <h2 className="section-title-aia">나의 관심 종목 현황</h2>
                    <Link to="/mypage/favorite" className="view-all-link-aia">관심 종목 전체보기 &rarr;</Link>
                </div>
                {watchlist.length > 0 ? (
                    <ul className="watchlist-list-aia">
                        {watchlist.map(item => (
                            <WatchlistItem key={item.stockCode} item={item} />
                        ))}
                    </ul>
                ) : (
                    <p className="no-data-message-aia">등록된 관심 종목이 없습니다. <Link to="/search">종목을 검색</Link>하여 추가해보세요.</p>
                )}
            </section>

            <section className="personalized-picks-section-aia">
                <h2 className="section-title-aia">AI 개인 맞춤 추천</h2>
                {personalizedPicks.length > 0 ? (
                    <div className="personalized-picks-grid-aia">
                        {personalizedPicks.map(item => (
                            <PersonalizedPickItem key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <p className="no-data-message-aia">현재 맞춤 추천 종목이 없습니다.</p>
                )}
                {/* 맞춤 추천 더보기 또는 설정 변경 링크가 필요하다면 여기에 추가 */}
            </section>
        </div>
    );
};

export default AiAssistantPage;