import React, { useState, useEffect, useMemo } from 'react';
import './TodayPicksPage.css'; // CSS 파일을 위한 임포트
import { Link } from 'react-router-dom';

// Helper function to generate a single dummy stock
function generateDummyStock(index) {
    // 6자리 숫자 코드로 변경
    const numericCode = (100000 + index).toString(); 

    return {
        code: numericCode, // 6자리 숫자 코드로 변경됨
        name: `Company ${numericCode}`, // 이름도 새 코드 형식 반영 (예: Company 100000)
        price: parseFloat((Math.random() * 900 + 50).toFixed(2)),
        changeRate: parseFloat(((Math.random() - 0.5) * 15).toFixed(2)),
        changeAmount: parseFloat(((Math.random() - 0.5) * 30).toFixed(2)),
        volume: `${Math.floor(Math.random() * 190 + 10)}M`
    };
}

// Simplified helper function to generate an array of dummy stocks (이전과 동일)
function generateDummyStocks(count) {
    const stocks = [];
    for (let i = 0; i < count; i++) {
        stocks.push(generateDummyStock(i));
    }
    return stocks;
}

const TodayPicksPage = () => {
    const [marketStatus, setMarketStatus] = useState({ isOpen: false, lastUpdated: '' });
    const [fullStockList, setFullStockList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        // 시장 상태 로직 (이전과 동일)
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isOpen = hour >= 10 && hour < 16; // 임시 개장 시간
        const updatedTime = `${now.toLocaleDateString()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        setMarketStatus({ isOpen, lastUpdated: updatedTime });

        // 탑 종목 더미 데이터 (150개 생성 및 정렬)
        const generatedStocks = generateDummyStocks(150);
        const sortedStocks = [...generatedStocks].sort((a, b) =>
            Math.abs(b.changeRate) - Math.abs(a.changeRate)
        );
        setFullStockList(sortedStocks);
    }, []);

    const displayedStocks = useMemo(() => {
        if (fullStockList.length === 0) return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return fullStockList.slice(startIndex, endIndex);
    }, [fullStockList, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(fullStockList.length / itemsPerPage);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="today-picks-page">
            {/* 첫 번째 섹션: 시장 상태 (이전과 동일) */}
            <div className="market-status-section">
                <p>
                    <p>가능하면 실시간으로 짜기!</p>
                    나스닥 장 상태: {' '}
                    <span className={marketStatus.isOpen ? 'status-open' : 'status-closed'}>
                        <span className={`status-indicator ${marketStatus.isOpen ? 'open' : 'closed'}`}></span>
                        {marketStatus.isOpen ? '개장' : '폐장'}
                    </span>
                </p>
                <p>업데이트: {marketStatus.lastUpdated}</p>
            </div>

            {/* 두 번째 섹션: 탑 종목 (이전과 동일) */}
            <div className="top-stocks-section">
                <h2>오늘의 탑 종목 (총 {fullStockList.length}개)</h2>
                <div className="stock-list-header">
                    <span className="stock-rank">순위</span>
                    <span className="stock-code">종목코드</span>
                    <span className="stock-name">종목이름</span>
                    <span className="stock-price">현재가</span>
                    <span className="stock-change-rate">등락률</span>
                    <span className="stock-change-amount">대비</span>
                    <span className="stock-volume">거래량</span>
                </div>
                {displayedStocks.map((stock, index) => (
                    <Link to={`/stock-detail/${stock.code}`} key={stock.code} className='stock-link'>
                        <div className="stock-item">
                            <span className="stock-rank">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                            <span className="stock-code">{stock.code}</span> {/* 이제 6자리 숫자로 표시됨 */}
                            <span className="stock-name">{stock.name}</span>
                            <span className="stock-price">{stock.price.toFixed(2)}</span>
                            <span className={`stock-change-rate ${stock.changeRate > 0 ? 'positive' : stock.changeRate < 0 ? 'negative' : ''}`}>
                                {stock.changeRate > 0 ? '+' : ''}{stock.changeRate.toFixed(2)}%
                            </span>
                            <span className={`stock-change-amount ${stock.changeAmount > 0 ? 'positive' : stock.changeAmount < 0 ? 'negative' : ''}`}>
                                {stock.changeAmount > 0 ? '+' : ''}{stock.changeAmount.toFixed(2)}
                            </span>
                            <span className="stock-volume">{stock.volume}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination Controls (이전과 동일) */}
            {fullStockList.length > 0 && totalPages > 1 && (
                <div className="pagination-controls">
                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`page-number ${currentPage === number ? 'active' : ''}`}
                        >
                            {number}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TodayPicksPage;