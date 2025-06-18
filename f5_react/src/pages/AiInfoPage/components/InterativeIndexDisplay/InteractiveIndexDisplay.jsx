import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './InteractiveIndexDisplay.css';
import MarketInfoCard from '../../../../components/common/MarketInfoCard/MarketInfoCard.jsx';
import StockChart from '../../../../components/charts/StockChart/StockChart.jsx';

// 기간 정의
const PERIODS = [
    { id: '1D', name: '1일' },
    { id: '1M', name: '1개월' },
    { id: '3M', name: '3개월' },
    { id: '1Y', name: '1년' },
    { id: 'ALL', name: '전체' }
];

const InteractiveIndexDisplay = ({ indexBasicInfo: initialIndexBasicInfo }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[2].id); // 기본 '1일'
    const [dynamicChartData, setDynamicChartData] = useState([]);
    const [marketDataLoading, setMarketDataLoading] = useState(true);
    const [marketDataError, setMarketDataError] = useState(null);
    const [currentMarketInfo, setCurrentMarketInfo] = useState(initialIndexBasicInfo);

    const getChartTimeUnit = useCallback((period) => {
        // 이 timeUnit은 StockChart의 formatDate 함수에서 사용될 포맷을 결정합니다.
        // Recharts의 XAxis 자체의 interval과는 독립적입니다.
        switch (period) {
            case '1D': return 'hourly'; // 1일은 시간 정보가 중요하므로 hourly 유지
            case '1M': return 'daily';   // 1개월은 일별 레이블
            case '3M': return 'monthly'; // 3개월은 월별 레이블
            case '1Y': return 'monthly'; // 1년은 월별 레이블 (YYYY-MM-DD 기반)
            case 'ALL': return 'yearly'; // 전체는 연도별 레이블 (YYYY-MM-DD 기반)
            default: return 'daily';
        }
    }, []);

    const fetchMarketData = useCallback(async () => {
        setMarketDataLoading(true);
        setMarketDataError(null);
        
        const indexType = initialIndexBasicInfo.name === '코스피' ? 'KOSPI' : 'KOSDAQ';

        try {
            const recentDataResponse = await axios.get(`http://localhost:8084/F5/index/daily/recent`, { withCredentials: true });
            const allIndexData = recentDataResponse.data[indexType] || [];

            // 콘솔 로그 1: API에서 받아온 원본 데이터
            console.log(`[${initialIndexBasicInfo.name}] API에서 받아온 모든 인덱스 데이터 (원본):`, allIndexData);

            // 데이터 정렬: 오래된 날짜가 먼저 오도록
            allIndexData.sort((a, b) => new Date(a.date + ' ' + a.createdAt.split('T')[1]).getTime() - new Date(b.date + ' ' + b.createdAt.split('T')[1]).getTime());


            // 일별로 그룹화 및 각 날짜의 가장 최신 데이터 선택 (공통 로직)
            const dailyDataMap = new Map(); // "YYYY-MM-DD" -> 해당 날짜의 최신 데이터 포인트
            allIndexData.forEach(item => {
                const dateKey = item.date; // "YYYY-MM-DD" 형식 (백엔드에서 date 필드를 제공한다고 가정)
                const existingItem = dailyDataMap.get(dateKey);

                // 해당 날짜의 최신 시간 데이터로 업데이트
                if (!existingItem || new Date(item.createdAt).getTime() > new Date(existingItem.createdAt).getTime()) {
                    dailyDataMap.set(dateKey, item);
                }
            });
            // Map의 값들을 배열로 변환하고 date 기준 오름차순 정렬 (차트 표시 순서)
            const aggregatedDailyData = Array.from(dailyDataMap.values())
                                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            // 콘솔 로그 2: 일별로 집계된 데이터
            console.log(`[${initialIndexBasicInfo.name}] 일별 집계된 데이터 (aggregatedDailyData):`, aggregatedDailyData);


            const now = new Date();
            const todayStr = now.toISOString().slice(0, 10);
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);

            // 1일 차트를 위한 현재 날짜의 시간별 데이터 (원본 allIndexData에서 필터링)
            const todayDataPointsHourly = allIndexData.filter(item => item.date === todayStr);

            const latestValue = todayDataPointsHourly.length > 0 ? todayDataPointsHourly[todayDataPointsHourly.length - 1].averagePrice : 0;
            
            // 어제 날짜의 마지막 데이터 포인트 (dailyDataMap에서 가져옴)
            const prevDayLastValueItem = dailyDataMap.get(yesterdayStr);
            const prevDayLastValue = prevDayLastValueItem ? prevDayLastValueItem.averagePrice : null;


            let changeValue = 0;
            let changeRate = 0;
            let changeType = 'neutral';

            if (latestValue && prevDayLastValue !== null) {
                changeValue = latestValue - prevDayLastValue;
                changeRate = (changeValue / prevDayLastValue) * 100;
                changeType = changeValue >= 0 ? 'positive' : 'negative';
            } else if (latestValue && todayDataPointsHourly.length > 1) { 
                // 오늘 데이터만 있고 어제 데이터가 없는 경우, 오늘 첫 데이터와 비교
                const firstTodayValue = todayDataPointsHourly[0].averagePrice;
                changeValue = latestValue - firstTodayValue;
                changeRate = (changeValue / firstTodayValue) * 100;
                changeType = changeValue >= 0 ? 'positive' : 'negative';
            }

            setCurrentMarketInfo({
                ...initialIndexBasicInfo,
                value: latestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                change: `${changeValue >= 0 ? '+' : ''}${changeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${changeRate.toFixed(2)}%)`,
                changeType: changeType,
            });

            let tempChartData = [];
            
            switch (selectedPeriod) {
                case '1D':
                    // 1일 데이터는 시간별 상세 데이터가 중요하므로 createdAt (ISOString) 유지
                    tempChartData = todayDataPointsHourly.map(item => ({
                        time: item.createdAt, // '2025-06-18T00:55:26.380+00:00'
                        value: item.averagePrice
                    }));
                    break;
                case '1M': // 1개월: 일별 마지막 데이터의 '날짜'만 사용
                case '3M': // 3개월: 일별 마지막 데이터의 '날짜'만 사용
                case '1Y': // 1년: 일별 마지막 데이터의 '날짜'만 사용
                case 'ALL': // 전체 기간: 일별 마지막 데이터의 '날짜'만 사용
                    let filterStartDate;
                    if (selectedPeriod === '1M') {
                        filterStartDate = new Date(now);
                        filterStartDate.setMonth(now.getMonth() - 1);
                    } else if (selectedPeriod === '3M') {
                        filterStartDate = new Date(now);
                        filterStartDate.setMonth(now.getMonth() - 3);
                    } else if (selectedPeriod === '1Y') {
                        filterStartDate = new Date(now);
                        filterStartDate.setFullYear(now.getFullYear() - 1);
                    } else { // ALL
                        filterStartDate = new Date(0); // Epoch time (가장 오래된 날짜부터)
                    }
                    filterStartDate.setHours(0, 0, 0, 0); // 시간 부분 초기화

                    // 집계된 일별 데이터를 필터링하고 차트 형식으로 변환
                    tempChartData = aggregatedDailyData
                        .filter(item => {
                            const itemDate = new Date(item.date);
                            itemDate.setHours(0, 0, 0, 0); 
                            return itemDate.getTime() >= filterStartDate.getTime();
                        })
                        .map(item => ({
                            time: item.date, // "YYYY-MM-DD" 형식으로 전달
                            value: item.averagePrice
                        }));
                    break;
                default:
                    tempChartData = [];
                    break;
            }
            // 콘솔 로그 3: 선택된 기간에 대한 최종 차트 데이터
            console.log(`[${initialIndexBasicInfo.name}] 선택된 기간 (${selectedPeriod}) 최종 차트 데이터 (tempChartData):`, tempChartData);
            setDynamicChartData(tempChartData);

        } catch (err) {
            console.error(`시장 지수 ${initialIndexBasicInfo.name} 데이터를 가져오는 중 오류 발생:`, err);
            setMarketDataError('데이터를 불러오지 못했습니다.');
            setDynamicChartData([]);
        } finally {
            setMarketDataLoading(false);
        }
    }, [initialIndexBasicInfo, selectedPeriod, getChartTimeUnit]);

    useEffect(() => {
        fetchMarketData();
    }, [fetchMarketData]);

    const chartOptions = {
        lineColor: initialIndexBasicInfo.name === '코스피' ? '#007bff' : '#28a745',
        gridColor: '#f0f0f0',
        textColor: '#333',
        extraPadding: 5,
        timeUnit: getChartTimeUnit(selectedPeriod),
    };

    const actualChartNode = marketDataLoading ? (
        <div className="chart-loading-placeholder">차트 데이터 로딩 중...</div>
    ) : marketDataError ? (
        <div className="chart-error-message">{marketDataError}</div>
    ) : dynamicChartData.length > 0 ? (
        <StockChart data={dynamicChartData} chartOptions={chartOptions} />
    ) : (
        <div className="chart-loading-placeholder">데이터가 없습니다.</div>
    );

    return (
        <div className="interactive-index-display-wrapper">
            <MarketInfoCard
                marketData={currentMarketInfo}
                chartNode={actualChartNode}
            />
            <div className="period-selector-iid">
                {PERIODS.map(period => (
                    <button
                        key={period.id}
                        className={`period-button-iid ${selectedPeriod === period.id ? 'active' : ''}`}
                        onClick={() => setSelectedPeriod(period.id)}
                    >{period.name}</button>
                ))}
            </div>
        </div>
    );
};

InteractiveIndexDisplay.propTypes = {
    indexBasicInfo: PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        change: PropTypes.string.isRequired,
        changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']).isRequired,
    }).isRequired,
};

export default InteractiveIndexDisplay;