import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx'; // 이전에 만든 StockChart 컴포넌트
import axios from 'axios'; // axios 추가
import './ComprehensiveAnalysisTab.css';

// 원래 있던 임시: 기업 개요 목업 데이터 생성 함수 복원
const getMockCompanyOverview = (stockName) => {
    return `${stockName}은(는) 혁신적인 기술과 뛰어난 시장 경쟁력을 바탕으로 해당 산업 분야를 선도하고 있는 기업입니다. 최근 AI 및 신기술 도입을 통해 지속적인 성장을 추구하고 있으며, 투자자들의 많은 관심을 받고 있습니다. 주요 사업 영역으로는 ... (여기에 실제 기업 개요 데이터 필요)`;
};

const ComprehensiveAnalysisTab = ({ stockData, stockCode }) => {
    const [monthlyChartData, setMonthlyChartData] = useState([]);
    // companyOverview 상태는 원래 Mock 데이터를 받아서 설정하는 용도로 사용되도록 복원
    const [companyOverview, setCompanyOverview] = useState(''); 
    const [loadingChart, setLoadingChart] = useState(true);
    const [error, setError] = useState(null); // 에러 상태 추가

    useEffect(() => {
        const fetchChartData = async () => {
            if (!stockCode) {
                setError("종목 코드가 없습니다.");
                setLoadingChart(false);
                return;
            }

            setLoadingChart(true);
            setError(null); // 새로운 로딩 시작 시 에러 초기화

            try {
                // 1. 기업 개요: Mock 데이터 로직은 그대로 유지 (원래 코드 방식)
                // stockData.companyOverview가 있다면 그것을 사용하고, 없다면 Mock을 사용 (렌더링 부분에서 처리)
                // 여기서는 기존에 Mock을 setCompanyOverview에 할당하던 로직을 그대로 둡니다.
                // 다만 실제 렌더링은 `companyOverviewText` 변수에서 담당합니다.
                setCompanyOverview(getMockCompanyOverview(stockData?.name || stockCode)); // 원래 목업 함수 호출 유지

                // 2. 1개월치 차트 데이터 가져오기 (이 부분은 이전 수정과 동일하게 API 사용)
                const response = await axios.get(`http://localhost:8084/F5/stock/${stockCode}/history`, {
                    withCredentials: true,
                });

                const historyData = response.data;
                console.log(`API에서 받아온 ${stockCode}의 전체 주식 데이터 (ComprehensiveAnalysisTab):`, historyData);

                if (historyData && historyData.length > 0) {
                    historyData.sort((a, b) => new Date(a.priceDate).getTime() - new Date(b.priceDate).getTime());

                    const now = new Date();
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    oneMonthAgo.setHours(0, 0, 0, 0); 

                    const dailyDataMap = new Map();
                    historyData.forEach(item => {
                        const itemDate = new Date(item.priceDate);
                        const dateKey = itemDate.toISOString().slice(0, 10); 
                        const existingItem = dailyDataMap.get(dateKey);

                        if (!existingItem || new Date(item.priceDate).getTime() > new Date(existingItem.priceDate).getTime()) {
                            dailyDataMap.set(dateKey, item);
                        }
                    });

                    const filteredAndAggregatedData = Array.from(dailyDataMap.values())
                        .filter(item => {
                            const itemDate = new Date(item.priceDate);
                            itemDate.setHours(0, 0, 0, 0); 
                            return itemDate.getTime() >= oneMonthAgo.getTime();
                        })
                        .sort((a, b) => new Date(a.priceDate).getTime() - new Date(b.priceDate).getTime()) 
                        .map(item => ({
                            time: item.priceDate.slice(0, 10), 
                            value: parseFloat(item.closePrice)
                        }));

                    setMonthlyChartData(filteredAndAggregatedData);
                    if (filteredAndAggregatedData.length === 0) {
                         setError("최근 1개월 차트 데이터가 없습니다.");
                    }
                } else {
                    setError(`종목 코드 '${stockCode}'에 해당하는 과거 데이터를 찾을 수 없습니다.`);
                    setMonthlyChartData([]);
                }
            } catch (err) {
                console.error(`종합 분석 데이터 (차트)를 불러오는 데 실패했습니다 (코드: ${stockCode}):`, err);
                setError("종합 분석 데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
                setMonthlyChartData([]);
                // 기업 개요는 Mock이므로 에러 상태에 영향을 받지 않도록 분리
            } finally {
                setLoadingChart(false);
            }
        };

        if (stockCode) {
            // 차트 데이터만 API에서 가져오기 위한 setTimeout 제거 (실제 API 호출이므로)
            fetchChartData();
        }
    }, [stockCode, stockData?.name]); // stockData.name도 의존성에 추가 (Mock 함수를 위해)

    // 기업 개요 텍스트는 stockData.companyOverview를 우선하고, 없으면 mock 데이터로 설정
    // 이렇게 하면 StockDetailPage에서 companyOverview가 내려오면 실제 데이터를 사용하고, 없으면 Mock을 사용
    const companyOverviewText = stockData?.companyOverview || companyOverview || '기업 개요 정보가 없습니다.';

    // stockData prop이 없을 경우 (초기 로딩 중) 메시지
    if (!stockData && loadingChart) {
        return <p className="loading-message-cat">종목 정보를 불러오는 중입니다...</p>;
    }

    return (
        <div className="comprehensive-analysis-tab">
            <section className="company-overview-section-cat">
                <h3 className="tab-section-title-cat">기업 개요</h3>
                {/* 기업 개요 로딩은 차트 로딩과 분리하지 않고 원래 코드처럼 loadingChart에 따라 표시되도록 유지 */}
                {loadingChart ? (
                    <p>기업 개요 로딩 중...</p>
                ) : (
                    <p className="overview-text-cat">{companyOverviewText}</p>
                )}
            </section>

            <section className="monthly-chart-section-cat">
                <h3 className="tab-section-title-cat">최근 1개월 주가 차트</h3>
                {loadingChart ? (
                    <div className="chart-loading-placeholder-cat" style={{height: '300px'}}>차트 데이터 로딩 중...</div>
                ) : error ? ( 
                    <p className="error-message-cat">{error}</p>
                ) : monthlyChartData.length > 0 ? (
                    <div className="chart-wrapper-cat">
                        <StockChart
                            data={monthlyChartData}
                            chartType="line"
                            chartOptions={{
                                height: 300,
                                timeUnit: 'daily', 
                                seriesName: stockData?.name || stockCode, 
                            }}
                        />
                    </div>
                ) : (
                    <p className="no-data-message-cat">최근 1개월 차트 데이터가 없습니다.</p>
                )}
            </section>
            
            {/* 여기에 AI 종합 분석 의견, 주요 재무 정보 요약 등 추가 섹션 구성 가능 */}
        </div>
    );
};

ComprehensiveAnalysisTab.propTypes = {
    stockData: PropTypes.shape({ 
        name: PropTypes.string,
        companyInfo: PropTypes.string, // companyInfo 필드 명시
    }),
    stockCode: PropTypes.string.isRequired, 
};

export default ComprehensiveAnalysisTab;