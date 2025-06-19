import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
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
        const response = await axios.get(`http://localhost:8084/F5/stockDetail/news/${stockCode}`);
        setNewsData(response.data);
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
    return <div className="news-disclosure-no-data">이 종목에 대한 최신 뉴스 및 공시가 없습니다.</div>;
  }

  return (
    <div className="news-disclosure-container">
      <h2 className="news-disclosure-title">최신 뉴스 및 공시</h2>
      <ul className="news-list">
        {newsData.map((item, index) => (
          <li key={index} className="news-item">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
              <div className="news-header">
                <span className="news-source">{item.source}</span>
                <span className="news-date">{new Date(item.date).toLocaleDateString('ko-KR')}</span>
              </div>
              <p className="news-title">{item.title}</p>
              {item.summary && <p className="news-summary">{item.summary}</p>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

NewsDisclosureTab.propTypes = {
  stockCode: PropTypes.string.isRequired,
};

export default NewsDisclosureTab;