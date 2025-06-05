import React, { useState, useEffect, useMemo } from 'react';
import './TodayPicksPage.css';
import axios from 'axios';

const TodayPicksPage = () => {
    const [marketStatus, setMarketStatus] = useState({ isOpen: false, lastUpdated: '' });
    const [fullStockList, setFullStockList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);

    const itemsPerPage = 15;

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isOpen = hour >= 10 && hour < 16;
        const updatedTime = `${now.toLocaleDateString()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        setMarketStatus({ isOpen, lastUpdated: updatedTime });

        const fixedDateStr = '2025-05-20 00:00:00.000000';

        const fetchTopStocks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `http://localhost:8084/F5/api/stocks/daily-top?date=${encodeURIComponent(fixedDateStr)}`
                );
                const fetchedStocks = response.data;

                if (!Array.isArray(fetchedStocks)) {
                    setError('서버에서 올바른 데이터 배열을 받지 못했습니다.');
                    setFullStockList([]);
                    return;
                }

                const sortedStocks = [...fetchedStocks].sort((a, b) => Math.abs(b.stock_fluctuation) - Math.abs(a.stock_fluctuation));
                setFullStockList(sortedStocks);
                setCurrentPage(1);
            } catch (err) {
                console.error('Failed to fetch top stocks:', err);
                setError('데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.');
                setFullStockList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopStocks();
    }, []);

    const displayedStocks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return fullStockList.slice(startIndex, endIndex);
    }, [fullStockList, currentPage]);

    const formatStockData = (stock) => {
        const formattedChangeRate = `${stock.stock_fluctuation > 0 ? '+' : ''}${stock.stock_fluctuation.toFixed(2)}%`;
        const formattedPriceChange = `${stock.priceChange > 0 ? '+' : ''}${stock.priceChange.toFixed(2)}`;
        const formattedVolume = `${(stock.stockVolume / 1000000).toFixed(0)}M`;

        return {
            ...stock,
            formattedChangeRate,
            formattedPriceChange,
            formattedVolume
        };
    };

    const toggleDetails = (stockCode) => {
        setSelectedStock(selectedStock === stockCode ? null : stockCode);
    };

    const totalPages = Math.ceil(fullStockList.length / itemsPerPage);

    return (
        <div className="today-picks-page">
            <div className="market-status-section">
                <p>
                    나스닥 장 상태:{' '}
                    <span className={marketStatus.isOpen ? 'status-open' : 'status-closed'}>
                        <span className={`status-indicator ${marketStatus.isOpen ? 'open' : 'closed'}`}></span>
                        {marketStatus.isOpen ? '개장' : '폐장'}
                    </span>
                </p>
                <p>업데이트: {marketStatus.lastUpdated}</p>
            </div>

            <div className="top-stocks-section">
                <h2>오늘의 탑 종목 (총 {fullStockList.length}개)</h2>

                {loading && <p>데이터를 불러오는 중입니다...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && fullStockList.length === 0 && <p>표시할 종목 데이터가 없습니다.</p>}

                {!loading && !error && fullStockList.length > 0 && (
                    <>
                        <div className="stock-list-header">
                            <span>순위</span>
                            <span>종목코드</span>
                            <span>종목이름</span>
                            <span>현재가</span>
                            <span>등락률</span>
                            <span>대비</span>
                            <span>거래량</span>
                        </div>
                        {displayedStocks.map((stock, index) => {
                            const formatted = formatStockData(stock);
                            return (
                                <div key={formatted.stockCode} className="stock-item">
                                    <div
                                        className="stock-summary"
                                        onClick={() => toggleDetails(formatted.stockCode)}
                                    >
                                        <span>{(currentPage - 1) * itemsPerPage + index + 1}</span>
                                        <span>{formatted.stockCode}</span>
                                        <span>{formatted.stockName}</span>
                                        <span>{formatted.closePrice.toLocaleString()}</span>
                                        <span className={formatted.stockFluctuation > 0 ? 'positive' : 'negative'}>
                                            {formatted.formattedChangeRate}
                                        </span>
                                        <span className={formatted.priceChange > 0 ? 'positive' : 'negative'}>
                                            {formatted.formattedPriceChange}
                                        </span>
                                        <span>{formatted.formattedVolume}</span>
                                    </div>

                                    {selectedStock === formatted.stockCode && (
                                        <div className="stock-details">
                                            <p>시가: {formatted.openPrice.toLocaleString()}</p>
                                            <p>고가: {formatted.highPrice.toLocaleString()}</p>
                                            <p>저가: {formatted.lowPrice.toLocaleString()}</p>
                                            <p>날짜: {formatted.priceDate}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {fullStockList.length > 0 && totalPages > 1 && (
                <div className="pagination-controls">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TodayPicksPage;
