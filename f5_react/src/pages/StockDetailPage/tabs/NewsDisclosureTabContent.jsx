// src/pages/StockDetailPage/tabs/NewsDisclosureTabContent.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReportListTable from './ReportListTable.jsx'; // 재사용할 리포트 테이블 컴포넌트

// 임시: 뉴스/공시 목업 데이터 생성 함수
const getMockNewsDisclosureData = (stockCode) => {
  console.log(`Workspaceing news/disclosures for ${stockCode} (NewsDisclosureTabContent)`);
  const items = [];
  for (let i = 1; i <= 12; i++) {
    const isNews = i % 2 === 0;
    items.push({
      id: `nd_${stockCode}_${i}`,
      date: `2024-05-${String(15 - Math.floor(i/2)).padStart(2, '0')}`,
      // ReportListTable에 맞추기 위한 필드 매핑:
      stockName: `종목 ${stockCode}`, // 뉴스/공시 대상 종목
      stockCode: stockCode,
      currentPrice: '-', // 뉴스/공시 목록에서는 현재가/등락률이 중요하지 않을 수 있음
      changeRate: '-',   // 또는 API에서 제공 시 표시
      title: isNews ? `[뉴스] ${stockCode} 관련 주요 뉴스 ${i}` : `[공시] ${stockCode} ${ (i%3===0) ? '지분변동' : '계약체결'} 공시 ${i}`,
      targetPrice: '-', // 해당 없음
      brokerage: isNews ? ['OO일보', 'XX경제', 'AI뉴스룸'][i%3] : '전자공시시스템', // '증권사' 필드에 뉴스 출처 또는 공시 출처
      reportUrl: `#news-disclosure-detail-${i}`, // 상세 내용 링크
    });
  }
  return items;
};

const NewsDisclosureTabContent = ({ stockCode, stockData }) => {
  const [newsDisclosureItems, setNewsDisclosureItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stockCode) {
      setLoading(true);
      // 실제 API 호출
      setTimeout(() => {
        setNewsDisclosureItems(getMockNewsDisclosureData(stockCode));
        setLoading(false);
      }, 300);
    }
  }, [stockCode]);

  if (loading) {
    return <p className="loading-message-sdtp-tab">뉴스/공시 정보를 불러오는 중입니다...</p>;
  }

  return (
    <div className="news-disclosure-tab-content">
      <ReportListTable reports={newsDisclosureItems} />
    </div>
  );
};

NewsDisclosureTabContent.propTypes = {
  stockCode: PropTypes.string.isRequired,
  stockData: PropTypes.object,
};

export default NewsDisclosureTabContent;