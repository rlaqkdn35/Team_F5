// src/pages/AiPicksPage/components/Signal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Signal.css';

const Signal = () => {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // newsAnalysis 값에 따른 신호 타입 한글화 및 내부 타입 매핑
    // 'HOLD' 대신 'NEUTRAL' (중립)로 변경
    const signalTypeMap = {
        'positive': { text: '상승', type: 'buy' },
        'negative': { text: '하락', type: 'sell' },
        'neutral': { text: '보합', type: 'hold' }, // '보유' -> '중립'으로 변경
    };

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const response = await axios.get('http://localhost:8084/F5/news/daily-analyzed-fluctuation');
                console.log("API 응답 데이터:", response.data);

                const transformedSignals = response.data
                    .filter(item => item.relatedStockDetails && item.relatedStockDetails.length > 0)
                    .map(item => {
                        const stockDetail = item.relatedStockDetails[0];

                        const mappedSignalType = signalTypeMap[item.newsAnalysis] || { text: '알 수 없음', type: 'unknown' }; 
                        const fluctuationRate = stockDetail.stockFluctuation || 0;
                        const isPositive = fluctuationRate > 0;

                        const dateObj = new Date(item.newsDt);
                        const kstDate = new Intl.DateTimeFormat('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'Asia/Seoul'
                        }).format(dateObj);

                        return {
                            id: item.newsIdx,
                            type: mappedSignalType.type,
                            stock: stockDetail.stockName,
                            code: stockDetail.stockCode,
                            price: stockDetail.closePrice,
                            change: `${isPositive ? '+' : ''}${fluctuationRate.toFixed(2)}%`,
                            time: kstDate,
                            // strength 필드는 더 이상 사용하지 않으므로 제거
                            // strength: item.newsAnalysis === 'positive' ? '강함' : (item.newsAnalysis === 'negative' ? '강함' : '보통'),
                            reason: item.newsTitle,
                        };
                    });

                setSignals(transformedSignals);
                setError(null);
            } catch (err) {
                console.error('AI 매매 신호 데이터를 가져오는 중 오류 발생:', err);
                setError('AI 매매 신호 데이터를 불러오지 못했습니다.');
                setSignals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSignals();
    }, []);

    const displaySignals = signals;

    return (
        <div className="signal-page-container">
            <h2 className="signal-page-title">AI 매매 신호</h2>
            <p className="signal-page-description">
                AI가 분석한 실시간 매매 신호를 제공합니다.
            </p>

            {loading && <p className="loading-message">AI 매매 신호 로딩 중...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && displaySignals.length === 0 && (
                <p className="no-signal-message">
                    현재 표시할 수 있는 신호가 없습니다.
                </p>
            )}

            {!loading && !error && displaySignals.length > 0 && (
                <div className="signal-list">
                    {displaySignals.map(signal => {
                        const isPositive = parseFloat(signal.change) > 0;

                        return (
                            <div key={signal.id} className={`signal-card ${signal.type}`}>
                                <div className="signal-header">
                                    <span className={`signal-type ${signal.type}-text`}>
                                        {signalTypeMap[signal.type === 'buy' ? 'positive' : (signal.type === 'sell' ? 'negative' : 'neutral')]?.text || signal.type}
                                    </span>
                                    <span className="signal-time">{signal.time}</span>
                                </div>
                                <div className="stock-info">
                                    <span className="stock-name">{signal.stock}</span>
                                    <span className="stock-code">({signal.code})</span>
                                </div>
                                <div className="price-info">
                                    <span className="current-price">{signal.price?.toLocaleString()}원</span>
                                    {/* <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
                                        {signal.change}
                                    </span> */}
                                </div>
                                <div className="premium-info">
                                    {/* 신호 강도 표시 제거 */}
                                    {/* <p className="signal-strength">
                                        신호 강도: <strong className={strengthClassMap[signal.strength] || ''}>{signal.strength}</strong>
                                    </p> */}
                                    <p className="signal-reason">근거: {signal.reason}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Signal;