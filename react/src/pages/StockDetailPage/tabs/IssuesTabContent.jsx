// src/pages/StockDetailPage/tabs/IssuesTabContent.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReportListTable from './ReportListTable.jsx'; // 재사용할 리포트 테이블 컴포넌트

// 임시: 이슈 목업 데이터 생성 함수
const getMockIssuesData = (stockCode) => {
  console.log(`Workspaceing issues for ${stockCode} (IssuesTabContent)`);
  const issues = [];
  for (let i = 1; i <= 7; i++) {
    const relatedStockInfo = (i % 2 === 0) ? { name: `종목 ${stockCode}`, code: stockCode, price: '123,000', change: '+1.05%' } : 
                                           { name: `연관종목 ${String.fromCharCode(65+i)}`, code: `X00${i}`, price: '45,000', change: '-0.50%' };
    issues.push({
      id: `issue_${stockCode}_${i}`,
      date: `2024-05-${String(14 - i).padStart(2, '0')}`,
      // ReportListTable에 맞추기 위한 필드 매핑:
      stockName: relatedStockInfo.name, // 이슈 관련 대표 종목
      stockCode: relatedStockInfo.code,
      currentPrice: relatedStockInfo.price, // 해당 종목 현재가 (또는 이슈 발생 시점 가격)
      changeRate: relatedStockInfo.change,  // 해당 종목 등락률
      title: `주요 시장 이슈 ${i}: ${stockCode} 및 관련 산업 영향 분석`, // 이슈 제목
      targetPrice: '-', // 이슈에는 목표가가 없으므로 빈 값 또는 '-'
      brokerage: `이슈 출처 ${i}`, // '증권사' 필드에 '이슈 출처' 정보 매핑
      reportUrl: `#issue-detail-${i}`, // 이슈 상세 내용 링크 (내부 또는 외부)
    });
  }
  return issues;
};

const IssuesTabContent = ({ stockCode, stockData }) => {
  const [issueItems, setIssueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stockCode) {
      setLoading(true);
      // 실제 API 호출: fetchIssuesForStock(stockCode).then(data => setIssueItems(data));
      setTimeout(() => { // 시뮬레이션
        setIssueItems(getMockIssuesData(stockCode));
        setLoading(false);
      }, 300);
    }
  }, [stockCode]);

  if (loading) {
    return <p className="loading-message-sdtp-tab">이슈 정보를 불러오는 중입니다...</p>; // sdtp-tab 공통 클래스
  }

  return (
    <div className="issues-tab-content">
      {/* <h2>관련 주요 이슈</h2> // 탭 이름으로 이미 표시되므로 생략 가능 */}
      <ReportListTable reports={issueItems} /> {/* 'reports' prop 이름은 유지 */}
      {/* 페이지네이션 또는 더보기 버튼이 필요하다면 여기에 추가 */}
    </div>
  );
};

IssuesTabContent.propTypes = {
  stockCode: PropTypes.string.isRequired,
  stockData: PropTypes.object,
};

export default IssuesTabContent;