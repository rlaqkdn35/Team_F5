import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './IssueAnalysisContent.css';
import Slider from '../../../components/common/Slider/Slider';
import axios from 'axios'; // axios 임포트 추가

const TABS_ISSUE_ANALYSIS = [
  { id: 'aiPickedIssue', name: 'AI 선정 핵심 이슈' },
  { id: 'recentIssues', name: '최신 이슈 피드' },
];

// --- 임시 목업 데이터 ---
// AI 선정 핵심 이슈 데이터 (url 필드 추가) - 이 부분은 절대로 건드리지 않습니다.
// 사용자님께서 제공해주신 원본 aiSelectedNewsDataList를 그대로 유지합니다.
const aiSelectedNewsDataList = [
  {
    id: 'news001',
    title: '차세대 AI 반도체 기술 컨퍼런스 개최, 관련 업계 지각 변동 예고!',
    url: '/news/ai-chip-conference-2024',
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
    url: '/news/global-ai-competition',
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
    url: '/news/robot-industry-growth',
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

// 이 목업 데이터는 이제 API 호출 실패 시 사용되지 않고,
// API가 빈 배열을 반환하거나 에러 발생 시 "최신 이슈 피드가 없습니다." 메시지가 나옵니다.
// const recentIssuesData = [ /* ... */ ];
// --- 임시 목업 데이터 끝 ---


const IssueAnalysisContent = () => {
  const [activeTab, setActiveTab] = useState(TABS_ISSUE_ANALYSIS[0].id);
  const [aiPickedIssues, setAiPickedIssues] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // 데이터 로딩 시작

    if (activeTab === 'aiPickedIssue') {
      // AI 선정 핵심 이슈는 사용자님께서 제공해주신 목업 데이터를 그대로 사용합니다.
      // 이 부분은 **절대로 건드리지 않습니다.**
      setTimeout(() => {
        setAiPickedIssues(aiSelectedNewsDataList); // 사용자님 원본 aiSelectedNewsDataList 로드
        setLoading(false);
      }, 300);
    } else if (activeTab === 'recentIssues') {
      // 최신 이슈 피드: 백엔드 API 호출 로직입니다.
      const fetchRecentIssues = async () => {
        try {
          // 백엔드 API 경로를 입력하세요. (예시: 'http://localhost:8084/F5/news/recent-three-hours')
          const response = await axios.get('http://localhost:8084/F5/news/recent-24-hours');
          console.log("최신 이슈 API 응답:", response.data);

          // API에서 빈 배열을 반환할 수도 있으므로, 데이터가 있는지 확인합니다.
          if (response.data && response.data.length > 0) {
            const formattedIssues = response.data.map((issue, index) => {
              // '목차'를 위해 시간 관련 코드는 제거하고, 다른 필드만 유지합니다.
              return {
                id: issue.newsIdx || `issue_${index}`,
                title: issue.newsTitle,
                relatedStocksText: issue.relatedStocks ? issue.relatedStocks.join(', ') : '',
                summary: issue.newsSummary,
                // date: formattedTime, // '시간' 필드는 더 이상 필요 없습니다.
                url: issue.newsUrl || '#'
              };
            });
            setRecentIssues(formattedIssues);
          } else {
            // 데이터가 없거나 빈 배열인 경우, 빈 배열로 설정하여 "없습니다" 메시지가 나오도록 합니다.
            setRecentIssues([]);
          }
        } catch (error) {
          console.error("최신 이슈를 불러오는 데 실패했습니다:", error);
          // API 호출 실패 시, 빈 배열로 설정하여 "최신 이슈 피드가 없습니다." 메시지가 나오도록 합니다.
          setRecentIssues([]);
        } finally {
          setLoading(false); // 로딩 종료
        }
      };
      fetchRecentIssues();
    }
  }, [activeTab]); // activeTab이 변경될 때마다 데이터를 다시 불러옵니다.

  const renderTabContent = () => {
    if (loading) return <p className="loading-message-iac">데이터를 불러오는 중입니다...</p>;

    if (activeTab === 'aiPickedIssue') { // aiPickedIssue 탭 - 이 부분은 사용자님의 원본과 일치합니다.
      if (!aiPickedIssues || aiPickedIssues.length === 0) return <p className="no-data-message-iac">AI 선정 핵심 이슈가 없습니다.</p>;

      return (
        <div className="ai-picked-issue-slider-container">
          <Slider
            slidesToShow={1}
            slidesToScroll={1}
            autoPlay={false}
            showDots={true}
            showArrows={true}
          >
            {aiPickedIssues.map(issue => (
              <div key={issue.id} className="ai-picked-issue-slide-item">
                <div className="ai-picked-issue-card">
                  <article className="main-issue-article">
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
                    <ul className="related-stocks-table-header">
                      <span className="col-name">종목명</span>
                      <span className="col-price">현재가</span>
                      <span className="col-change-rate">등락률</span>
                      <span className="col-overview">기업개요</span>
                      <span className="col-other-issues">다른 이슈</span>
                    </ul>
                    <ul className="related-stocks-table-body">
                      {issue.relatedStocks.map(stock => (
                        <li key={stock.code} className="related-stocks-table-row">
                          <span className="col-name"><Link to={`/stock-detail/${stock.code}`}>{stock.name}</Link></span>
                          <span className="col-price">{stock.price}</span>
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
    } else if (activeTab === 'recentIssues') { // 최신 이슈 피드 탭 (API 연동 로직 적용)
      // 데이터를 받아오지 못했거나 빈 배열인 경우 "최신 이슈 피드가 없습니다." 메시지 출력
      if (!recentIssues || recentIssues.length === 0) return <p className="no-data-message-iac">최신 이슈 피드가 없습니다.</p>;

      return (
        <div className="recent-issues-table-container">
          <table className="recent-issues-table-unified">
            <thead>
              <tr className="table-header-row">
                <th className="col-index">목차</th> {/* '시간'을 '목차'로 변경 */}
                <th className="col-title">제목</th>
                <th className="col-related-stocks">연관종목</th>
                <th className="col-summary">이슈내용(1줄)</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map((issue, index) => ( // map 함수에 index 추가
                <tr key={issue.id} className="table-row">
                  <td className="col-index">{index + 1}</td> {/* 목차 번호 (1부터 시작) */}
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