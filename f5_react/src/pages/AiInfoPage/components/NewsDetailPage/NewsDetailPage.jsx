// src/main/frontend/src/NewsDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NewsDetailPage.css';

const NewsDetailPage = () => {
    // [디버그 로그] 컴포넌트 렌더링 시작 시점
    console.log("🚀 NewsDetailPage 컴포넌트 렌더링 시작");

    // URL에서 뉴스 ID(newsIdx)를 가져옵니다.
    const { newsIdx } = useParams();
    // [디버그 로그] useParams()로부터 얻은 newsIdx 값
    console.log(`[디버그] useParams에서 추출한 newsIdx: "${newsIdx}" (타입: ${typeof newsIdx})`);

    const navigate = useNavigate();

    const [newsDetail, setNewsDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // [디버그 로그] useEffect 시작 시점
        console.log("🌟 useEffect 실행됨. newsIdx:", newsIdx);

        const fetchNewsDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log(`[NewsDetailPage] 뉴스 상세 정보 요청 시작 (newsIdx: ${newsIdx})`);
                // 백엔드 API 호출 URL
                const apiUrl = `http://localhost:8084/F5/news/detail/${newsIdx}`;
                // [디버그 로그] API 요청 URL
                console.log(`[디버그] API 요청 URL: ${apiUrl}`);

                const response = await axios.get(apiUrl, {
                    withCredentials: true,
                });
                console.log("[NewsDetailPage] API 응답 데이터:", response.data);
                setNewsDetail(response.data);
            } catch (err) {
                console.error(`[NewsDetailPage] 뉴스 상세 정보를 가져오는 데 실패했습니다 (ID: ${newsIdx}):`, err);
                if (err.response) {
                    console.error("[NewsDetailPage Error] 응답 상태:", err.response.status);
                    console.error("[NewsDetailPage Error] 응답 데이터:", err.response.data);
                    if (err.response.status === 404) {
                        setError("해당 뉴스를 찾을 수 없습니다.");
                    } else {
                        setError(`서버 응답 오류 (${err.response.status}): ${err.response.data.message || '알 수 없는 오류'}`);
                    }
                } else if (err.request) {
                    setError("네트워크 오류: 서버에 연결할 수 없습니다.");
                } else {
                    setError("요청 중 오류가 발생했습니다.");
                }
            } finally {
                setLoading(false);
                console.log("[NewsDetailPage] 뉴스 상세 정보 로딩 종료.");
            }
        };

        // newsIdx가 유효할 때만 데이터 요청
        // [디버그 로그] newsIdx 조건문 평가 결과
        console.log(`[디버그] newsIdx 유효성 검사: ${newsIdx ? '유효함' : '유효하지 않음'}`);
        if (newsIdx) {
            fetchNewsDetail();
        } else {
            setError("뉴스 ID가 제공되지 않았습니다.");
            setLoading(false);
        }
    }, [newsIdx]);

    // [디버그 로그] 렌더링 직전의 상태 값들
    console.log(`[디버그] 렌더링 전: loading=${loading}, error=${error}, newsDetail=${newsDetail ? '있음' : '없음'}`);

    // 관련 종목 클릭 핸들러
    const handleStockClick = (stockCode) => {
        console.log(`[디버그] 관련 종목 클릭됨: ${stockCode}. 종목 상세 페이지로 이동 예정.`);
        navigate(`/stock-detail/${stockCode}`);
    };

    if (loading) {
        // [디버그 로그] 로딩 중 메시지 렌더링
        console.log("⏳ 로딩 중 메시지 렌더링");
        return <p className="loading-message-ndp">뉴스 상세 정보를 불러오는 중입니다...</p>;
    }

    if (error) {
        // [디버그 로그] 오류 메시지 렌더링
        console.log(`❌ 오류 메시지 렌더링: ${error}`);
        return (
            <div className="news-detail-page">
                <p className="error-message-ndp">오류: {error}</p>
                <button onClick={() => navigate(-1)} className="back-button-ndp">목록으로 돌아가기</button>
            </div>
        );
    }

    if (!newsDetail) {
        // [디버그 로그] 뉴스 정보 없음 메시지 렌더링
        console.log("🚫 뉴스 정보 없음 메시지 렌더링");
        return (
            <div className="news-detail-page">
                <p className="no-data-message-ndp">해당 뉴스를 찾을 수 없습니다.</p>
                <button onClick={() => navigate('/news/list')} className="back-button-ndp">목록으로 돌아가기</button>
            </div>
        );
    }

    // [디버그 로그] 최종 뉴스 상세 페이지 렌더링
    console.log("✅ 뉴스 상세 페이지 최종 렌더링");
    console.log("[디버그] newsDetail 객체:", newsDetail);

    return (
        <div className="news-detail-page">
            <h1 className="news-detail-title-ndp">{newsDetail.newsTitle}</h1>
            <p className="news-detail-meta-ndp">
                <span className="news-detail-author-ndp">{newsDetail.pressName}</span>
                <span className="news-detail-date-ndp">
                    {newsDetail.newsDt ? new Date(newsDetail.newsDt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '날짜 정보 없음'}
                </span>
            </p>
            <div
                className="news-detail-full-content-ndp"
                dangerouslySetInnerHTML={{ __html: newsDetail.newsContent }}
            ></div>

            
            
            {newsDetail.relatedStocks && newsDetail.relatedStocks.length > 0 && (
                <div className="related-stocks-section-ndp">
                    <h3>관련 종목</h3>
                    <ul>
                        {newsDetail.relatedStocks.map((stock) => (
                            <li key={stock.code}>
                                <button
                                    onClick={() => handleStockClick(stock.code)}
                                    className="related-stock-button-ndp"
                                >
                                    {stock.name} ({stock.code})
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="news-detail-buttons-container"> {/* 버튼들을 감싸는 컨테이너 */}
                {newsDetail.newsUrl && (
                    <button onClick={() => window.open(newsDetail.newsUrl, '_blank', 'noopener noreferrer')} className="news-detail-original-link-button-ndp">
                        <i className="fas fa-external-link-alt"></i> 원본 기사 보러가기
                    </button>
                )}
                <button onClick={() => navigate('/news/list')} className="back-button-ndp">
                    목록으로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default NewsDetailPage;