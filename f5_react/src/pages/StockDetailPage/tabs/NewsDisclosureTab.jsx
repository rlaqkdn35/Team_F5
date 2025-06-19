import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './NewsDisclosureTab.css';

const NewsDisclosureTab = ({ stockCode }) => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8084/F5/news/${stockCode}`);
        console.log("받아온 뉴스 데이터:", response.data);
        
        // 날짜(newsDt)를 기준으로 최신순(내림차순)으로 정렬
        const sortedNewsData = response.data.sort((a, b) => {
          // Date 객체로 변환하여 비교
          const dateA = new Date(a.newsDt);
          const dateB = new Date(b.newsDt);
          return dateB - dateA; // 내림차순 정렬 (최신 날짜가 먼저 오도록)
        });

        setNewsData(sortedNewsData); // 정렬된 데이터를 상태에 설정
      } catch (err) {
        console.error("뉴스 데이터를 가져오는 데 실패했습니다:", err);
        setError("뉴스 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [stockCode]);

  if (loading) {
    return <div className="news-disclosure-loading">뉴스 정보를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="news-disclosure-error">{error}</div>;
  }

  if (newsData.length === 0) {
    return <div className="news-disclosure-no-data">이 종목에 대한 최신 뉴스가 없습니다.</div>;
  }

  return (
    <div className="news-disclosure-container">
      <h2 className="news-disclosure-title">최신 뉴스</h2>
      <table className="news-table">
        <thead>
          <tr>
            <th className="table-header source-col">언론사</th>
            <th className="table-header title-col">제목</th>
            <th className="table-header date-col">날짜</th>
          </tr>
        </thead>
        <tbody>
          {newsData.map((item) => (
            <tr key={item.newsIdx} className="news-row">
              <td className="news-cell news-source-cell">{item.pressName}</td>
              <td className="news-cell news-title-cell">
                <Link to={`/news/${item.newsIdx}`} className="news-title-link">
                  {item.newsTitle}
                </Link>
                {item.newsSummary && <p className="news-summary-inline">{item.newsSummary}</p>}
              </td>
              <td className="news-cell news-date-cell">
                {new Date(item.newsDt).toLocaleDateString('ko-KR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

NewsDisclosureTab.propTypes = {
  stockCode: PropTypes.string.isRequired,
};

export default NewsDisclosureTab;