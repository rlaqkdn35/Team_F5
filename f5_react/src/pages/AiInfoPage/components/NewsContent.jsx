import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NewsContent.css';

const NewsContent = () => {
    console.log("🔥 컴포넌트 렌더링 시작");

    const [newsItems, setNewsItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const loader = useRef(null);

    const fetchNews = useCallback(async () => {
        if (loading || !hasMore) {
            console.log("📌 로딩 중이거나 더 이상 데이터 없음 → 요청 중단");
            return;
        }

        console.log(`🚀 fetchNews 실행 (요청 page: ${currentPage})`);
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:8084/F5/news/list`, {
                withCredentials: true,
                params: {
                    page: currentPage,
                    size: 20,
                },
            });

            const { content, last } = response.data;

            console.log(`✅ 뉴스 데이터 수신 (count: ${content.length}, last: ${last})`);

            setNewsItems(prevItems => {
                // 중복된 newsIdx 제거 후 누적
                const existingIds = new Set(prevItems.map(item => item.newsIdx));
                const filteredNewItems = content.filter(item => !existingIds.has(item.newsIdx));
                const updated = [...prevItems, ...filteredNewItems];
                console.log("🧩 누적 뉴스 아이템 수:", updated.length);
                return updated;
            });

            setCurrentPage(prevPage => {
                const newPage = prevPage + 1;
                console.log(`📄 페이지 증가 → ${newPage}`);
                return newPage;
            });

            setHasMore(!last);
        } catch (err) {
            console.error("❌ 뉴스 데이터를 가져오는 데 실패했습니다:", err);
            setError("뉴스 데이터를 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
            console.log("🔚 fetchNews 종료 (loading: false)");
        }
    }, [currentPage, loading, hasMore]);

    useEffect(() => {
        console.log("🌟 useEffect(IntersectionObserver) 실행");

        const options = {
            root: null,
            rootMargin: "20px",
            threshold: 1.0,
        };

        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore) {
                console.log("📡 loader 요소가 화면에 나타남 → fetchNews 호출");
                fetchNews();
            }
        }, options);

        if (loader.current) {
            observer.observe(loader.current);
            console.log("🔍 loader DOM 요소 등록됨");
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
                console.log("🧹 loader DOM 요소 해제됨");
            }
        };
    }, [fetchNews, hasMore]);

    // 초기 fetch
    useEffect(() => {
        console.log("🚨 초기 useEffect → fetchNews 강제 호출");
        fetchNews();
    }, []);

    // 상세 페이지로 이동하는 함수
    const handleNewsClick = (newsIdx) => {
        console.log(`📰 뉴스 클릭됨 → newsIdx: ${newsIdx}`);
        navigate(`/news/${newsIdx}`);
    };

    // 로딩 상태에서 아무것도 없는 경우
    if (newsItems.length === 0 && loading && !error) {
        console.log("🕓 로딩 중 (뉴스 없음)");
        return <p className="loading-message-nc">뉴스 목록을 불러오는 중입니다...</p>;
    }

    if (error) {
        console.log("⚠️ 에러 상태 발생:", error);
        return <p className="error-message">오류: {error}</p>;
    }

    if (newsItems.length === 0 && !loading) {
        console.log("📭 데이터 없음 + 로딩 안 됨");
        return <p className="no-data-message-nc">표시할 뉴스가 없습니다.</p>;
    }

    return (
        <div className="news-content-page">
            <h1 className="page-main-title-nc">최신 뉴스</h1>
            <div className="news-list-container-nc">
                {newsItems.map(news => (
                    <div
                        key={news.newsIdx}
                        className="news-item-card-nc"
                        onClick={() => handleNewsClick(news.newsIdx)}
                        role="button"
                        tabIndex="0"
                    >
                        <h2 className="news-title-nc">{news.newsTitle}</h2>
                        <p className="news-summary-nc">
                            {news.newsContent ? `${news.newsContent.substring(0, 150)}...` : '내용 없음'}
                        </p>
                        <p className="news-meta-nc">
                            <span className="news-author-nc">{news.pressName}</span>
                            <span className="news-date-nc">
                                {news.newsDt ? new Date(news.newsDt).toLocaleDateString() : '날짜 정보 없음'}
                            </span>
                        </p>
                        {news.newsUrl && (
                            <a
                                href={news.newsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="news-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                원본 기사 보기
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {loading && newsItems.length > 0 && <p className="loading-message-nc">뉴스 불러오는 중...</p>}
            {!hasMore && newsItems.length > 0 && <p className="end-message-nc">모든 뉴스를 불러왔습니다.</p>}

            {/* loader 요소 (무한 스크롤 트리거) */}
            <div ref={loader} className="loader-nc"></div>
        </div>
    );
};

export default NewsContent;
