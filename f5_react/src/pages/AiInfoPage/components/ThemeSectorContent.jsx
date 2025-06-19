import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import './ThemeSectorContent.css'; // CSS 파일 임포트

// SectorBarChart 컴포넌트: 등락률 상하위 차트용
// 등락률 X축 레이블의 소수점 자릿수 문제를 해결하기 위해 tickFormatter 추가
const SectorBarChart = ({ data, title, barColor, yAxisOrientation = 'left' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="sector-chart-card">
                <h4>{title}</h4>
                <p className="no-data-message-chart">차트 데이터가 없습니다.</p>
            </div>
        );
    }

    const minChangeRate = Math.min(...data.map(item => item.changeRate));
    const maxChangeRate = Math.max(...data.map(item => item.changeRate));

    let xAxisDomain;
    // 등락률이 양수만 있을 경우 [0, 최대값*1.1]
    if (minChangeRate >= 0) {
        xAxisDomain = [0, Math.max(1, maxChangeRate * 1.1)];
    }
    // 등락률이 음수만 있을 경우 [최소값*1.1, 0]
    else if (maxChangeRate <= 0) {
        xAxisDomain = [Math.min(-1, minChangeRate * 1.1), 0];
    }
    // 양수/음수 모두 있을 경우 절대값 기준으로 대칭
    else {
        const absMax = Math.max(Math.abs(minChangeRate), Math.abs(maxChangeRate));
        xAxisDomain = [-absMax * 1.1, absMax * 1.1];
    }

    return (
        <div className="sector-chart-card">
            <h4>{title}</h4>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                        type="number"
                        stroke="#888"
                        tick={{ fontSize: 10 }}
                        domain={xAxisDomain}
                        // X축 레이블 소수점 자릿수 제한 및 '%' 추가
                        tickFormatter={(value) => `${value.toFixed(2)}%`}
                    />
                    <YAxis dataKey="name" type="category" stroke="#888" width={80} tick={{ fontSize: 10 }} orientation={yAxisOrientation} />
                    <Tooltip
                        // 툴팁 포맷도 X축과 일관되게 소수점 자릿수 제한
                        formatter={(value) => [`${value.toFixed(2)}%`, "등락률"]}
                        labelStyle={{ color: '#333', fontWeight: 'bold' }}
                        itemStyle={{ color: barColor }}
                        cursor={{fill: 'rgba(204,204,204,0.2)'}}
                    />
                    <Bar dataKey="changeRate" barSize={15}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={barColor} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


const ThemeSectorContent = () => {
    const [topSectors, setTopSectors] = useState([]);
    const [bottomSectors, setBottomSectors] = useState([]);
    const [sectorTrends, setSectorTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 통화 단위 포맷 함수
    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(parseFloat(value))) return "0원";
        const val = parseFloat(value);

        if (val >= 1_000_000_000_000) {
            return `${(val / 1_000_000_000_000).toFixed(1)}조`;
        } else if (val >= 100_000_000) {
            return `${(val / 100_000_000).toFixed(1)}억`;
        } else if (val >= 10_000) {
            return `${(val / 10_000).toFixed(0)}만`;
        }
        return val.toLocaleString('ko-KR');
    };

    // 거래량 단위 포맷 함수
    const formatVolume = (value) => {
        if (value === null || value === undefined || isNaN(parseFloat(value))) return "0주";
        const val = parseFloat(value);

        if (val >= 100_000_000) {
            return `${(val / 100_000_000).toFixed(1)}억주`;
        } else if (val >= 10_000) {
            return `${(val / 10_000).toFixed(0)}만주`;
        }
        return val.toLocaleString('ko-KR') + '주';
    };

    useEffect(() => {
        const fetchAndProcessSectorData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:8084/F5/stock/latest-data', {
                    withCredentials: true,
                });

                const allStockData = response.data;
                console.log("1. API에서 받아온 전체 원본 데이터:", allStockData);
                console.log("2. 받아온 데이터의 개수:", allStockData.length);

                if (allStockData.length === 0) {
                    setLoading(false);
                    setError("주식 데이터가 없습니다.");
                    return;
                }

                // --- 가장 최신 priceDate 찾기 함수 ---
                const getFormattedDateFromTimestamp = (timestamp) => {
                    if (!timestamp) return null;
                    const date = new Date(timestamp);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const getFormattedDateFromString = (dateString) => {
                    if (!dateString) return null;
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) {
                        console.warn(`경고: 유효하지 않은 날짜 문자열: ${dateString}`);
                        return null;
                    }
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                let targetTodayDateStr = null;

                if (allStockData.length > 0) {
                    let latestDateValue = 0;

                    allStockData.forEach(s => {
                        if (s.priceDate) {
                            let currentDate;
                            if (typeof s.priceDate === 'number') {
                                currentDate = new Date(s.priceDate);
                            } else if (typeof s.priceDate === 'string') {
                                currentDate = new Date(s.priceDate);
                            }

                            if (currentDate && !isNaN(currentDate.getTime())) {
                                if (currentDate.getTime() > latestDateValue) {
                                    latestDateValue = currentDate.getTime();
                                }
                            } else {
                                console.warn(`경고: ${s.stockName || s.stockCode} 종목의 priceDate(${s.priceDate})가 유효하지 않습니다.`);
                            }
                        }
                    });

                    if (latestDateValue > 0) {
                        targetTodayDateStr = getFormattedDateFromTimestamp(latestDateValue);
                    }
                }

                console.log("3. 필터링 대상 날짜 (targetTodayDateStr - 가장 최신 날짜):", targetTodayDateStr);

                let todayStockData = [];
                if (targetTodayDateStr) {
                    todayStockData = allStockData.filter(s => {
                        let formattedPriceDate = null;
                        if (typeof s.priceDate === 'number') {
                            formattedPriceDate = getFormattedDateFromTimestamp(s.priceDate);
                        } else if (typeof s.priceDate === 'string') {
                            formattedPriceDate = getFormattedDateFromString(s.priceDate);
                        }
                        return formattedPriceDate === targetTodayDateStr;
                    });
                } else {
                    setLoading(false);
                    setError(`백엔드 데이터에서 유효한 priceDate를 찾을 수 없습니다. API 응답의 priceDate 필드를 확인해주세요.`);
                    return;
                }

                console.log("4. 필터링된 오늘 날짜 데이터 (todayStockData):", todayStockData);
                console.log("5. 필터링된 오늘 날짜 데이터 개수:", todayStockData.length);


                if (todayStockData.length === 0) {
                    setLoading(false);
                    setError(`가장 최신 날짜(${targetTodayDateStr || '알 수 없음'})의 주식 데이터가 없습니다. 백엔드에서 해당 날짜의 데이터가 넘어오는지 확인해주세요.`);
                    return;
                }

                // 오늘 날짜의 모든 종목의 총 거래대금 (거래비중 계산을 위해 필요)
                const overallTodayTotalTradingValue = todayStockData.reduce((sum, s) =>
                    sum + (parseFloat(s.closePrice) * parseFloat(s.stockVolume)), 0
                );
                console.log("6. 오늘 날짜 데이터 기반 총 시장 거래대금:", overallTodayTotalTradingValue);

                // 오늘 날짜의 데이터를 업종별로 그룹화
                const groupedByStockCategory = todayStockData.reduce((acc, stock) => {
                    const category = stock.stockCategory ? stock.stockCategory.trim() : '';
                    if (!category || category === '') {
                        console.warn(`경고: 업종 정보가 없는 종목 발견: ${stock.stockName || stock.stockCode}`);
                        return acc;
                    }
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(stock);
                    return acc;
                }, {});
                console.log("7. 업종별로 그룹화된 오늘 날짜 데이터:", groupedByStockCategory);


                const calculatedSectorTrends = Object.entries(groupedByStockCategory).map(([categoryName, stocksInCategory]) => {
                    console.log(`--- 업종: ${categoryName} 계산 시작 ---`);
                    console.log(`  - 해당 업종 종목 수: ${stocksInCategory.length}`);

                    // 1. 지수 (업종 내 종목의 평균 종가)
                    const totalClosePrice = stocksInCategory.reduce((sum, s) => sum + parseFloat(s.closePrice), 0);
                    const indexValue = (stocksInCategory.length > 0 ? (totalClosePrice / stocksInCategory.length) : 0).toFixed(2);
                    console.log(`  - 총 종가: ${totalClosePrice}, 평균 지수: ${indexValue}`);

                    // 2. 업종 등락률 및 등락폭 (stockFluctuation이 개별 종목의 등락률일 경우)
                    let totalCurrentSectorValue = 0; // 업종 내 모든 종목의 (종가 * 거래량) 합계
                    let totalPreviousSectorValue = 0; // 업종 내 모든 종목의 (전일 종가 * 거래량) 합계
                    let sumOfIndividualAbsoluteChanges = 0; // 각 종목의 등락폭 합계

                    stocksInCategory.forEach(s => {
                        const currentPrice = parseFloat(s.closePrice);
                        const volume = parseFloat(s.stockVolume);
                        const fluctuationRate = parseFloat(s.stockFluctuation); // 이 값이 등락률(%)이라고 확정!

                        if (isNaN(currentPrice) || isNaN(volume) || isNaN(fluctuationRate) || volume === 0) {
                            console.warn(`경고: ${s.stockName || s.stockCode} 종목의 가격/거래량/등락률 데이터가 유효하지 않습니다.`);
                            return; // 유효하지 않은 데이터는 건너뜀
                        }

                        // 전일 종가 계산: 전일 종가 = 현재 종가 / (1 + 등락률/100)
                        // 등락률이 -100% (하한가)일 경우 0으로 나누는 것을 방지
                        const divisor = (1 + fluctuationRate / 100);
                        const previousPrice = divisor !== 0 ? (currentPrice / divisor) : 0;

                        // 각 종목의 등락폭 (절대값) 계산
                        const individualAbsoluteChange = currentPrice - previousPrice;

                        sumOfIndividualAbsoluteChanges += individualAbsoluteChange;

                        totalCurrentSectorValue += (currentPrice * volume);
                        totalPreviousSectorValue += (previousPrice * volume);
                    });

                    // 업종 전체의 평균 등락폭 (전일대비)
                    let sectorChangeAbsolute = 0;
                    if (stocksInCategory.length > 0) {
                        sectorChangeAbsolute = sumOfIndividualAbsoluteChanges / stocksInCategory.length;
                    }
                    sectorChangeAbsolute = parseFloat(sectorChangeAbsolute.toFixed(2));


                    // 업종 전체의 등락률 (거래대금 가중 평균)
                    let sectorChangeRate = 0;
                    if (totalPreviousSectorValue > 0) {
                        sectorChangeRate = ((totalCurrentSectorValue - totalPreviousSectorValue) / totalPreviousSectorValue) * 100;
                    }
                    sectorChangeRate = parseFloat(sectorChangeRate.toFixed(2));

                    console.log(`  - 업종 총 현재 거래대금(가중치): ${totalCurrentSectorValue}, 업종 총 전일 거래대금(가중치): ${totalPreviousSectorValue}`);
                    console.log(`  - 업종 등락률 (가중): ${sectorChangeRate}%, 업종 등락폭 (평균): ${sectorChangeAbsolute}`);

                    const formattedChangeAbsolute = `${sectorChangeAbsolute > 0 ? '+' : ''}${sectorChangeAbsolute.toFixed(2)}`;
                    const formattedChangeRate = `${sectorChangeRate > 0 ? '+' : ''}${sectorChangeRate.toFixed(2)}%`;


                    // 3. 거래대금 (종가 * 거래량 합계) - 기존과 동일 (totalCurrentSectorValue와 같은 값)
                    const totalTradingValue = totalCurrentSectorValue; // 이미 위에서 계산됨
                    const formattedTradingValue = formatCurrency(totalTradingValue);
                    console.log(`  - 총 거래대금: ${totalTradingValue}, 포맷팅: ${formattedTradingValue}`);

                    // 4. 거래량 (합계)
                    const totalVolume = stocksInCategory.reduce((sum, s) => sum + parseFloat(s.stockVolume), 0);
                    const formattedVolume = formatVolume(totalVolume);
                    console.log(`  - 총 거래량: ${totalVolume}, 포맷팅: ${formattedVolume}`);

                    // 5. 거래비중 (전체 시장 거래대금 대비 해당 업종 거래대금 비율)
                    const share = ((totalTradingValue / (overallTodayTotalTradingValue || 1)) * 100).toFixed(1) + '%';
                    console.log(`  - 거래비중: ${share}`);
                    console.log(`--- 업종: ${categoryName} 계산 완료 ---`);

                    return {
                        id: categoryName,
                        name: categoryName,
                        indexValue: parseFloat(indexValue).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        changeAbsolute: formattedChangeAbsolute,
                        changeRate: formattedChangeRate,
                        tradingValue: formattedTradingValue,
                        volume: formattedVolume,
                        share: share,
                        parsedChangeRate: sectorChangeRate // 등락률을 숫자값으로 저장하여 정렬에 사용
                    };
                }).sort((a,b) => b.parsedChangeRate - a.parsedChangeRate); // 전체 업종은 등락률 높은 순으로 정렬

                console.log("8. 최종 계산된 업종 동향 데이터 (sectorTrends):", calculatedSectorTrends);

                setSectorTrends(calculatedSectorTrends); // 전체 업종 동향은 그대로 유지

                // 📈 등락률 상위 TOP 5 업종: parsedChangeRate가 양수인 업종만 필터링 후 상위 5개 선택
                const top5PositiveSectors = calculatedSectorTrends
                    .filter(s => s.parsedChangeRate > 0) // 양수 등락률만 필터링
                    .slice(0, 5) // 상위 5개 선택 (이미 정렬되어 있으므로)
                    .map(s => ({ name: s.name, changeRate: s.parsedChangeRate }));
                setTopSectors(top5PositiveSectors);


                // 📉 등락률 하위 TOP 5 업종: parsedChangeRate가 음수인 업종만 필터링 후 하위 5개 선택
                const bottom5NegativeSectors = calculatedSectorTrends
                    .filter(s => s.parsedChangeRate < 0) // 음수 등락률만 필터링
                    .sort((a,b) => a.parsedChangeRate - b.parsedChangeRate) // 가장 많이 하락한(음수값이 큰) 순서로 정렬
                    .slice(0, 5) // 하위 5개 선택
                    .map(s => ({ name: s.name, changeRate: s.parsedChangeRate }));
                setBottomSectors(bottom5NegativeSectors);

            } catch (err) {
                console.error("테마/업종 데이터를 가져오거나 처리하는 데 실패했습니다:", err);
                setError("테마/업종 데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요. (참고: 백엔드에서 데이터의 priceDate 및 stockCategory 필드를 확인해주세요.)");
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessSectorData();
    }, []);

    if (loading) {
        return <p className="loading-message-tsc">테마/업종 데이터를 불러오는 중입니다...</p>;
    }

    if (error) {
        return <p className="error-message-tsc">오류: {error}</p>;
    }

    return (
        <div className="theme-sector-content-page">
            <h1 className="page-main-title-tsc">테마/업종 분석</h1>

            <section className="sector-performance-charts-section">
                <SectorBarChart
                    data={bottomSectors}
                    title="등락률 하위 TOP 5 업종"
                    barColor="#007bff"
                    yAxisOrientation="right"
                />
                <SectorBarChart
                    data={topSectors}
                    title="등락률 상위 TOP 5 업종"
                    barColor="#d9534f"
                />
            </section>

            <section className="sector-trends-table-section">
                <h2 className="section-sub-title-tsc">업종 동향</h2>
                <div className="sector-trends-table">
                    <div className="table-header-tsc">
                        <span className="col-sector-name-tsc">업종명</span>
                        <span className="col-sector-index-tsc">지수</span>
                        <span className="col-sector-change-abs-tsc">전일대비</span>
                        <span className="col-sector-change-rate-tsc">등락률</span>
                        <span className="col-sector-trading-value-tsc">거래대금</span>
                        <span className="col-sector-volume-tsc">거래량</span>
                        <span className="col-sector-share-tsc">거래비중</span>
                    </div>
                    <ul className="table-body-tsc">
                        {sectorTrends.length === 0 ? (
                            <li className="no-data-message-tsc">업종 동향 데이터가 없습니다.</li>
                        ) : (
                            sectorTrends.map(sector => (
                                <li key={sector.id} className="table-row-tsc">
                                    <span className="col-sector-name-tsc">{sector.name}</span>
                                    <span className="col-sector-index-tsc">{sector.indexValue}</span>
                                    <span className={`col-sector-change-abs-tsc ${sector.parsedChangeRate > 0 ? 'positive' : sector.parsedChangeRate < 0 ? 'negative' : 'neutral'}`}>
                                        {sector.parsedChangeRate > 0 ? '▲' : sector.parsedChangeRate < 0 ? '▼' : ''}
                                        {sector.changeAbsolute}
                                    </span>
                                    <span className={`col-sector-change-rate-tsc ${sector.parsedChangeRate > 0 ? 'positive' : sector.parsedChangeRate < 0 ? 'negative' : 'neutral'}`}>
                                        {sector.changeRate}
                                    </span>
                                    <span className="col-sector-trading-value-tsc">{sector.tradingValue}</span>
                                    <span className="col-sector-volume-tsc">{sector.volume}</span>
                                    <span className="col-sector-share-tsc">{sector.share}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default ThemeSectorContent;