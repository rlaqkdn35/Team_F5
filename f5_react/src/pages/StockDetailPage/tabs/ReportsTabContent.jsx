// src/pages/StockDetailPage/tabs/ReportsTabContent.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReportListTable from './ReportListTable.jsx'; // 새로 만든 리포트 테이블 컴포넌트
// import './ReportsTabContent.css'; // 이 컴포넌트 자체의 스타일이 있다면

// 임시 목업 데이터 (실제로는 stockCode 기반 API 호출)
const getMockReports = (stockCode) => {
  console.log(`Workspaceing reports for ${stockCode}`);
  const reports = [];
  for (let i = 1; i <= 10; i++) { // 10개 리포트 예시
    reports.push({
      id: `report_${stockCode}_${i}`,
      date: `2024-05-${String(14 - i).padStart(2, '0')}`,
      stockName: `종목 ${stockCode}`, // 실제로는 API 응답에 종목명이 같이 올 수 있음
      stockCode: stockCode,
      currentPrice: `${(Math.random() * 10000 + 70000).toLocaleString()}`,
      changeRate: `${(Math.random() * 4 - 2).toFixed(2)}%`,
      targetPrice: `${(Math.random() * 50000 + 80000).toLocaleString()}`,
      title: `[${stockCode}] ${['성장 전망 밝음', '투자의견 상향', '실적 개선 기대', '신기술 주목'][i%4]} - 리포트 제목 ${i}`,
      brokerage: ['AA증권', 'BB투자', 'CC리서치', 'DD증권'][i%4],
      reportUrl: '#', // 실제 리포트 링크
    });
  }
  return reports;
};

const ReportsTabContent = ({ stockCode, stockData }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stockCode) {
      setLoading(true);
      // 실제 API 호출
      // fetchReportsForStock(stockCode).then(data => setReports(data));
      setTimeout(() => { // 시뮬레이션
        setReports(getMockReports(stockCode));
        setLoading(false);
      }, 300);
    }
  }, [stockCode]);

  if (loading) {
    return <p className="loading-message-rlt">리포트 목록을 불러오는 중입니다...</p>;
  }

  return (
    <div className="reports-tab-content">
      {/* <h2>리포트 분석</h2>  // StockDetailPage.jsx의 TABS_STOCK_DETAIL에서 이미 탭 이름 표시 */}
      <ReportListTable reports={reports} />
      {/* 페이지네이션 또는 더보기 버튼이 필요하다면 여기에 추가 */}
    </div>
  );
};

ReportsTabContent.propTypes = {
  stockCode: PropTypes.string.isRequired,
  stockData: PropTypes.object, // 필요시 사용
};

export default ReportsTabContent;