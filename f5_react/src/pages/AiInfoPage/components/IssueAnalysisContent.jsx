// IssueAnalysisContent.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './IssueAnalysisContent.css';
import Slider from '../../../components/common/Slider/Slider';


const TABS_ISSUE_ANALYSIS = [
  { id: 'aiPickedIssue', name: 'AI 선정 핵심 이슈' },
  { id: 'recentIssues', name: '최신 이슈 피드' },
];

// --- 임시 목업 데이터 ---
// AI 선정 핵심 이슈 데이터 (url 필드 추가)
const aiSelectedNewsDataList = [
  {
    id: 'news001',
    title: '차세대 AI 반도체 기술 컨퍼런스 개최, 관련 업계 지각 변동 예고!',
    url: '/news/ai-chip-conference-2024', // <-- 추가된 URL
    source: 'AI 데일리',
    date: '2024-05-13',
    summary: '오늘 열린 AI 반도체 컨퍼런스에서는 기존의 한계를 뛰어넘는 새로운 아키텍처와 소재 기술이 발표되어, 향후 반도체 시장의 패러다임 변화를 이끌 것으로 전망됩니다. 특히 국내 A사, B사의 기술력이 주목받았습니다.',
    relatedStocks: [
      { code: '005930', name: '삼성전자', price: '78,000', changeRate: '+1.50%', overview: '글로벌 반도체 선두 주자, AI 칩 개발 박차', otherIssues: 'HBM3 양산 계획' },
      { code: '000660', name: 'SK하이닉스', price: '185,000', changeRate: '+2.30%', overview: 'AI 메모리 시장 경쟁력 강화', otherIssues: '고대역폭 메모리 수요 증가' },
      { code: 'A00003', name: 'AI칩스', price: '35,000', changeRate: '+5.80%', overview: 'AI 반도체 설계 전문 팹리스', otherIssues: '신규 NPU 공개' },
    ],
    comparisonChartData: { /* ... */ },
    tradingPatternData: { /* ... */ },
  },
  {
    id: 'news002',
    title: '글로벌 AI 경쟁 심화, 주요 기업 투자 확대 속도!',
    url: '/news/global-ai-competition', // <-- 추가된 URL
    source: 'Tech Insights',
    date: '2024-05-12',
    summary: '구글, 마이크로소프트 등 글로벌 IT 공룡들이 AI 기술 개발 및 스타트업 투자에 공격적으로 나서고 있습니다. 이는 AI 시장의 폭발적인 성장을 예고합니다.',
    relatedStocks: [
      { code: 'GOOGL', name: '알파벳(구글)', price: '$170.80', changeRate: '+1.91%', overview: 'AI 연구 개발 선두, Gemini AI 모델', otherIssues: '클라우드 컴퓨팅 성장' },
      { code: 'MSFT', name: '마이크로소프트', price: '$420.00', changeRate: '+1.20%', overview: '클라우드 및 OpenAI 투자', otherIssues: '기업용 AI 솔루션 확장' },
      { code: '035720', name: '카카오', price: '48,500', changeRate: '+0.80%', overview: '국내 AI 플랫폼 강화', otherIssues: '새로운 AI 서비스 출시' },
    ],
    comparisonChartData: { /* ... */ },
    tradingPatternData: { /* ... */ },
  },
  {
    id: 'news003',
    title: '로봇 산업, 스마트 팩토리 도입으로 성장 가속화',
    url: '/news/robot-industry-growth', // <-- 추가된 URL
    source: '산업뉴스',
    date: '2024-05-11',
    summary: '제조업 전반에 걸쳐 스마트 팩토리 시스템 도입이 확산되면서 로봇 수요가 급증하고 있습니다. 특히 협동 로봇과 물류 로봇 분야의 성장이 두드러집니다.',
    relatedStocks: [
      { code: '000010', name: '로봇테크', price: '12,500', changeRate: '+4.10%', overview: '산업용 로봇 제조 및 솔루션', otherIssues: '신규 스마트 팩토리 수주' },
      { code: '000020', name: '두산로보틱스', price: '85,000', changeRate: '+3.50%', overview: '협동 로봇 분야 선두', otherIssues: '글로벌 시장 진출 확대' },
    ],
    comparisonChartData: { /* ... */ },
    tradingPatternData: { /* ... */ },
  },
];


