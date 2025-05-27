// src/pages/AiPicksPage/components/TodayPicksPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 종목명 링크용
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa'; // 날짜 이동 아이콘
import './TodayPicksPage.css';

// 임시 목업 데이터 생성 함수 (날짜별로 다른 데이터 시뮬레이션)
const getMockTodayPicksData = (dateStr) => {
  console.log(`Workspaceing picks for date: ${dateStr}`);
  // 실제로는 dateStr을 사용해 API를 호출합니다.
  // 여기서는 날짜에 따라 약간 다른 데이터를 반환하도록 간단히 시뮬레이션합니다.
  const basePicks = [
    { id: 'TP001', stockName: '에이테크', stockCode: 'A001', description: 'AI 기반 차세대 반도체 설계 유망주', reason: '금일 AI 모델에서 단기 상승 시그널 포착, 수급 개선 예상.' },
    { id: 'TP002', stockName: '비솔루션', stockCode: 'B002', description: '클라우드 보안 솔루션 성장 기대', reason: '최근 주요 계약 체결 및 긍정적 산업 리포트 발행.' },
    { id: 'TP003', stockName: '씨에너지', stockCode: 'C003', description: '친환경 에너지 저장 기술 선도 기업', reason: '정부 정책 지원 및 대규모 투자 유치 가능성 부각.' },
    { id: 'TP004', stockName: '디네트웍스', stockCode: 'D004', description: '메타버스 플랫폼 확장 가속화', reason: '신규 서비스 출시 임박, 사용자 증가 추세 확인.' },
  ];
  // 날짜 문자열의 마지막 숫자를 기반으로 데이터를 약간 변경하여 다른 날짜처럼 보이게 함
  const dayOfMonth = parseInt(dateStr.slice(-2), 10);
  return basePicks.map((pick, index) => ({
    ...pick,
    stockName: `${pick.stockName} (${(dayOfMonth % 3) + index})`, // 데이터에 약간의 변화 주기
    id: `${pick.id}_${dateStr}`
  })).slice(0, 2 + (dayOfMonth % 3)); // 날짜마다 추천 개수도 약간 다르게
};

// 날짜 포맷 함수 (YYYY-MM-DD)
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};


// 추천 종목 카드 컴포넌트
const RecommendedStockItem = ({ item }) => {
  return (
    <div className="recommended-stock-item-tpp"> {/* TPP: TodayPicksPage */}
      <Link to={`/stock-detail/${item.stockCode}`} className="stock-name-link-tpp">
        <h4>{item.stockName} <span className="stock-code-tpp">({item.stockCode})</span></h4>
      </Link>
      <p className="stock-description-tpp"><strong>종목 설명:</strong> {item.description}</p>
      <p className="recommendation-reason-tpp"><strong>추천 이유:</strong> {item.reason}</p>
    </div>
  );
};


const TodayPicksPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // 오늘 날짜로 초기화
  const [picksForDate, setPicksForDate] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const dateStr = formatDate(currentDate);
    // 실제로는 API 호출: fetchPicksForDate(dateStr).then(data => setPicksForDate(data));
    const data = getMockTodayPicksData(dateStr);
    setPicksForDate(data);
    setLoading(false);
  }, [currentDate]); // currentDate가 변경될 때마다 데이터 다시 로드

  const handleChangeDate = (daysToAdd) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + daysToAdd);
      // 다음 날짜가 오늘 이후로 넘어가지 않도록 제한 (선택적)
      if (daysToAdd > 0 && newDate > new Date()) {
        return prevDate; // 변경 없음
      }
      return newDate;
    });
  };

  const formattedDate = formatDate(currentDate);
  const isToday = formattedDate === formatDate(new Date());

  return (
    <div className="today-picks-page-content">
      <div className="page-header-tpp">
        <h1 className="page-main-title-tpp">AI 추천 종목</h1>
        <div className="date-navigator-tpp">
          <button onClick={() => handleChangeDate(-1)} className="date-nav-button-tpp" aria-label="이전 날짜">
            <FaChevronLeft />
          </button>
          <span className="current-date-display-tpp">
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            {formattedDate} ({isToday ? '오늘' : new Date(formattedDate).toLocaleDateString('ko-KR', { weekday: 'short'})})
          </span>
          <button onClick={() => handleChangeDate(1)} className="date-nav-button-tpp" disabled={isToday} aria-label="다음 날짜">
            <FaChevronRight />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-message-tpp">추천 종목을 불러오는 중입니다...</p>
      ) : picksForDate.length > 0 ? (
        <div className="picks-list-container-tpp">
          {picksForDate.map(item => (
            <RecommendedStockItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="no-data-message-tpp">{formattedDate}의 추천 종목이 없습니다.</p>
      )}
    </div>
  );
};

export default TodayPicksPage;