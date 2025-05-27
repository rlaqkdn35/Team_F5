import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './ReportListTable.css'; // 이 컴포넌트의 스타일 파일

const ReportListTable = ({ reports = [] }) => {
  if (reports.length === 0) {
    return <p className="no-data-message-rlt">표시할 리포트가 없습니다.</p>; // RLT: ReportListTable
  }

  return (
    <div className="report-list-table-rlt">
      <div className="table-header-rlt">
        <span className="col-date-rlt">날짜</span>
        <span className="col-stock-name-rlt">종목명</span>
        <span className="col-current-price-rlt">현재가</span>
        <span className="col-change-rate-rlt">등락률</span>
        <span className="col-target-price-rlt">목표가</span>
        <span className="col-report-title-rlt">제목</span>
        <span className="col-brokerage-rlt">증권사</span>
      </div>
      <ul className="table-body-rlt">
        {reports.map(report => (
          <li key={report.id} className="table-row-rlt">
            <span className="col-date-rlt">{report.date}</span>
            <span className="col-stock-name-rlt">
              <Link to={`/stock-detail/${report.stockCode}`}>{report.stockName}</Link>
            </span>
            <span className="col-current-price-rlt">{report.currentPrice}</span>
            <span className={`col-change-rate-rlt ${parseFloat(String(report.changeRate).replace('%','')) > 0 ? 'positive' : parseFloat(String(report.changeRate).replace('%','')) < 0 ? 'negative' : 'neutral'}`}>
              {report.changeRate}
            </span>
            <span className="col-target-price-rlt">{report.targetPrice}</span>
            <span className="col-report-title-rlt">
              {/* 실제 리포트 원문 URL이 있다면 target="_blank" 사용 */}
              <a href={report.reportUrl || '#'} target="_blank" rel="noopener noreferrer" title={report.title}>
                {report.title}
              </a>
            </span>
            <span className="col-brokerage-rlt">{report.brokerage}</span>
          </li>
        ))}
      </ul>
      {/* 이 테이블을 위한 페이지네이션이나 '더보기'가 필요하다면 여기에 추가 */}
    </div>
  );
};

ReportListTable.propTypes = {
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      stockName: PropTypes.string,
      stockCode: PropTypes.string,
      currentPrice: PropTypes.string,
      changeRate: PropTypes.string,
      targetPrice: PropTypes.string,
      title: PropTypes.string,
      brokerage: PropTypes.string,
      reportUrl: PropTypes.string,
    })
  ),
};

export default ReportListTable;