const recentIssuesData = [
  { id: 'issue001', title: '미국 소비자물가지수(CPI) 발표, 예상치 상회', relatedStocksText: '환율 민감주, 수출주', summary: '미 CPI 상승으로 연준의 금리 인하 기대감 후퇴, 달러 강세 지속 전망.', date: '11:30', url: 'https://example.com/cpi-news' }, // 외부 URL 예시
  { id: 'issue002', title: '정부, K-배터리 산업 지원 확대 발표', relatedStocksText: '2차 전지 관련주', summary: '국내 배터리 3사 및 소부장 기업 대상 R&D 및 세제 지원 강화.', date: '10:55', url: 'https://example.com/battery-news' },
  { id: 'issue003', title: 'OO바이오, 신약 임상 3상 성공적 결과 발표', relatedStocksText: 'OO바이오, 제약주', summary: '난치성 질환 치료제 개발 기대감으로 주가 급등.', date: '09:15', url: 'https://example.com/bio-news' },
  { id: 'issue004', title: '글로벌 공급망 불안정 지속, 해운 운임 상승', relatedStocksText: '해운주, 물류주', summary: '주요 해상 운송로 차질로 컨테이너선 운임 지수 연일 최고치 경신.', date: '09:01', url: 'https://example.com/shipping-news' },
  { id: 'issue005', title: '친환경 에너지 투자 급증, 태양광/풍력 수혜 기대', relatedStocksText: '신재생에너지, 태양광', summary: '각국 정부의 탄소 중립 정책 강화로 신재생에너지 분야 투자 확대.', date: '08:45', url: 'https://example.com/energy-news' },
  { id: 'issue006', title: '메타버스 산업, 신규 VR 기기 출시로 재조명', relatedStocksText: 'XR 기기, 소프트웨어', summary: '새로운 고성능 VR 기기 출시와 함께 메타버스 시장의 성장세가 기대된다.', date: '08:10', url: 'https://example.com/metaverse-news' },
  { id: 'issue007', title: '엔터테인먼트, K-콘텐츠 글로벌 흥행 지속', relatedStocksText: '엔터주, 콘텐츠주', summary: '드라마, 영화, K-팝 등 K-콘텐츠의 해외 시장 영향력이 확대되고 있다.', date: '07:50', url: 'https://example.com/kcontent-news' },
];
// --- 임시 목업 데이터 끝 ---


