import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ThemeSectorContent.css';

// --- 임시 목업 데이터 ---
const topPerformingSectorsData = [
  { name: 'AI 반도체', changeRate: 15.2 },
  { name: '2차 전지 소재', changeRate: 12.8 },
  { name: '로봇 자동화', changeRate: 10.5 },
  { name: '신재생 에너지', changeRate: 9.7 },
  { name: '바이오시밀러', changeRate: 8.1 },
];

const bottomPerformingSectorsData = [
  { name: '건설 기자재', changeRate: -5.3 },
  { name: '해운 물류', changeRate: -4.1 },
  { name: '섬유 의류', changeRate: -3.5 },
  { name: '여행 항공', changeRate: -2.0 },
  { name: '내수 유통', changeRate: -1.2 },
];

const sectorTrendsData = [
  { id: 'sec1', name: 'AI 반도체', indexValue: '1,250.50', changeAbsolute: '+30.10', changeRate: '+2.47%', tradingValue: '5.2조', volume: '1.8억주', share: '15.5%' },
  { id: 'sec2', name: '2차 전지 소재', indexValue: '880.70', changeAbsolute: '+15.60', changeRate: '+1.80%', tradingValue: '3.1조', volume: '9천만주', share: '9.2%' },
  { id: 'sec3', name: '바이오 제약', indexValue: '1,050.00', changeAbsolute: '-5.20', changeRate: '-0.49%', tradingValue: '2.5조', volume: '1.1억주', share: '7.4%' },
  { id: 'sec4', name: '자동차 부품', indexValue: '760.20', changeAbsolute: '+8.10', changeRate: '+1.08%', tradingValue: '1.9조', volume: '7천만주', share: '5.6%' },
  { id: 'sec5', name: '엔터테인먼트', indexValue: '620.90', changeAbsolute: '-10.40', changeRate: '-1.64%', tradingValue: '1.5조', volume: '6천만주', share: '4.5%' },
];
// --- 임시 목업 데이터 끝 ---

// SectorBarChart 컴포넌트
// commonMaxAbsChangeRate prop 제거, yAxisOrientation prop은 유지
const SectorBarChart = ({ data, title, barColor, yAxisOrientation = 'left' }) => {
  // 데이터에 따라 X축 도메인 개별적으로 설정
  const minChangeRate = Math.min(...data.map(item => item.changeRate));
  const maxChangeRate = Math.max(...data.map(item => item.changeRate));

  let xAxisDomain;
  if (minChangeRate >= 0) { // 모든 값이 양수 (상위 업종)
      xAxisDomain = [0, 'auto']; // 0부터 시작하여 양수 방향으로
  } else if (maxChangeRate <= 0) { // 모든 값이 음수 (하위 업종)
      xAxisDomain = ['auto', 0]; // 음수 방향에서 0으로 끝남
  } else { // 양수/음수 혼재 (현재 데이터 구조에서는 발생하지 않음)
      xAxisDomain = ['dataMin', 'dataMax'];
  }

  return (
    <div className="sector-chart-card">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          {/* xAxisDomain을 다시 개별적으로 계산된 값으로 설정 */}
          <XAxis type="number" stroke="#888" tick={{ fontSize: 10 }} domain={xAxisDomain} />
          {/* yAxisOrientation prop에 따라 Y축 위치 변경 */}
          <YAxis dataKey="name" type="category" stroke="#888" width={80} tick={{ fontSize: 10 }} orientation={yAxisOrientation} />
          <Tooltip
            formatter={(value) => [`${value}%`, "등락률"]}
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
  // commonMaxAbsChangeRate 상태 제거

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTopSectors(topPerformingSectorsData);
      setBottomSectors(bottomPerformingSectorsData.sort((a,b) => a.changeRate - b.changeRate)); 

      const processedTrends = sectorTrendsData.map(sector => ({
        ...sector,
        parsedChangeRate: parseFloat(String(sector.changeRate).replace('%',''))
      }));
      setSectorTrends(processedTrends);

      // commonMaxAbsChangeRate 계산 및 설정 로직 제거

      setLoading(false);
    }, 500);
  }, []); // 의존성 배열 유지

  if (loading) {
    return <p className="loading-message-tsc">테마/업종 데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div className="theme-sector-content-page">
      <h1 className="page-main-title-tsc">테마/업종 분석</h1>

      <section className="sector-performance-charts-section">
        {/* commonMaxAbsChangeRate prop 제거 */}
        <SectorBarChart 
          data={bottomSectors} 
          title="등락률 하위 TOP 5 업종" 
          barColor="#007bff" // 파란색
          yAxisOrientation="right" // Y축을 오른쪽으로 설정
        /> 
        {/* commonMaxAbsChangeRate prop 제거 */}
        <SectorBarChart 
          data={topSectors} 
          title="등락률 상위 TOP 5 업종" 
          barColor="#d9534f" // 빨간색
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
            {sectorTrends.map(sector => (
              <li key={sector.id} className="table-row-tsc">
                <span className="col-sector-name-tsc">
                  <Link to={`/theme-sector-detail/${sector.id}`}>{sector.name}</Link>
                </span>
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
            ))}
          </ul>
        </div>
      </section>

      <section className="top-bottom-sectors-list-section">
        <h2 className="section-sub-title-tsc">주요 업종 요약</h2>
        <div className="summary-lists-container">
          <div className="top-sectors-summary">
            <h3>📈 등락률 상위 5개 업종</h3>
            <ul>
              {topSectors.map((sector) => (
                <li key={sector.name}>
                  <Link to={`/theme-sector-detail/${sector.name}`}>{sector.name} ({sector.changeRate}%)</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bottom-sectors-summary">
            <h3>📉 등락률 하위 5개 업종</h3>
            <ul>
              {bottomSectors.map((sector) => (
                <li key={sector.name}>
                  <Link to={`/theme-sector-detail/${sector.name}`}>{sector.name} ({sector.changeRate}%)</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThemeSectorContent;