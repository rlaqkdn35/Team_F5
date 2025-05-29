import React, { useState, useEffect } from 'react';
import './TodayPicksPage.css'; // CSS 파일을 위한 임포트

const TodayPicksPage = () => {
    const [marketStatus, setMarketStatus] = useState({ isOpen: false, lastUpdated: '' });
    const [topStocks, setTopStocks] = useState([]);

    useEffect(() => {
        // 첫 번째 섹션: 나스닥 장 상태 및 업데이트 시간
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // 임시로 장 운영 시간 설정 (예시: 오전 10시부터 오후 4시)
        // 실제 나스닥 개장 시간 (한국 시간 기준): 대략 밤 11시 30분 ~ 다음날 오전 6시 (서머타임 적용 시)
        // 여기서는 더미를 위해 간단한 시간으로 설정
        const isOpen = hour >= 10 && hour < 16; 
        const updatedTime = `${now.toLocaleDateString()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        setMarketStatus({ isOpen, lastUpdated: updatedTime });

        // 두 번째 섹션: 탑 종목 더미 데이터 (오름차순, 내림차순 섞어서)
        const dummyStocks = [
            { code: 'NVDA', name: 'NVIDIA Corp.', price: 950.70, changeRate: 5.80, changeAmount: 52.00, volume: '150M' },
            { code: 'AMZN', name: 'Amazon.com Inc.', price: 185.90, changeRate: -3.50, changeAmount: -6.70, volume: '110M' },
            { code: 'TSLA', name: 'Tesla Inc.', price: 178.00, changeRate: -4.00, changeAmount: -7.40, volume: '130M' },
            { code: 'AAPL', name: 'Apple Inc.', price: 175.50, changeRate: 3.25, changeAmount: 5.50, volume: '120M' },
            { code: 'AMD', name: 'Advanced Micro Devices', price: 160.40, changeRate: 4.50, changeAmount: 7.00, volume: '100M' },
            { code: 'MSFT', name: 'Microsoft Corp.', price: 420.10, changeRate: -2.10, changeAmount: -8.80, volume: '95M' },
            { code: 'META', name: 'Meta Platforms Inc.', price: 490.20, changeRate: 2.80, changeAmount: 13.50, volume: '80M' },
            { code: 'GOOGL', name: 'Alphabet Inc.', price: 170.30, changeRate: 1.50, changeAmount: 2.50, volume: '70M' },
            { code: 'NFLX', name: 'Netflix Inc.', price: 620.00, changeRate: 1.90, changeAmount: 11.50, volume: '50M' },
            { code: 'INTC', name: 'Intel Corp.', price: 30.15, changeRate: -1.20, changeAmount: -0.36, volume: '60M' },
            { code: 'SAMSUNG', name: 'Samsung Electronics', price: 75000, changeRate: 0.80, changeAmount: 600, volume: '20M' },
            { code: 'HYUNDAI', name: 'Hyundai Motor', price: 200000, changeRate: -0.50, changeAmount: -1000, volume: '5M' },
        ];

        // 등락률 절댓값 기준으로 정렬 (상위 10개)
        const sortedStocks = [...dummyStocks].sort((a, b) =>
            Math.abs(b.changeRate) - Math.abs(a.changeRate)
        ).slice(0, 10); // 상위 10개만 선택

        setTopStocks(sortedStocks);
    }, []);

    return (
        <div className="today-picks-page">
            {/* 첫 번째 섹션: 시장 상태 */}
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

            {/* 두 번째 섹션: 탑 종목 */}
            <div className="top-stocks-section">
                <h2>오늘의 탑 종목</h2>
                <div className="stock-list-header">
                    <span className="stock-rank">순위</span>
                    <span className="stock-code">종목코드</span>
                    <span className="stock-name">종목이름</span>
                    <span className="stock-price">시가</span>
                    <span className="stock-change-rate">등락률</span>
                    <span className="stock-change-amount">대비</span>
                    <span className="stock-volume">거래량</span>
                </div>
                {topStocks.map((stock, index) => (
                    <div key={stock.code} className="stock-item">
                        <span className="stock-rank">{index + 1}</span> {/* 순위 추가 */}
                        <span className="stock-code">{stock.code}</span>
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
                ))}
            </div>
        </div>
    );
};

export default TodayPicksPage;