import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx';
import axios from 'axios';
import './PriceChartTab.css';

// 임시 호가 및 거래원 데이터 (이 부분은 변경하지 않습니다.)
const tempMarketData = {
    orderBook: {
        asks: [
            { price: '205,500', quantity: '24,244' }, { price: '206,000', quantity: '48,074' },
            { price: '206,500', quantity: '48,683' }, { price: '207,000', quantity: '69,349' },
            { price: '207,500', quantity: '26,276' },
        ],
        bids: [
            { price: '205,000', quantity: '12,603' }, { price: '204,500', quantity: '21,111' },
            { price: '204,000', quantity: '10,796' }, { price: '203,500', quantity: '13,383' },
            { price: '203,000', quantity: '9,599' },
        ],
    },
    brokerActivity: {
        topSellers: [
            { broker: '미래에셋증권', volume: '124,910' }, { broker: '키움증권', volume: '96,801' },
            { broker: 'NH투자증권', volume: '80,000' }, { broker: '삼성증권', volume: '70,000' },
            { broker: 'KB증권', volume: '60,000' },
        ],
        topBuyers: [
            { broker: '골드만삭스', volume: '156,074' }, { broker: '모간서울', volume: '124,306' },
            { broker: '메릴린치', volume: '90,000' }, { broker: 'JP모간', volume: '85,000' },
            { broker: 'HSBC', volume: '75,000' },
        ],
        foreignNet: { sellVol: '391,922', buyVol: '452,441', netVol: (452441 - 391922).toLocaleString(), time: '11:01' }
    }
};


const PriceChartTab = ({ stockData, stockCode }) => {
    const [allHistoricalData, setAllHistoricalData] = useState([]);
    const [latestStockData, setLatestStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('1M'); // 기본 1개월

    // 모든 과거 데이터를 백엔드에서 한 번만 가져옴
    useEffect(() => {
        const fetchAllStockHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8084/F5/stock/${stockCode}/history`, {
                    withCredentials: true,
                });

                const historyData = response.data;
                console.log(`API에서 받아온 ${stockCode}의 전체 주식 데이터:`, historyData);

                if (historyData && historyData.length > 0) {
                    // 데이터 정렬: 가장 오래된 날짜가 먼저 오도록
                    historyData.sort((a, b) => new Date(a.priceDate).getTime() - new Date(b.priceDate).getTime());
                    setAllHistoricalData(historyData);
                    // 가장 최신 데이터는 정렬된 배열의 마지막 요소
                    setLatestStockData(historyData[historyData.length - 1]);
                } else {
                    setError(`종목 코드 '${stockCode}'에 해당하는 과거 데이터를 찾을 수 없습니다.`);
                    setAllHistoricalData([]);
                    setLatestStockData(null);
                }
            } catch (err) {
                console.error(`주식 상세 데이터를 불러오는 데 실패했습니다 (코드: ${stockCode}):`, err);
                setError("주식 상세 데이터를 불러오는 데 실패했습니다. 서버 상태 및 종목 코드 확인해주세요.");
            } finally {
                setLoading(false);
            }
        };

        if (stockCode) {
            fetchAllStockHistory();
        }
    }, [stockCode]);

    // 기간에 따라 차트 데이터 필터링 및 집계 로직
    const getFilteredChartData = useCallback(() => {
        if (!allHistoricalData || allHistoricalData.length === 0) return [];

        const now = new Date();
        now.setHours(0, 0, 0, 0); // 현재 날짜의 자정으로 설정 (비교용)

        let filteredData = [];
        let filterStartDate = new Date(0); // 기본값: 모든 데이터

        // 모든 기간에 대해 일별 마지막 종가를 가져오는 공통 로직
        const dailyDataMap = new Map(); // "YYYY-MM-DD" -> 해당 날짜의 최신 데이터 포인트
        allHistoricalData.forEach(item => {
            const itemDate = new Date(item.priceDate);
            const dateKey = itemDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
            const existingItem = dailyDataMap.get(dateKey);

            // 해당 날짜의 최신 시간 데이터로 업데이트
            if (!existingItem || new Date(item.priceDate).getTime() > new Date(existingItem.priceDate).getTime()) {
                dailyDataMap.set(dateKey, item);
            }
        });

        // Map의 값들을 배열로 변환하고 priceDate 기준 오름차순 정렬
        const aggregatedDailyData = Array.from(dailyDataMap.values())
                                    .sort((a, b) => new Date(a.priceDate).getTime() - new Date(b.priceDate).getTime());


        switch (selectedPeriod) {
            case '1D':
                // 오늘 하루치 (시간 정보 유지)
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredData = allHistoricalData.filter(item => { // 1일은 시간별 데이터 모두 포함
                    const itemDate = new Date(item.priceDate);
                    return itemDate.getTime() >= filterStartDate.getTime();
                }).map(item => ({
                    time: item.priceDate, // 시간 정보 그대로 유지 (ISOString)
                    value: parseFloat(item.closePrice)
                }));
                break;

            case '1W': // 1주일: 일별 마지막 종가
                filterStartDate = new Date(now);
                filterStartDate.setDate(now.getDate() - 6); // 오늘 포함 7일
                filterStartDate.setHours(0, 0, 0, 0);

                filteredData = aggregatedDailyData
                    .filter(item => {
                        const itemDate = new Date(item.priceDate);
                        itemDate.setHours(0, 0, 0, 0); // 시간 정보 제거하고 날짜만 비교
                        return itemDate.getTime() >= filterStartDate.getTime();
                    })
                    .map(item => ({
                        time: item.priceDate.slice(0, 10), // "YYYY-MM-DD" 형식으로 전달
                        value: parseFloat(item.closePrice)
                    }));
                break;

            case '1M': // 1개월: 일별 마지막 종가
                filterStartDate = new Date(now);
                filterStartDate.setMonth(now.getMonth() - 1);
                filterStartDate.setHours(0, 0, 0, 0);

                filteredData = aggregatedDailyData
                    .filter(item => {
                        const itemDate = new Date(item.priceDate);
                        itemDate.setHours(0, 0, 0, 0); 
                        return itemDate.getTime() >= filterStartDate.getTime();
                    })
                    .map(item => ({
                        time: item.priceDate.slice(0, 10), // "YYYY-MM-DD" 형식으로 전달
                        value: parseFloat(item.closePrice)
                    }));
                break;

            case '1Y': // 1년: 일별 마지막 종가 (YYYY-MM-DD)
                filterStartDate = new Date(now);
                filterStartDate.setFullYear(now.getFullYear() - 1);
                filterStartDate.setHours(0, 0, 0, 0);

                filteredData = aggregatedDailyData
                    .filter(item => {
                        const itemDate = new Date(item.priceDate);
                        itemDate.setHours(0, 0, 0, 0); 
                        return itemDate.getTime() >= filterStartDate.getTime();
                    })
                    .map(item => ({
                        time: item.priceDate.slice(0, 10), // "YYYY-MM-DD" 형식으로 전달
                        value: parseFloat(item.closePrice)
                    }));
                break;

            case 'ALL': // 전체 기간: 일별 마지막 종가 (YYYY-MM-DD)
                // filterStartDate는 new Date(0)이므로 모든 데이터가 포함됨
                filteredData = aggregatedDailyData.map(item => ({
                    time: item.priceDate.slice(0, 10), // "YYYY-MM-DD" 형식으로 전달
                    value: parseFloat(item.closePrice)
                }));
                break;
            default:
                filteredData = [];
                break;
        }
        return filteredData;
    }, [allHistoricalData, selectedPeriod]);

    // StockChart에 전달할 timeUnit 결정 로직 (X축 레이블 형식 변경용)
    const getStockChartTimeUnit = useCallback(() => {
        switch (selectedPeriod) {
            case '1D': return 'hourly';   // 1일은 시간 단위
            case '1W': return 'daily';    // 1주일은 일별 레이블 (YYYY-MM-DD)
            case '1M': return 'daily';    // 1개월은 일별 레이블 (YYYY-MM-DD)
            case '1Y': return 'monthly';  // 1년은 월별 레이블 (YYYY-MM-DD 기반)
            case 'ALL': return 'yearly';  // 전체는 연도별 레이블 (YYYY-MM-DD 기반)
            default: return 'daily';
        }
    }, [selectedPeriod]);

    // selectedPeriod 변경 시 차트 데이터 다시 계산
    const chartData = getFilteredChartData();


    // 등락률 계산 및 포맷팅 (latestStockData 사용)
    const calculateChangeRate = (current, fluctuation) => {
        const currentNum = parseFloat(current);
        const fluctuationNum = parseFloat(fluctuation);
        if (isNaN(currentNum) || isNaN(fluctuationNum) || currentNum === 0) return '0.00%';

        const prevClose = currentNum - fluctuationNum;
        if (prevClose === 0 || isNaN(prevClose)) return '0.00%';

        const rate = (fluctuationNum / prevClose) * 100;
        const sign = rate > 0 ? '+' : '';
        return `${sign}${rate.toFixed(2)}%`;
    };

    // 등락폭 부호 및 색상 결정을 위한 유틸리티 함수 (변경 없음)
    const getChangeArrow = (fluctuation) => {
        const fluctuationNum = parseFloat(fluctuation);
        if (fluctuationNum > 0) return '▲';
        if (fluctuationNum < 0) return '▼';
        return '';
    };

    const getPriceClass = (fluctuation) => {
        const fluctuationNum = parseFloat(fluctuation);
        if (fluctuationNum > 0) return 'positive';
        if (fluctuationNum < 0) return 'negative';
        return 'neutral';
    };


    if (loading) {
        return <p className="loading-message-pct">시세 및 차트 정보를 불러오는 중입니다...</p>;
    }

    if (error) {
        return <p className="error-message-pct">오류: {error}</p>;
    }

    return (
        <div className="price-chart-tab-content">
           
            {latestStockData && (
            <div className="stock-name-display"> {/* 새 div로 감싸고 클래스 추가 */}
                <div className="stock-title">
                    {latestStockData.stockName} {/* 종목명만 여기에 */}
                </div>
            </div>
            )
            
            }
            <div className="stock-info-summary-pct">
            {latestStockData && (
                <>
                    {/* 기존 종목명 div와 <br> 태그 제거 */}
                    <div>
                        현재가: {parseFloat(latestStockData.closePrice).toLocaleString()}
                    </div>
                    <div>등락률: <span className={`change-info ${getPriceClass(latestStockData.stockFluctuation)}`}>
                        {calculateChangeRate(latestStockData.closePrice, latestStockData.stockFluctuation)}
                    </span>
                    </div>
                    <div>거래량: {parseFloat(latestStockData.stockVolume).toLocaleString()}주</div>
                    <div>시가: {parseFloat(latestStockData.openPrice).toLocaleString()}</div>
                    <div>고가: {parseFloat(latestStockData.highPrice).toLocaleString()}</div>
                    <div>저가: {parseFloat(latestStockData.lowPrice).toLocaleString()}</div>
                    <div>날짜: {latestStockData.priceDate ? new Date(latestStockData.priceDate).toLocaleDateString('ko-KR') : 'N/A'}</div>
                    <div>전일 대비 등락폭: <span className={`change-info ${getPriceClass(latestStockData.stockFluctuation)}`}>
                        {getChangeArrow(latestStockData.stockFluctuation)} {parseFloat(latestStockData.stockFluctuation).toLocaleString()}
                    </span>
                    </div>
                </>
                    )}
            </div>

            <div className="main-chart-area-pct">
                <div className="chart-controls-pct">
                    <div>
                        {['1D', '1W', '1M', '1Y', 'ALL'].map(p => <button key={p} onClick={() => setSelectedPeriod(p)} className={selectedPeriod === p ? 'active' : ''}>{p}</button>)}
                    </div>
                </div>
                {chartData.length > 0 ? (
                    <StockChart
                        data={chartData}
                        chartOptions={{
                            height: 400,
                            timeUnit: getStockChartTimeUnit(),
                            seriesName: latestStockData ? latestStockData.stockName : "주가",
                        }}
                    />
                ) : (
                    <p className="no-data-message-pct">선택된 기간에 대한 차트 데이터가 없습니다.</p>
                )}
            </div>

        </div>
    );
};

PriceChartTab.propTypes = {
    stockData: PropTypes.object,
    stockCode: PropTypes.string.isRequired,
};

export default PriceChartTab;