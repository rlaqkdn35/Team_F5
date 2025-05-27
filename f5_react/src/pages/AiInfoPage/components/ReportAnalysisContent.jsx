import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 종목명, 리포트 제목 링크용
import './ReportAnalysisContent.css'; // 이 컴포넌트의 스타일 파일

// 임시 목업 데이터 (실제로는 API 호출)
const mockReportData = [
  { id: 'report1', date: '2024-05-13', stockName: '삼성전자', stockCode: '005930', currentPrice: '78,500', changeRate: '+1.20%', targetPrice: '95,000', title: 'AI 반도체 시장 선점 기대감 유효', brokerage: 'AA증권', reportUrl: '/reports/samsung_ai_outlook.pdf' },
  { id: 'report2', date: '2024-05-13', stockName: 'SK하이닉스', stockCode: '000660', currentPrice: '182,000', changeRate: '-0.55%', targetPrice: '220,000', title: '고대역폭 메모리(HBM) 수요 지속 전망', brokerage: 'BB투자증권', reportUrl: '#' },
  { id: 'report3', date: '2024-05-12', stockName: '현대차', stockCode: '005380', currentPrice: '250,000', changeRate: '+2.50%', targetPrice: '300,000', title: '1분기 호실적 발표, 하반기 신차 기대', brokerage: 'CC증권', reportUrl: '#' },
  { id: 'report4', date: '2024-05-11', stockName: '카카오', stockCode: '035720', currentPrice: '47,000', changeRate: '-1.05%', targetPrice: '60,000', title: '플랫폼 규제 완화 및 신사업 성장성 점검', brokerage: 'DD투자', reportUrl: '#' },
  { id: 'report5', date: '2024-05-10', stockName: '셀트리온', stockCode: '068270', currentPrice: '175,000', changeRate: '+0.80%', targetPrice: '210,000', title: '바이오시밀러 유럽 시장 확대 전망', brokerage: 'AA증권', reportUrl: '#' },
  // ... 15개 더 추가 (총 20개 가정)
];
for (let i = 6; i <= 20; i++) {
    mockReportData.push({
        id: `report${i}`, date: `2024-05-${String(13 - Math.floor(i/5)).padStart(2,'0')}`, stockName: `리포트종목 ${i}`, stockCode: `R00${i}`, currentPrice: `${(Math.random()*100000 + 10000).toLocaleString()}`, changeRate: `${(Math.random()*5-2).toFixed(2)}%`, targetPrice: `${(Math.random()*150000 + 50000).toLocaleString()}`, title: `분석리포트 제목 ${i} - 상세 내용입니다.`, brokerage: `EE증권`, reportUrl: '#'
    });
}


const ReportAnalysisContent = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setLoading(true);
    setTimeout(() => {
      setReports(mockReportData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <p className="loading-message-rac">리포트 분석 데이터를 불러오는 중입니다...</p>; // RAC: ReportAnalysisContent
  }

  if (reports.length === 0) {
    return <p className="no-data-message-rac">표시할 리포트가 없습니다.</p>;
  }

  return (
    <div className="report-analysis-content-page">
      <h1 className="page-main-title-rac">리포트 분석</h1>
      <div className="report-list-table-rac">
        <div className="table-header-rac">
          <span className="col-date-rac">날짜</span>
          <span className="col-stock-name-rac">종목명</span>
          <span className="col-current-price-rac">현재가</span>
          <span className="col-change-rate-rac">등락률</span>
          <span className="col-target-price-rac">목표가</span>
          <span className="col-report-title-rac">제목</span>
          <span className="col-brokerage-rac">증권사</span>
        </div>
        <ul className="table-body-rac">
          {reports.map(report => (
            <li key={report.id} className="table-row-rac">
              <span className="col-date-rac">{report.date}</span>
              <span className="col-stock-name-rac">
                <Link to={`/stock-detail/${report.stockCode}`}>{report.stockName}</Link>
              </span>
              <span className="col-current-price-rac">{report.currentPrice}</span>
              <span className={`col-change-rate-rac ${parseFloat(String(report.changeRate).replace('%','')) > 0 ? 'positive' : parseFloat(String(report.changeRate).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
                {report.changeRate}
              </span>
              <span className="col-target-price-rac">{report.targetPrice}</span>
              <span className="col-report-title-rac">
                <a href={report.reportUrl} target="_blank" rel="noopener noreferrer" title={report.title}>
                  {report.title}
                </a>
              </span>
              <span className="col-brokerage-rac">{report.brokerage}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* 페이지네이션 또는 '더보기' 버튼이 필요하다면 여기에 추가 */}
    </div>
  );
};

export default ReportAnalysisContent;