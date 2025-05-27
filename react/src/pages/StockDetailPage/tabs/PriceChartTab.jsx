// src/pages/StockDetailPage/tabs/PriceChartTab.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx'; // 상세 차트용
import './PriceChartTab.css'; // 이 탭의 스타일

// 임시: 상세 시세 정보 및 호가, 거래원 데이터 로딩 함수 (실제로는 API 호출)
const getDetailedMarketData = (stockCode) => {
  console.log(`Workspaceing detailed market data for ${stockCode} (PriceChartTab)`);
  // 보내주신 텍스트 데이터를 기반으로 목업 데이터 생성
  return {
    // A. 시세 및 주요 지표 (snapshotData)
    snapshot: {
      currentPrice: '205,000', volume: '1,068,621', changeAbsolute: '▲ 6,500', changePercent: '+3.27%',
      tradingValue: '220,629백만', openPrice: '207,000', highPrice: '207,000', lowPrice: '204,000',
      prevClosePrice: '198,500', marketCap: '1,445,084억', per: '7.13', eps: '28,732',
      high52w: '248,500', low52w: '144,700', foreignOwnShares: '334,167천', foreignOwnRate: '54.1%',
      dayUpperLimit: '258,000', dayLowerLimit: '139,000',
    },
    // B. 차트 데이터 (기본 1개월, 기간 선택에 따라 변경)
    chartHistoricalData: Array.from({length: 22}, (_, i) => {
        const date = new Date(); date.setDate(date.getDate() - (22 - 1 - i));
        return { time: date.toISOString().split('T')[0], open: 200000 + i*100, high: 205000 + i*120, low: 198000 + i*90, close: 203000 + i*110, value: 203000 + i*110 };
    }),
    // C. 호가 정보 (orderBookData) - 5단계 예시
    orderBook: {
      asks: [ // 매도 호가 (가격, 잔량)
        { price: '205,500', quantity: '24,244' }, { price: '206,000', quantity: '48,074' },
        { price: '206,500', quantity: '48,683' }, { price: '207,000', quantity: '69,349' },
        { price: '207,500', quantity: '26,276' },
      ],
      bids: [ // 매수 호가
        { price: '205,000', quantity: '12,603' }, { price: '204,500', quantity: '21,111' },
        { price: '204,000', quantity: '10,796' }, { price: '203,500', quantity: '13,383' },
        { price: '203,000', quantity: '9,599' },
      ],
    },
    // D. 거래원 정보 (brokerActivityData)
    brokerActivity: {
      topSellers: [
        { broker: '미래에셋증권', volume: '124,910' }, { broker: '키움증권', volume: '96,801' }, /* ... */
      ],
      topBuyers: [
        { broker: '골드만삭스', volume: '156,074' }, { broker: '모간서울', volume: '124,306' }, /* ... */
      ],
      foreignNet: { sellVol: '391,922', buyVol: '452,441', netVol: (452441-391922).toLocaleString(), time: '11:01' } // 예시 계산
    }
  };
};


// --- 각 정보 섹션을 위한 작은 컴포넌트들 (내부 또는 별도 파일) ---
const StockSnapshotDisplay = ({ data }) => (
  <div className="stock-snapshot-pct"> {/* PCT: PriceChartTab */}
    <h4>주요 시세</h4>
    <div className="snapshot-grid">
      <span>현재가: <strong>{data.currentPrice}</strong> ({data.changeAbsolute} {data.changePercent})</span>
      <span>거래량: {data.volume}</span>
      <span>거래대금: {data.tradingValue}</span>
      <span>시가: {data.openPrice}</span>
      <span>고가: {data.highPrice}</span>
      <span>저가: {data.lowPrice}</span>
      <span>전일종가: {data.prevClosePrice}</span>
      <span>52주최고: {data.high52w}</span>
      <span>52주최저: {data.low52w}</span>
      <span>시가총액: {data.marketCap}</span>
      <span>PER: {data.per}</span>
      <span>EPS: {data.eps}</span>
      <span>외국인비율: {data.foreignOwnRate}</span>
    </div>
  </div>
);

