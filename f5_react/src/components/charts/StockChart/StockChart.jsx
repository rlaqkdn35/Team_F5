import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import './StockChart.css';

const StockChart = ({ data, chartOptions = {} }) => {
    if (!data || data.length === 0) {
        return (
            <div className="stock-chart-render-area chart-message">
                차트 데이터가 없습니다.
            </div>
        );
    }

    const lineColor = chartOptions.lineColor || '#8884d8';
    const strokeWidth = chartOptions.lineWidth || 2;
    const { timeUnit, seriesName, height, margin, gridColor, textColor, axisColor, yAxisOrientation, minDomain, maxDomain, extraPadding } = chartOptions;

    // Y축 도메인 계산
    const dataValues = data.map(item => item.value).filter(val => typeof val === 'number');
    const minDataValue = Math.min(...dataValues);
    const maxDataValue = Math.max(...dataValues);

    const autoPadding = (maxDataValue - minDataValue) * 0.05;
    const calculatedMin = Math.floor(minDataValue - autoPadding - (extraPadding || 0));
    const calculatedMax = Math.ceil(maxDataValue + autoPadding + (extraPadding || 0));

    const yAxisDomain = [
        minDomain !== undefined ? minDomain : calculatedMin,
        maxDomain !== undefined ? maxDomain : calculatedMax
    ];

    // --- 시간 단위별 tickFormatter 함수 정의 ---
    const getTickFormatter = (unit) => {
        return (timeStr) => {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) {
                console.warn("Invalid date string for tickFormatter:", timeStr);
                return timeStr;
            }
            switch (unit) {
                case 'hourly': // 시간별 (예: 09:30)
                    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                case 'daily': // 일별 (예: 05.20)
                    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
                case 'weekly': // 주별 (예: 05월 3주차 또는 05.20)
                    // Recharts에서 주차를 정확히 계산하기는 복잡하므로,
                    // 해당 주 중 임의의 날짜(예: 월요일)를 표시하거나,
                    // 아니면 월/일만 표시하여 간략하게 나타냅니다.
                    // 현재는 월/일만 표시하도록 유지하며, 필요 시 주차 계산 로직 추가
                    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
                case 'monthly': // 월별 (예: 05월)
                    return date.toLocaleDateString('ko-KR', { month: '2-digit' });
                case 'yearly': // 연도별 (예: 2025년)
                    return date.toLocaleDateString('ko-KR', { year: 'numeric' });
                default: // 기본값: 일별
                    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
            }
        };
    };

    // --- 툴팁 formatter 함수 정의 (날짜와 시간 모두 표시) ---
    const getTooltipFormatter = (value, name, props) => {
        const payload = props.payload;
        if (!payload || !payload.time) {
             return [value.toLocaleString(), name];
        }

        const date = new Date(payload.time);
        const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const formattedTime = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return [`${parseFloat(value).toLocaleString()}원`, `${formattedDate} ${formattedTime}`];
    };

    const getDynamicTickFormatter = (unit) => {
        let lastYear = null;
        let lastMonth = null;

        return (timeStr, index, ticks) => { // ticks 배열도 인자로 받을 수 있습니다 (Recharts 2.x 기준)
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) {
                console.warn("Invalid date string for tickFormatter:", timeStr);
                return timeStr;
            }

            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth(); // 0부터 시작

            let formattedString = '';

            switch (unit) {
                case 'hourly':
                    formattedString = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    break;
                case 'daily':
                case 'weekly': // daily와 동일하게 월/일 표시
                    // 연도가 바뀌는 시점에만 연도를 표시
                    if (currentYear !== lastYear) {
                        formattedString = `${currentYear}년 ${date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`;
                        lastYear = currentYear;
                    } else {
                        formattedString = date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
                    }
                    break;
                case 'monthly':
                    // 연도가 바뀌는 시점에만 연도를 표시, 아니면 월만 표시
                    if (currentYear !== lastYear) {
                        formattedString = `${currentYear}년 ${date.toLocaleDateString('ko-KR', { month: '2-digit' })}`;
                        lastYear = currentYear;
                    } else {
                        formattedString = date.toLocaleDateString('ko-KR', { month: '2-digit' });
                    }
                    break;
                case 'yearly': // 연도별 (예: 2025년)
                    formattedString = date.toLocaleDateString('ko-KR', { year: 'numeric' });
                    break;
                default:
                    if (currentYear !== lastYear) {
                        formattedString = `${currentYear}년 ${date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`;
                        lastYear = currentYear;
                    } else {
                        formattedString = date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
                    }
                    break;
            }
            return formattedString;
        };
    };
    
    return (
        <div className="stock-chart-render-area" style={{ height: height || 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: (margin && margin.right) || 30,
                        left: (margin && margin.left) || 0,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={gridColor || "#e0e0e0"}
                    />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: textColor || '#666' }}
                        stroke={axisColor || "#ccc"}
                        tickFormatter={getTickFormatter(timeUnit)}
                        interval="equidistant" // 레이블이 겹치지 않도록 시작과 끝 레이블 유지
                        minTickGap={20} // 최소 틱 간격
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: textColor || '#666' }}
                        stroke={axisColor || "#ccc"}
                        domain={yAxisDomain}
                        tickFormatter={(value) => value.toLocaleString()}
                        orientation={yAxisOrientation || "right"}
                        yAxisId="left-y-axis"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                        labelStyle={{ color: '#333', fontWeight: 'bold' }}
                        formatter={getTooltipFormatter}
                    />
                    <Legend />
                    <Line
                        yAxisId="left-y-axis"
                        type="monotone"
                        dataKey="value"
                        stroke={lineColor}
                        strokeWidth={strokeWidth}
                        dot={false}
                        activeDot={{ r: 6 }}
                        name={seriesName || "가격"}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

StockChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            time: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired,
        })
    ).isRequired,
    chartOptions: PropTypes.shape({
        lineColor: PropTypes.string,
        lineWidth: PropTypes.number,
        gridColor: PropTypes.string,
        textColor: PropTypes.string,
        axisColor: PropTypes.string,
        seriesName: PropTypes.string,
        yAxisOrientation: PropTypes.oneOf(['left', 'right']),
        margin: PropTypes.shape({
            top: PropTypes.number,
            right: PropTypes.number,
            bottom: PropTypes.number,
            left: PropTypes.number,
        }),
        minDomain: PropTypes.number,
        maxDomain: PropTypes.number,
        extraPadding: PropTypes.number,
        timeUnit: PropTypes.oneOf(['hourly', 'daily', 'weekly', 'monthly', 'yearly']),
        height: PropTypes.number,
    }),
};

export default memo(StockChart);