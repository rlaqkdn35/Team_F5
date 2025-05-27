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
  Legend, // 선택적으로 범례 추가 가능
} from 'recharts';
import './StockChart.css'; // 차트 컨테이너 스타일

const StockChart = ({ data, chartType = 'line' /* 현재는 line 차트만 지원하는 예시 */, chartOptions = {} }) => {
  if (!data || data.length === 0) {
    return (
      <div className="stock-chart-render-area chart-message">
        차트 데이터가 없습니다.
      </div>
    );
  }

  // Recharts는 일반적으로 dataKey로 y축 값을 참조합니다.
  // 우리 데이터는 { time: '...', value: ... } 형태이므로 dataKey="value"를 사용합니다.
  // X축은 dataKey="time"을 사용합니다.

  // 라인 차트 색상 등 옵션 처리
  const lineColor = chartOptions.lineColor || '#8884d8'; // 기본 라인 색상
  const strokeWidth = chartOptions.lineWidth || 2;

  // Y축 도메인(범위)을 데이터에 맞게 약간의 여유를 두고 설정 (선택적)
  // const yAxisDomain = [
  //   dataMin => (Math.min(0, dataMin) - Math.abs(dataMin * 0.05)).toFixed(0), 
  //   dataMax => (dataMax + Math.abs(dataMax * 0.05)).toFixed(0)
  // ];
  // 또는 간단하게:
  // const yAxisDomain = ['auto', 'auto']; 
  // 또는 Recharts가 자동으로 계산하도록 아예 생략

  return (
    <div className="stock-chart-render-area">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: (chartOptions.margin && chartOptions.margin.right) || 30, // 오른쪽 마진 (Y축 레이블 공간)
            left: (chartOptions.margin && chartOptions.margin.left) || 0,  // 왼쪽 마진
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartOptions.gridColor || "#e0e0e0"} 
          />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: chartOptions.textColor || '#666' }} 
            stroke={chartOptions.axisColor || "#ccc"}
            // tickFormatter={(timeStr) => new Date(timeStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} // 날짜 형식 변경 예시
          />
          <YAxis 
            tick={{ fontSize: 11, fill: chartOptions.textColor || '#666' }}
            stroke={chartOptions.axisColor || "#ccc"}
            // domain={yAxisDomain} // Y축 범위 자동 또는 수동 설정
            tickFormatter={(value) => value.toLocaleString()} // 숫자에 콤마 표시
            orientation={chartOptions.yAxisOrientation || "right"} // Y축을 오른쪽에 표시 (선택적)
            yAxisId="left-y-axis" // 여러 Y축 사용 시 ID 부여
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              border: '1px solid #ccc',
              borderRadius: '4px' 
            }}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
            formatter={(value, name, props) => [value.toLocaleString(), props.payload.time]} // 툴팁 내용 포맷
            // labelFormatter={(label) => new Date(label).toLocaleDateString('ko-KR')} // 툴팁 레이블(X축 값) 포맷
          />
          {/* <Legend /> */} {/* 범례 표시 원할 시 */}
          <Line
            yAxisId="left-y-axis"
            type="monotone" // 라인 타입 (예: 'linear', 'natural', 'step')
            dataKey="value" // Y축 데이터 키
            stroke={lineColor}
            strokeWidth={strokeWidth}
            dot={false} // 데이터 포인트에 점 표시 여부
            activeDot={{ r: 6 }} // 호버 시 점 크기
            name={chartOptions.seriesName || "가격"} // 범례에 표시될 이름
          />
          {/* 여기에 다른 Line (예: 이동평균선) 또는 Bar (거래량) 등을 추가할 수 있습니다. */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

StockChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired, // 'YYYY-MM-DD' 형식 권장
      value: PropTypes.number.isRequired, // 라인 차트의 Y값
      // Recharts는 다른 추가 데이터도 객체 내에 포함할 수 있습니다.
    })
  ).isRequired,
  chartType: PropTypes.oneOf(['line']), // 현재는 line만 지원하는 예시
  chartOptions: PropTypes.shape({ // Recharts 옵션은 매우 다양하므로 필요한 것만 정의
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
    })
  }),
};

export default memo(StockChart);