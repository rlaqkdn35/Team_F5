import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './NewsContent.css'; // 이 컴포넌트의 스타일 파일

// 임시 목업 데이터 (실제로는 API 호출)
const mockNewsData = [];
for (let i = 1; i <= 20; i++) {
    mockNewsData.push({
        id: `news${i}`,
        title: `주요 뉴스 제목 ${i}: 시장 변동성과 AI의 역할에 대한 심층 분석 및 전망`,
        date: `2024-05-${String(14 - Math.floor(i / 5)).padStart(2, '0')}`, // 날짜 약간씩 다르게
        author: (i % 3 === 0) ? 'AI 투자일보' : (i % 3 === 1) ? '블록체인 뉴스' : '이코노미 리뷰',
        summary: `뉴스 내용 요약 ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
        // fullContent는 NewsDetailPage에서 목업 데이터에 추가할 것입니다.
    });
}

const NewsContent = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate hook

    useEffect(() => {
        // 데이터 로딩 시뮬레이션
        setLoading(true);
        setTimeout(() => {
            setNewsItems(mockNewsData);
            setLoading(false);
        }, 500);
    }, []);

    // 뉴스 아이템 클릭 시 실행될 함수
    const handleNewsClick = (newsId) => {
        // Navigate to the news detail page using the news ID
        navigate(`/news/${newsId}`);
    };

    if (loading) {
        return <p className="loading-message-nc">뉴스 목록을 불러오는 중입니다...</p>; // NC: NewsContent
    }

    if (newsItems.length === 0) {
        return <p className="no-data-message-nc">표시할 뉴스가 없습니다.</p>;
    }

    return (
        <div className="news-content-page">
            <h1 className="page-main-title-nc">최신 뉴스</h1>
            <div className="news-list-container-nc">
                {newsItems.map(news => (
                    <div
                        key={news.id}
                        className="news-item-card-nc"
                        onClick={() => handleNewsClick(news.id)}
                        role="button" // 시맨틱 및 접근성을 위해 추가
                        tabIndex="0" // 키보드 탐색 가능하도록 추가
                    >
                        <h2 className="news-title-nc">{news.title}</h2>
                        <p className="news-summary-nc">{news.summary}</p>
                        <p className="news-meta-nc">
                            <span className="news-author-nc">{news.author}</span>
                            <span className="news-date-nc">{news.date}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsContent;