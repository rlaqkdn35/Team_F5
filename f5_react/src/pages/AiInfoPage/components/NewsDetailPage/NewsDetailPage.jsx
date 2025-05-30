import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './NewsDetailPage.css'; // 이 CSS 파일은 스타일링을 위해 필요합니다.

const NewsDetailPage = () => {
    const { id } = useParams(); // URL에서 뉴스 ID를 가져옵니다.
    const navigate = useNavigate(); // 프로그래밍 방식으로 페이지 이동을 위한 훅입니다.
    const [newsDetail, setNewsDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    // 임시 Mock 데이터입니다. 실제 애플리케이션에서는 API에서 데이터를 가져와야 합니다.
    const mockNewsData = [];
    for (let i = 1; i <= 20; i++) {
        mockNewsData.push({
            id: `news${i}`,
            title: `주요 뉴스 제목 ${i}: 시장 변동성과 AI의 역할에 대한 심층 분석 및 전망`,
            date: `2024-05-${String(14 - Math.floor(i / 5)).padStart(2, '0')}`,
            author: (i % 3 === 0) ? 'AI 투자일보' : (i % 3 === 1) ? '블록체인 뉴스' : '이코노미 리뷰',
            summary: `뉴스 내용 요약 ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            fullContent: `
                <p>이것은 <b>뉴스 ${i}</b>의 전체 내용입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                <p>이 뉴스는 시장 변동성에 대한 심층적인 분석을 제공하며, 인공지능(AI)이 미래 금융 시장에서 어떻게 중요한 역할을 할지에 대한 전망을 담고 있습니다. 최근의 기술 발전과 함께 AI는 데이터 분석, 예측 모델링, 자동화된 거래 시스템 등 다양한 분야에서 혁신을 이끌고 있습니다.</p>
                <p>전문가들은 AI의 도입이 투자 전략의 효율성을 높이고, 리스크 관리를 강화하며, 새로운 투자 기회를 창출할 것이라고 예상합니다. 그러나 동시에 AI 시스템의 투명성, 윤리적 문제, 그리고 잠재적인 시장 교란 가능성에 대한 논의도 활발하게 이루어지고 있습니다.</p>
                <p>본 뉴스의 전체 내용을 통해 독자들은 AI와 관련된 최신 동향과 함께, 이것이 개인 및 기관 투자자들에게 미칠 영향에 대해 심층적으로 이해할 수 있을 것입니다. 지속적인 연구와 개발을 통해 AI는 금융 산업의 미래를 재편할 핵심 동력이 될 것입니다.</p>
            `,
            // 관련 종목 데이터 추가 (임시 목업 데이터)
            relatedStocks: [
                { name: '삼성전자', code: '005930' },
                { name: '네이버', code: '035420' },
                { name: '카카오', code: '035720' },
            ]
        });
    }

    useEffect(() => {
        setLoading(true);
        // 뉴스 상세 정보를 가져오는 것을 시뮬레이션합니다.
        setTimeout(() => {
            const foundNews = mockNewsData.find(news => news.id === id);
            setNewsDetail(foundNews);
            setLoading(false);
            if (!foundNews) {
                // 필요하다면 "찾을 수 없음" 메시지를 표시하거나 리디렉션할 수 있습니다.
                console.warn(`ID ${id}를 가진 뉴스를 찾을 수 없습니다.`);
            }
        }, 300);
    }, [id]); // id가 변경될 때마다 useEffect를 다시 실행합니다.

    // 관련 종목 클릭 핸들러
    const handleStockClick = (stockCode) => {
        // 실제 종목 상세 페이지 경로에 맞게 수정하세요.
        // 예: /stock/005930 또는 /stock-detail?code=005930
        navigate(`/stock-detail/${stockCode}`);
    };

    if (loading) {
        return <p className="loading-message-ndp">뉴스 상세 정보를 불러오는 중입니다...</p>; // NDP: NewsDetailPage
    }

    if (!newsDetail) {
        return (
            <div className="news-detail-page">
                <p className="no-data-message-ndp">해당 뉴스를 찾을 수 없습니다.</p>
                <button onClick={() => navigate('/ai-info/news')} className="back-button-ndp">목록으로 돌아가기</button>
            </div>
        );
    }

    return (
        <div className="news-detail-page">
            <h1 className="news-detail-title-ndp">{newsDetail.title}</h1>
            <p className="news-detail-meta-ndp">
                <span className="news-detail-author-ndp">{newsDetail.author}</span>
                <span className="news-detail-date-ndp">{newsDetail.date}</span>
            </p>
            <div
                className="news-detail-full-content-ndp"
                dangerouslySetInnerHTML={{ __html: newsDetail.fullContent }}
            ></div>

            {/* 관련 종목 섹션 */}
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

            <button onClick={() => navigate('/ai-info/news')} className="back-button-ndp">목록으로 돌아가기</button>
        </div>
    );
};

export default NewsDetailPage;