import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import StockChart from '../../../components/charts/StockChart/StockChart.jsx';
// import BubbleChartComponent from '../../../components/charts/BubbleChartComponent.jsx';
import './AiInfoHomeContentPage.css'; // 여기에 모든 관련 스타일을 넣거나, 각 섹션별 CSS를 import
import StockRankings from '../../../components/common/StockRankings/StockRankings.jsx';
import MarketInfoCard from '../../../components/common/MarketInfoCard/MarketInfoCard.jsx'; // 공통 MarketInfoCard 임포트
import Slider from '../../../components/common/Slider/Slider.jsx';
import RecommendedStockCard from '../../../components/common/RecommendedStockCard/RecommendedStockCard.jsx';
import BubbleChart from '../../../components/charts/BubbleChart/BubbleChart.jsx';
import axios from 'axios';

// 코스피/코스닥 데이터 (예시)
const kospiData = { name: '코스피', value: '2,750.50', change: '+15.20 (+0.55%)', changeType: 'positive', chartData: [{ time: '2024-05-11', value: 2750.50 }] };
const kosdaqData = { name: '코스닥', value: '870.10', change: '-2.80 (-0.32%)', changeType: 'negative', chartData: [{ time: '2024-05-11', value: 870.10 }] };


// 버블 차트 데이터 및 관련 함수/컴포넌트 (예시)
const initialBubbleData = [
  { text: '삼성전자', value: 150, id: '005930' }, { text: 'SK하이닉스', value: 90, id: '000660' },
  { text: 'AI', value: 85, id: 'theme_ai' }, { text: '배터리', value: 70, id: 'theme_battery' },
  { text: '클라우드', value: 65, id: 'theme_cloud' }, { text: '로봇', value: 60, id: 'theme_robot' },
  { text: '반도체', value: 55, id: 'theme_semiconductor' }, { text: '전기차', value: 50, id: 'theme_ev' },
  { text: '바이오', value: 45, id: 'theme_bio' }, { text: '엔터테인먼트', value: 40, id: 'theme_entertainment' },
  { text: '게임', value: 35, id: 'theme_game' }, { text: 'ESG', value: 30, id: 'theme_esg' },
  { text: '신재생에너지', value: 25, id: 'theme_renewable' }, { text: '콘텐츠', value: 20, id: 'theme_content' },
];
const getDetailDataForKeyword = (keyword) => {
  if (!keyword) return null;
  return { /* ... 상세 데이터 반환 (이전 답변 참고) ... */ 
    keyword: keyword.text,
    clickFrequency: Math.floor(Math.random() * 1000),
    chartData: [ { time: '2024-05-10', value: Math.random() * 100 + 50 } ],
    relatedItems: [`${keyword.text} 관련주 A`, `${keyword.text} 관련 ETF B`],
    news: [ { id: 1, title: `${keyword.text}, 시장 관심`, url: '/news/news1' } ], //url부분에 new의 링크적기
  };
  
};
const SimpleBubbleChartPlaceholder = ({ data, onBubbleClick }) => (
  <div className="bubble-chart-placeholder-container">
    {data.map(bubble => (
      <div key={bubble.id} className="bubble-placeholder"
        style={{ width: `${bubble.value * 0.8 + 40}px`, height: `${bubble.value * 0.8 + 40}px`, fontSize: `${bubble.value * 0.05 + 10}px` }}
        onClick={() => onBubbleClick(bubble)} title={`${bubble.text} (빈도수: ${bubble.value})`}>
        {bubble.text}
      </div>
    ))}
  </div>
);
// --- 임시 데이터 및 내부 컴포넌트 정의 끝 ---
//임시데이터
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
  { rank: 10, name: '한미반도체', code: '042700', price: '140,000', changeValue: '-1,200', changeRate: '-0.85%' },
];

const aiRecommendedStocks = [
  {
    name: '엔비디아',
    code: 'NVDA',
    currentPrice: '$1,000.50',
    change: '+20.30',
    changeRate: '+2.07%',
    changeType: 'positive', // 'positive' or 'negative'
    reason: 'AI 칩 선두 기업으로, 데이터 센터 및 AI 연산 수요 폭증으로 강력한 성장세가 예상됩니다. 최신 GPU 발표로 시장 기대감이 높습니다.',
    chartData: [], // 실제 차트 데이터
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
    chartData: [],
  },
];