const IssueAnalysisContent = () => {
  const [activeTab, setActiveTab] = useState(TABS_ISSUE_ANALYSIS[0].id);
  const [aiPickedIssues, setAiPickedIssues] = useState([]); 
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'aiPickedIssue') {
      setTimeout(() => {
        setAiPickedIssues(aiSelectedNewsDataList); // 배열 데이터 로드
        setLoading(false);
      }, 300);
    } else if (activeTab === 'recentIssues') {
      setTimeout(() => {
        setRecentIssues(recentIssuesData);
        setLoading(false);
      }, 300);
    }
  }, [activeTab]);

  const renderTabContent = () => {
    if (loading) return <p className="loading-message-iac">데이터를 불러오는 중입니다...</p>;

    if (activeTab === 'aiPickedIssue') { // aiPickedIssue 탭
      if (!aiPickedIssues || aiPickedIssues.length === 0) return <p className="no-data-message-iac">AI 선정 핵심 이슈가 없습니다.</p>;

      return (
        <div className="ai-picked-issue-slider-container">
          <Slider
            slidesToShow={1} // 한 번에 하나의 AI 핵심 이슈만 보여주도록 설정
            slidesToScroll={1}
            autoPlay={false}
            showDots={true}
            showArrows={true}
          >
            {aiPickedIssues.map(issue => ( // aiPickedIssues 배열을 맵핑
              <div key={issue.id} className="ai-picked-issue-slide-item">
                <div className="ai-picked-issue-card">
                  <article className="main-issue-article">
                    {/* 뉴스 제목에 Link 컴포넌트 적용 */}
                    <h3>
                      <Link to={issue.url} className="issue-title-link">
                        {issue.title}
                      </Link>
                    </h3>
                    <p className="issue-meta">출처: {issue.source} | 날짜: {issue.date}</p>
                    <p className="issue-summary-main">{issue.summary}</p>
                  </article>

                  <h4>연관 종목 분석</h4>
                  <table className="related-stocks-table">
                    <ul className="related-stocks-table-header"> {/* table-header-iac -> related-stocks-table-header */}
                      <span className="col-name">종목명</span> {/* col-name-iac -> col-name (공통 컬럼명) */}
                      <span className="col-price">현재가</span> {/* col-price-iac -> col-price (공통 컬럼명) */}
                      <span className="col-change-rate">등락률</span> {/* col-change-rate-iac -> col-change-rate (공통 컬럼명) */}
                      <span className="col-overview">기업개요</span> {/* col-overview-iac -> col-overview */}
                      <span className="col-other-issues">다른 이슈</span> {/* col-other-issues-iac -> col-other-issues */}
                    </ul>
                    <ul className="related-stocks-table-body"> {/* table-body-iac -> related-stocks-table-body */}
                      {issue.relatedStocks.map(stock => (
                        <li key={stock.code} className="related-stocks-table-row"> {/* table-row-iac -> related-stocks-table-row */}
                          <span className="col-name"><Link to={`/stock-detail/${stock.code}`}>{stock.name}</Link></span> {/* col-name-iac -> col-name */}
                          <span className="col-price">{stock.price}</span> {/* col-price-iac -> col-price */}
                          <span className={`col-change-rate ${parseFloat(String(stock.changeRate).replace('%','')) > 0 ? 'positive' : parseFloat(String(stock.changeRate).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                            {stock.changeRate}
                          </span>
                          <span className="col-overview" title={stock.overview}>{stock.overview}</span>
                          <span className="col-other-issues" title={stock.otherIssues}>{stock.otherIssues}</span>
                        </li>
                      ))}
                    </ul>
                  </table>

                  <div className="comparison-section">
                    <h4>연관 종목 비교 분석</h4>
                    <div className="comparison-charts-placeholder">
                      연관 종목 차트 비교 / 매매 비교 영역 (구현 필요)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      );
    } else if (activeTab === 'recentIssues') { // 최신 이슈 피드 탭 (기존 테이블 유지)
      if (!recentIssues || recentIssues.length === 0) return <p className="no-data-message-iac">최근 이슈가 없습니다.</p>;
      return (
        <div className="recent-issues-table-container"> {/* 새 컨테이너 추가 */}
            <table className="recent-issues-table-unified"> {/* 클래스명 통일 및 테이블 태그 사용 */}
                <thead>
                    <tr className="table-header-row"> {/* 헤더 행 */}
                        <th className="col-time">시간</th>
                        <th className="col-title">제목</th>
                        <th className="col-related-stocks">연관종목</th>
                        <th className="col-summary">이슈내용(1줄)</th>
                    </tr>
                </thead>
                <tbody>
                    {recentIssues.map(issue => (
                        <tr key={issue.id} className="table-row"> {/* 데이터 행 */}
                            <td className="col-time">{issue.date}</td>
                            <td className="col-title">
                                {/* 내부 라우트와 외부 URL을 구분하여 Link 또는 a 태그 사용 */}
                                {issue.url && issue.url.startsWith('/') ? (
                                    <Link to={issue.url} className="issue-title-link">{issue.title}</Link>
                                ) : (
                                    <a href={issue.url || '#'} target="_blank" rel="noopener noreferrer" className="issue-title-link">{issue.title}</a>
                                )}
                            </td>
                            <td className="col-related-stocks">{issue.relatedStocksText}</td>
                            <td className="col-summary" title={issue.summary}>{issue.summary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="issue-analysis-content-page">
      <div className="issue-tabs-container">
        {TABS_ISSUE_ANALYSIS.map(tab => (
          <button
            key={tab.id}
            className={`issue-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="issue-tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default IssueAnalysisContent;