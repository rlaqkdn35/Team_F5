import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MultiAiAnalysisTab.css';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MultiAiAnalysisTab = ({ stockData, stockCode }) => {
    const [aiAnalysisData, setAiAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPredictionData = async () => {
            if (!stockCode) {
                setLoading(false);
                setAiAnalysisData(null);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8084/F5/predictions/latest-per-stock');
                if (response.status === 200 && response.data && response.data.length > 0) {
                    // stockCode와 일치하는 데이터를 찾습니다.
                    const targetPrediction = response.data.find(pred => pred.stockCode === stockCode);
                    console.log(targetPrediction);
                    if (targetPrediction) {
                        // 일치하는 데이터를 찾으면 해당 데이터로 aiAnalysisData를 설정합니다.
                        const fetchedAiPredictions = [
                            {
                                predictionDays: targetPrediction.predictionDays,
                                summary: '백엔드에서 가져온 예측 데이터를 기반으로 합니다.'
                            }
                        ];

                        setAiAnalysisData({
                            stockName: targetPrediction.stockName || `종목 ${stockCode}`,
                            aiPredictions: fetchedAiPredictions
                        });
                    } else {
                        // stockCode와 일치하는 데이터가 없으면 데이터 없음을 명확히 표시합니다.
                        console.log(`요청된 종목 코드 (${stockCode})에 대한 예측 데이터를 찾을 수 없습니다.`);
                        setAiAnalysisData(null); // 또는 특정 메시지를 표시할 수 있는 상태로 설정
                    }
                } else if (response.status === 204) {
                    console.log('예측 데이터 없음 (204 No Content).');
                    setAiAnalysisData(null);
                }
            } catch (error) {
                console.error("예측 데이터 불러오기 실패:", error);
                setAiAnalysisData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPredictionData();
    }, [stockCode]);

    const chartLabels = [
        '1일차', '2일차', '3일차', '4일차', '5일차',
        '6일차', '7일차', '8일차', '9일차', '10일차'
    ];

    const getMultiAiChartData = (aiPredictionsArray) => {
        const datasets = [];
        const colors = ['#007bff'];

        const aiPred = aiPredictionsArray[0];
        if (aiPred && aiPred.predictionDays) {
            const dataValues = [
                aiPred.predictionDays.firstDay,
                aiPred.predictionDays.secondDay,
                aiPred.predictionDays.thirdDay,
                aiPred.predictionDays.fourthDay,
                aiPred.predictionDays.fifthDay,
                aiPred.predictionDays.sixthDay,
                aiPred.predictionDays.seventhDay,
                aiPred.predictionDays.eighthDay,
                aiPred.predictionDays.ninthDay,
                aiPred.predictionDays.tenthDay
            ].filter(val => typeof val === 'number' && !isNaN(val));

            datasets.push({
                data: dataValues,
                fill: false,
                backgroundColor: colors[0],
                borderColor: colors[0],
                tension: 0.1,
                pointRadius: 3,
                pointBackgroundColor: colors[0],
                pointBorderColor: '#fff',
                pointHoverRadius: 5,
                pointHoverBorderColor: 'rgba(220,220,220,1)',
            });
        }

        return {
            labels: chartLabels.slice(0, Math.max(1, ...datasets.map(ds => ds.data.length))),
            datasets: datasets,
        };
    };

    const multiAiChartOptions = (stockName) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: `${stockName} 예측 분석`,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 10
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        if (context.parsed.y !== null) {
                            return context.parsed.y.toLocaleString();
                        }
                        return '';
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false
                },
                ticks: {
                    display: true,
                    font: {
                        size: 10
                    }
                },
                title: {
                    display: false,
                }
            },
            y: {
                display: true,
                position: 'left',
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    display: true,
                    callback: function(value) {
                        return value.toLocaleString();
                    },
                    font: {
                        size: 10
                    }
                },
                title: {
                    display: false,
                }
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 0,
                bottom: 0
            }
        }
    });

    if (loading || !aiAnalysisData || !aiAnalysisData.aiPredictions || aiAnalysisData.aiPredictions.length === 0) {
        return <p className="no-data-message-mat">AI 예측 데이터를 불러오는 중이거나 해당 종목의 예측 데이터가 없습니다.</p>;
    }

    const aiModelA = aiAnalysisData.aiPredictions[0];

    return (
        <div className="multi-ai-analysis-tab">
            <section className="aggregated-chart-section-mat">
                <h3 className="tab-section-title-mat">AI 예측 분석</h3>
                {aiModelA && aiModelA.predictionDays ? (
                    <div className="large-chart-wrapper-mat" style={{ height: '400px', width: '100%' }}>
                        <Line
                            data={getMultiAiChartData([aiModelA])}
                            options={multiAiChartOptions(aiAnalysisData.stockName)}
                        />
                    </div>
                ) : (
                    <p className="no-data-message-mat">예측 차트 데이터가 없습니다.</p>
                )}
            </section>
        </div>
    );
};

MultiAiAnalysisTab.propTypes = {
    stockData: PropTypes.object,
    stockCode: PropTypes.string.isRequired,
};

export default MultiAiAnalysisTab;