const AiInfoHomeContentPage = () => {
  // 버블 차트 코드 작성 부분
  // 버블 차트 관련 상태
  const [bubbleData, setBubbleData] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가

  // API 호출로 버블 데이터 가져오기 (axios.get 사용)
  useEffect(() => {
    const fetchBubbleData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8084/F5/keyword/keywordData');
        console.log(response.data);
        setBubbleData(response.data); // Axios는 자동으로 JSON 파싱
        setError(null);
      } catch (error) {
        console.error('버블 데이터를 가져오는 중 오류 발생:', error.message);
        setError('데이터를 불러오지 못했습니다. 서버를 확인하세요.');
        // 오류 발생 시 기본 데이터로 대체
        setBubbleData([
          { text: '삼성전자', value: 150, id: '005930' },
          { text: 'SK하이닉스', value: 90, id: '000660' },
          { text: 'AI', value: 85, id: 'theme_ai' },
          { text: '배터리', value: 70, id: 'theme_battery' },
          { text: '클라우드', value: 65, id: 'theme_cloud' },
          { text: '로봇', value: 60, id: 'theme_robot' },
          { text: '반도체', value: 55, id: 'theme_semiconductor' },
          { text: '전기차', value: 50, id: 'theme_ev' },
          { text: '바이오', value: 45, id: 'theme_bio' },
          { text: '엔터테인먼트', value: 40, id: 'theme_entertainment' },
          { text: '게임', value: 35, id: 'theme_game' },
          { text: 'ESG', value: 30, id: 'theme_esg' },
          { text: '신재생에너지', value: 25, id: 'theme_renewable' },
          { text: '콘텐츠', value: 20, id: 'theme_content' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBubbleData();
  }, []);

  // 버블 클릭 핸들러 (기존 코드 유지)
  const handleBubbleClick = (bubble) => {
    setSelectedKeyword(bubble);
    setDetailData({
      keyword: bubble.text,
      clickFrequency: Math.floor(Math.random() * 100), // 임시 데이터
      relatedItems: ['관련 품목 1', '관련 품목 2'],
      news: [
        { id: 1, title: '뉴스 제목 1', url: '#' },
        { id: 2, title: '뉴스 제목 2', url: '#' },
      ],
    });
  };

// 무슨 페이지인지 모름 - 김현수 작성
  const handleNavigateToIssueNews = () => {
    navigate('/ai-info/issue-analysis'); // 이슈분석 페이지의 뉴스로 이동
  };
  const handleNavigateToAirecommend = () => {
    navigate('/ai-picks'); // 이슈분석 페이지의 뉴스로 이동
  };

  //랭킹
  const [popularItems, setPopularItems] = useState(popularSearchesData);
  const [hitRateItems, setHitRateItems] = useState(topHitRatesData);
  const [profitRateItems, setProfitRateItems] = useState(topProfitRatesData);

  // AiInfoHomeContentPage.jsx (일부 수정 예시)
// ... (기존 import 및 임시 데이터) ...

return (
    <div className="ai-info-home-dashboard">
        {/* 새로운 왼쪽 컬럼 컨테이너 */}
        <div className="left-column-container">
            {/* 섹션 1: 국내 주요 지수 */}
            <section className="market-overview-section">
                <h2 className="section-title">국내 주요 지수</h2>
                <div className="market-summary-container">
                    <MarketInfoCard
                        marketData={kospiData}
                        chartNode={<div className="chart-placeholder">코스피 미니 차트</div>}
                    />
                    <MarketInfoCard
                        marketData={kosdaqData}
                        chartNode={<div className="chart-placeholder">코스닥 미니 차트</div>}
                    />
                </div>
            </section>

            {/* 주요 종목 랭킹 섹션 */}
            <section className="stock-rankings-container">
              <StockRankings
                  sectionTitle="주요 종목 랭킹"
                  popularItems={popularItems}
                  hitRateItems={hitRateItems}
                  profitRateItems={profitRateItems}
              />
            </section>
            
        </div>

        {/* 섹션 2: AI 추천 종목 */}
        <section className="ai-recommendation-section">
            <h2 className="section-title">AI 추천 종목</h2>
        <Slider
          slidesToShow={1} // 한 번에 하나의 추천 종목만 보여줌
          slidesToScroll={1} // 한 번에 한 개씩 스크롤
          autoPlay={true} // 자동 재생 활성화
          autoPlayInterval={7000} // 7초마다 자동 전환
          showDots={true} // 하단 점 표시
          showArrows={true} // 좌우 화살표 표시
        >
          {/* aiRecommendedStocks 배열을 맵핑하여 RecommendedStockCard를 슬라이더 아이템으로 전달 */}
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
            <BubbleChart
              data={bubbleData}
              onBubbleClick={handleBubbleClick}
              width={500}
              height={500}
            />
          </div>

          {selectedKeyword && detailData ? (
            <aside className="details-pane visible">
              <h3><span className="keyword-highlight">{detailData.keyword}</span> 상세정보</h3>
              <div className="detail-item"><strong>언급 빈도수:</strong> {selectedKeyword.value}</div>
              <div className="detail-item"><strong>클릭 빈도수 (예시):</strong> {detailData.clickFrequency}</div>
              <div className="detail-item detail-chart-container">
                <strong>관련 데이터 차트 (예시):</strong>
                <div className="mini-chart-placeholder">미니 차트 (150x80)</div>
              </div>
              <div className="detail-item">
                <strong>주요 품목/관련주:</strong>
                <ul>{detailData.relatedItems.map((item, index) => <li key={index}>{item}</li>)}</ul>
              </div>
              <div className="detail-item">
                <strong>최신 뉴스:</strong>
                <ul>{detailData.news.map(newsItem => (<li key={newsItem.id}><a href={newsItem.url}  target="_blank" rel="noopener noreferrer">{newsItem.title}</a></li>))}</ul>
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