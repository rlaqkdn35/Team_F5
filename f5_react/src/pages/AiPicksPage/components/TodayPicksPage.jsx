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

        const fetchTopStocks = async () => {
            setLoading(true);
            setError(null);
            console.log('[fetchTopStocks] 요청 시작');

            try {
                const response = await axios.get('http://localhost:8084/F5/stock/daily');
                console.log('[fetchTopStocks] 응답 수신:', response);

                const fetchedStocks = response.data;

                if (!Array.isArray(fetchedStocks)) {
                    console.warn('[fetchTopStocks] 데이터 형식이 배열이 아님:', fetchedStocks);
                    setError('서버에서 올바른 데이터 배열을 받지 못했습니다.');
                    setFullStockList([]);
                    return;
                }

                console.log(`[fetchTopStocks] 수신된 종목 수: ${fetchedStocks.length}`);
                const sortedStocks = [...fetchedStocks].sort((a, b) =>
                    (parseFloat(b.stockFluctuation ?? 0)) - (parseFloat(a.stockFluctuation ?? 0))
                );
                console.log('[fetchTopStocks] 정렬된 종목 리스트:', sortedStocks);

                setFullStockList(sortedStocks);
                setCurrentPage(1);
            } catch (err) {
                console.error('[fetchTopStocks] 데이터 요청 실패:', err);
                setError('데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.');
                setFullStockList([]);
            } finally {
                setLoading(false);
                console.log('[fetchTopStocks] 요청 종료');
            }
        };

        fetchTopStocks();
    }, []);

    const displayedStocks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return fullStockList.slice(startIndex, startIndex + itemsPerPage);
    }, [fullStockList, currentPage]);

    const formatStockData = (stock) => {
        const fluctuation = parseFloat(stock.stockFluctuation ?? 0);
        const priceChange = parseFloat(stock.priceChange ?? 0);
        const volume = parseFloat(stock.stockVolume ?? 0);

        const formattedChangeRate = `${fluctuation > 0 ? '+' : ''}${fluctuation.toFixed(2)}%`;
        const formattedPriceChange = `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}`;
        const formattedVolume = Number(volume).toLocaleString(undefined, { maximumFractionDigits: 0 });

        return {
            ...stock,
            formattedChangeRate,
            formattedPriceChange,
            formattedVolume,
            stockFluctuation: fluctuation,
            priceChange: priceChange,
            stockVolume: volume,
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
            <table className="stock-table">
                <thead>
                    <tr className="stock-list-header">
                        <th>순위</th>
                        <th>종목코드</th>
                        <th>종목이름</th>
                        <th>현재가</th>
                        <th>등락률</th>
                        {/* <th>대비</th> */}
                        <th>거래량</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedStocks.map((stock, index) => {
                        const formatted = formatStockData(stock);
                        return (
                            <React.Fragment key={formatted.stockCode}>
                                <tr className="stock-item" onClick={() => toggleDetails(formatted.stockCode)}>
                                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td>{String(formatted.stockCode).padStart(6, '0')}</td>
                                    <td>{formatted.stockName}</td>
                                    <td>{Number(formatted.closePrice).toLocaleString()}</td>
                                    <td className={
                                        formatted.stockFluctuation > 1 ? 'positive' :
                                        formatted.stockFluctuation < -1 ? 'negative' :
                                        'neutral' // 새로운 클래스 추가
                                    }>
                                        {formatted.formattedChangeRate}
                                    </td>
                                    {/* <td className={formatted.priceChange > 0 ? 'positive' : 'negative'}>
                                        {formatted.formattedPriceChange}
                                    </td> */}
                                    <td>{formatted.formattedVolume}</td>
                                </tr>
                                {selectedStock === formatted.stockCode && (
                                    <tr>
                                        <td colSpan="7" className="stock-details">
                                            <p>시가: {Number(formatted.openPrice).toLocaleString()}</p>
                                            <p>고가: {Number(formatted.highPrice).toLocaleString()}</p>
                                            <p>저가: {Number(formatted.lowPrice).toLocaleString()}</p>
                                            <p>날짜: {formatted.priceDate}</p>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
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
