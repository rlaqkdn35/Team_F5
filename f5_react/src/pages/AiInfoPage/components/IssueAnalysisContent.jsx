import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './IssueAnalysisContent.css';
import Slider from '../../../components/common/Slider/Slider';
import axios from 'axios';

// recharts 임포트
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TABS_ISSUE_ANALYSIS = [
  { id: 'aiPickedIssue', name: 'AI 선정 핵심 이슈' },
  { id: 'recentIssues', name: '최신 이슈 피드' },
];

// StockChart 컴포넌트 정의
const StockChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>차트 데이터를 불러올 수 없습니다.</p>;
  }

  // 데이터 날짜 형식 변환 (YYYY-MM-DD) 및 정렬 (오름차순)
  const formattedData = data
    .map(item => ({
      ...item,
      priceDate: new Date(item.priceDate).toLocaleDateString('ko-KR').slice(0, -1).replace(/\s/g, ''), // "YYYY. MM. DD."에서 "YYYY.MM.DD"로
    }))
    .sort((a, b) => new Date(a.priceDate) - new Date(b.priceDate)); // 날짜 오름차순 정렬

  // Y축 도메인 계산
  const prices = formattedData.map(item => item.closePrice);
  const dataMin = Math.min(...prices);
  const dataMax = Math.max(...prices);

  // 최솟값에서 5% 빼고, 최댓값에서 5% 더하기
  const yAxisDomain = [
    Math.floor(dataMin * 0.95), // 최솟값의 95% (내림)
    Math.ceil(dataMax * 1.05)   // 최댓값의 105% (올림)
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="priceDate"
          angle={-45}
          textAnchor="end"
          height={60}
          tickFormatter={(tick) => {
            const dateParts = tick.split('.'); // "YYYY.MM.DD"
            return `${dateParts[1]}/${dateParts[2]}`; // "MM/DD" 형식으로 표시
          }}
        />
        <YAxis domain={yAxisDomain} /> {/* Y축 도메인 설정 적용 */}
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="closePrice"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          name="종가"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};