const OrderBookDisplay = ({ data }) => (
  <div className="order-book-pct">
    <h4>실시간 호가</h4>
    <div className="order-book-layout">
      <div className="asks">
        <h5>매도 잔량</h5>
        {data.asks.slice(0,5).reverse().map(ask => <div key={ask.price} className="order-row ask-row"><span>{ask.price}</span><span>{ask.quantity}</span></div>)}
      </div>
      <div className="bids">
        <h5>매수 잔량</h5>
        {data.bids.slice(0,5).map(bid => <div key={bid.price} className="order-row bid-row"><span>{bid.price}</span><span>{bid.quantity}</span></div>)}
      </div>
    </div>
  </div>
);

const BrokerActivityDisplay = ({ data }) => (
  <div className="broker-activity-pct">
    <h4>거래원 정보 ({data.foreignNet.time} 기준)</h4>
    <div className="broker-lists">
      <div><h5>주요 매도창구</h5><ul>{data.topSellers.slice(0,5).map(s => <li key={s.broker}>{s.broker}: {s.volume}</li>)}</ul></div>
      <div><h5>주요 매수창구</h5><ul>{data.topBuyers.slice(0,5).map(s => <li key={s.broker}>{s.broker}: {s.volume}</li>)}</ul></div>
    </div>
    <p>외국인 순매매: {data.foreignNet.netVol} (매수:{data.foreignNet.buyVol} / 매도:{data.foreignNet.sellVol})</p>
  </div>
);
// --- 작은 컴포넌트들 끝 ---


const PriceChartTab = ({ stockData, stockCode }) => { // stockData는 기본 정보, stockCode로 상세 데이터 로드
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('1M'); // 차트 기간 선택
  const [chartType, setChartType] = useState('candlestick'); // 차트 종류 선택

  useEffect(() => {
    if (stockCode) {
      setLoading(true);
      // 실제로는 API 호출: fetchDetailedMarketData(stockCode, selectedPeriod).then(...)
      setTimeout(() => { // 시뮬레이션
        const fullData = getDetailedMarketData(stockCode);
        // selectedPeriod에 따라 chartHistoricalData를 필터링/재요청해야 함 (지금은 전체 사용)
        setDetailedData(fullData);
        setLoading(false);
      }, 300);
    }
  }, [stockCode, selectedPeriod]); // selectedPeriod 변경 시 데이터 다시 로드

  if (loading || !detailedData) {
    return <p className="loading-message-pct">시세 및 차트 정보를 불러오는 중입니다...</p>;
  }

  // 차트 기간/종류 선택 UI (버튼 등)
  const chartControls = (
    <div className="chart-controls-pct">
      <div>
        {['1D','1W','1M','3M','1Y','ALL'].map(p => <button key={p} onClick={()=>setSelectedPeriod(p)} className={selectedPeriod === p ? 'active' : ''}>{p}</button>)}
      </div>
      <div>
        <button onClick={()=>setChartType('line')} className={chartType === 'line' ? 'active' : ''}>라인</button>
        <button onClick={()=>setChartType('candlestick')} className={chartType === 'candlestick' ? 'active' : ''}>캔들</button>
      </div>
    </div>
  );

  return (
    <div className="price-chart-tab-content">
      {/* A. 종목 시세 및 주요 지표 요약 (snapshotData 사용) */}
      <StockSnapshotDisplay data={detailedData.snapshot} />
      
      {/* B. 상세 인터랙티브 차트 */}
      <div className="main-chart-area-pct">
        {chartControls}
        <StockChart 
          data={detailedData.chartHistoricalData} // selectedPeriod에 맞게 필터링된 데이터 전달 필요
          chartType={chartType} 
          chartOptions={{ height: 400 /* 다른 상세 옵션들 */}}
        />
      </div>

      {/* C. 호가 정보 & D. 거래원 정보 (가로 또는 세로로 배치) */}
      <div className="additional-market-info-pct">
        <OrderBookDisplay data={detailedData.orderBook} />
        <BrokerActivityDisplay data={detailedData.brokerActivity} />
      </div>
    </div>
  );
};

PriceChartTab.propTypes = {
  stockData: PropTypes.object, // StockDetailPage에서 전달받는 기본 정보 (필요시 사용)
  stockCode: PropTypes.string.isRequired,
};

export default PriceChartTab;