const IssueAnalysisContent = () => {
  const [activeTab, setActiveTab] = useState(TABS_ISSUE_ANALYSIS[0].id);
  const [aiPickedIssues, setAiPickedIssues] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // 데이터 로딩 시작

    if (activeTab === 'aiPickedIssue') {
      const fetchAiPickedIssues = async () => {
        try {
          const response = await axios.get('http://localhost:8084/F5/news/top5-with-details');
          console.log("AI 선정 핵심 이슈 API 응답:", response.data);

          if (response.data && response.data.length > 0) {
            const formattedAiIssues = response.data.map(issue => ({
              id: issue.newsIdx.toString(),
              title: issue.newsTitle,
              url: `/news/${issue.newsIdx}`,
              source: issue.pressName,
              date: issue.newsDt ? new Date(issue.newsDt).toLocaleDateString('ko-KR') : '',
              summary: issue.newsSummary,
              relatedStocks: issue.relatedStocks ? issue.relatedStocks.map(stock => ({
                code: stock.stockCode,
                name: stock.stockName,
                price: stock.stockPrices && stock.stockPrices.length > 0 ? stock.stockPrices[0].closePrice.toLocaleString() : 'N/A', // 최신 종가
                changeRate: stock.stockPrices && stock.stockPrices.length > 0 ? `${stock.stockPrices[0].stockFluctuation}%` : 'N/A', // 최신 등락률
                overview: stock.companyInfo,
                otherIssues: '다른 이슈 정보 없음', // API에 없으므로 임시
                stockPrices: stock.stockPrices || [], // 차트 데이터를 위해 추가
              })) : [],
              comparisonChartData: {},
              tradingPatternData: {},
            }));
            setAiPickedIssues(formattedAiIssues);
          } else {
            setAiPickedIssues([]);
          }
        } catch (error) {
          console.error("AI 선정 핵심 이슈를 불러오는 데 실패했습니다:", error);
          setAiPickedIssues([]);
        } finally {
          setLoading(false);
        }
      };
      fetchAiPickedIssues();
    } else if (activeTab === 'recentIssues') {
      const fetchRecentIssues = async () => {
        try {
          const response = await axios.get('http://localhost:8084/F5/news/recent-24-hours');
          console.log("최신 이슈 API 응답:", response.data);

          if (response.data && response.data.length > 0) {
            const formattedIssues = response.data.map((issue, index) => {
              return {
                id: issue.newsIdx || `issue_${index}`,
                title: issue.newsTitle,
                relatedStocksText: issue.relatedStocks ? issue.relatedStocks.map(s => s.stockName).join(', ') : '',
                summary: issue.newsSummary,
                url: issue.newsUrl || '#'
              };
            });
            setRecentIssues(formattedIssues);
          } else {
            setRecentIssues([]);
          }
        } catch (error) {
          console.error("최신 이슈를 불러오는 데 실패했습니다:", error);
          setRecentIssues([]);
        } finally {
          setLoading(false);
        }
      };
      fetchRecentIssues();
    }
  }, [activeTab]);

  const renderTabContent = () => {
    if (loading) return <p className="loading-message-iac">데이터를 불러오는 중입니다...</p>;

    if (activeTab === 'aiPickedIssue') {
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
                    <thead>
                      <tr>
                        <th className="col-name">종목명</th>
                        <th className="col-price">현재가</th>
                        <th className="col-change-rate">등락률</th>
                        <th className="col-overview">기업개요</th>
                      </tr>
                    </thead>
                    {/* 👇 여기를 수정했습니다: <tbody> 바로 뒤에 JSX 표현식이 오도록 붙여씁니다. */}
                    <tbody>{issue.relatedStocks && issue.relatedStocks.length > 0 ? (
                      issue.relatedStocks.map(stock => (
                        <tr key={stock.code} className="related-stocks-table-row">
                          <td className="col-name"><Link to={`/stock-detail/${stock.code}`}>{stock.name}</Link></td>
                          <td className="col-price">{stock.price}</td>
                          <td className={`col-change-rate ${parseFloat(String(stock.changeRate).replace('%','')) > 0 ? 'positive' : parseFloat(String(stock.changeRate).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                            {stock.changeRate}
                          </td>
                          <td className="col-overview" title={stock.overview}>{stock.overview}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="no-related-stock">연관 종목 정보가 없습니다.</td></tr>
                    )}</tbody>
                  </table>

                  <div className="comparison-section">
                    <h4>연관 종목 비교 분석</h4>
                    <div className="comparison-charts-container">
                      {issue.relatedStocks && issue.relatedStocks.length > 0 ? (
                        issue.relatedStocks.map(stock => (
                          <div key={`${stock.code}-chart`} className="stock-chart-wrapper">
                            <h5>{stock.name} 주가 추이</h5>
                            <StockChart data={stock.stockPrices} />
                          </div>
                        ))
                      ) : (
                        <p className="no-data-message-iac">연관 종목의 차트 데이터가 없습니다.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      );
    } else if (activeTab === 'recentIssues') {
      if (!recentIssues || recentIssues.length === 0) return <p className="no-data-message-iac">최신 이슈 피드가 없습니다.</p>;

      return (
        <div className="recent-issues-table-container">
          <table className="recent-issues-table-unified">
            <thead>
              <tr className="table-header-row">
                <th className="col-index">목차</th>
                <th className="col-title">제목</th>
                <th className="col-related-stocks">연관종목</th>
                <th className="col-summary">AI 요약</th>
              </tr>
            </thead>
            {/* 👇 여기를 수정했습니다: <tbody> 바로 뒤에 JSX 표현식이 오도록 붙여씁니다. */}
            <tbody>{recentIssues.map((issue, index) => (
              <tr key={issue.id} className="table-row">
                <td className="col-index">{index + 1}</td>
                <td className="col-title">
                  {issue.url && issue.url.startsWith('/') ? (
                      <Link to={issue.url} className="issue-title-link">{issue.title}</Link>
                  ) : (
                      <a href={issue.url || '#'} target="_blank" rel="noopener noreferrer" className="issue-title-link">{issue.title}</a>
                  )}
                </td>
                <td className="col-related-stocks">{issue.relatedStocksText}</td>
                <td className="col-summary" title={issue.summary}>{issue.summary}</td>
              </tr>
            ))}</tbody>
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