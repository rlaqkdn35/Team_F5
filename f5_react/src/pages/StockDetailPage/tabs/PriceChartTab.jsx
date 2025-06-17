// src/pages/StockDetailPage/tabs/PriceChartTab.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StockChart from '../../../components/charts/StockChart/StockChart.jsx'; // 상세 차트용
import axios from 'axios'; // axios import 추가
import './PriceChartTab.css'; // 이 탭의 스타일

// 임시 호가 및 거래원 데이터 (백엔드 API가 아직 없으므로 프론트엔드에서 목업)
const tempMarketData = {
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
    foreignNet: { sellVol: '391,922', buyVol: '452,441', netVol: (452441-391922).toLocaleString(), time: '11:01' } // 예시 계산
  }
};


// --- 각 정보 섹션을 위한 작은 컴포넌트들 ---
const OrderBookDisplay = ({ data }) => {
    if (!data || !data.asks || !data.bids) {
        return <div className="order-book-pct"><h4>실시간 호가</h4><p className="no-data-message-pct">호가 데이터가 없습니다.</p></div>;
    }
    return (
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
};

const BrokerActivityDisplay = ({ data }) => {
    if (!data || !data.topSellers || !data.topBuyers || !data.foreignNet) {
        return <div className="broker-activity-pct"><h4>거래원 정보</h4><p className="no-data-message-pct">거래원 데이터가 없습니다.</p></div>;
    }
    return (
        <div className="broker-activity-pct">
            <h4>거래원 정보 ({data.foreignNet.time} 기준)</h4>
            <div className="broker-lists">
                <div><h5>주요 매도창구</h5><ul>{data.topSellers.slice(0,5).map(s => <li key={s.broker}>{s.broker}: {s.volume}</li>)}</ul></div>
                <div><h5>주요 매수창구</h5><ul>{data.topBuyers.slice(0,5).map(s => <li key={s.broker}>{s.broker}: {s.volume}</li>)}</ul></div>
            </div>
            <p>외국인 순매매: {data.foreignNet.netVol} (매수:{data.foreignNet.buyVol} / 매도:{data.foreignNet.sellVol})</p>
        </div>
    );
};
// --- 작은 컴포넌트들 끝 ---


const PriceChartTab = ({ stockData, stockCode }) => { // stockData는 기본 정보, stockCode로 상세 데이터 로드
  const [stockHistory, setStockHistory] = useState([]); // 모든 날짜의 주가 데이터 (DTO)
  const [latestStockData, setLatestStockData] = useState(null); // 가장 최신 데이터 (시세 정보용)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1M'); // 차트 기간 선택
  const [chartType, setChartType] = useState('candlestick'); // 차트 종류 선택

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 백엔드 API 호출: /stock/{stockCode}/history
        const response = await axios.get(`http://localhost:8084/F5/stock/${stockCode}/history`, {
          withCredentials: true,
        });

        const historyData = response.data;
        console.log(`API에서 받아온 ${stockCode}의 전체 주식 데이터:`, historyData);

        if (historyData && historyData.length > 0) {
          // 날짜를 기준으로 오름차순 정렬 (혹시 백엔드에서 정렬되지 않았다면)
          // Timestamp는 Date 객체로 변환하여 비교합니다.
          historyData.sort((a, b) => new Date(a.priceDate).getTime() - new Date(b.priceDate).getTime());

          setStockHistory(historyData);
          // 가장 최신 데이터는 배열의 마지막 요소
          setLatestStockData(historyData[historyData.length - 1]);
        } else {
          setError(`종목 코드 '${stockCode}'에 해당하는 과거 데이터를 찾을 수 없습니다.`);
          setStockHistory([]);
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
      fetchStockData();
    }
  }, [stockCode]); // stockCode가 변경될 때마다 데이터를 다시 가져옴

  if (loading) {
    return <p className="loading-message-pct">시세 및 차트 정보를 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p className="error-message-pct">오류: {error}</p>;
  }

  // StockChart 컴포넌트에 넘길 데이터 형식 가공
  // historicalData를 period에 따라 필터링하는 로직
  const getChartDataByPeriod = (data, period) => {
      if (!data || data.length === 0) return [];
      
      const today = new Date();
      // 오늘 날짜를 기준으로 시/분/초를 제거하여 날짜만 비교
      today.setHours(0, 0, 0, 0); 

      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // 시작 날짜도 시/분/초 제거

      switch (period) {
          case '1D': 
              // 1일치는 오늘 데이터만 포함. stockHistory에서 오늘 날짜 데이터만 필터링.
              // priceDate가 Timestamp이므로, 날짜만 비교하기 위해 변환
              return data.filter(item => {
                  const itemDate = new Date(item.priceDate);
                  itemDate.setHours(0, 0, 0, 0);
                  return itemDate.getTime() === today.getTime();
              }).map(item => ({
                  time: new Date(item.priceDate).toISOString().split('T')[0],
                  open: parseFloat(item.openPrice),
                  high: parseFloat(item.highPrice),
                  low: parseFloat(item.lowPrice),
                  close: parseFloat(item.closePrice),
                  value: parseFloat(item.stockVolume) // 거래량으로 value를 사용
              }));
          case '1W':
              startDate.setDate(today.getDate() - 6); // 오늘 포함 일주일 (7일)
              break;
          case '1M':
              startDate.setMonth(today.getMonth() - 1);
              break;
          case '3M':
              startDate.setMonth(today.getMonth() - 3);
              break;
          case '1Y':
              startDate.setFullYear(today.getFullYear() - 1);
              break;
          case 'ALL':
          default:
              startDate = new Date(0); // Epoch, 모든 데이터 포함
              break;
      }
      
      return data.filter(item => {
          const itemDate = new Date(item.priceDate);
          itemDate.setHours(0, 0, 0, 0); // 비교를 위해 시간 부분 제거
          return itemDate.getTime() >= startDate.getTime() && itemDate.getTime() <= today.getTime();
      }).map(item => ({
          time: new Date(item.priceDate).toISOString().split('T')[0],
          open: parseFloat(item.openPrice),
          high: parseFloat(item.highPrice),
          low: parseFloat(item.lowPrice),
          close: parseFloat(item.closePrice),
          value: parseFloat(item.stockVolume) // StockChart의 value 필드에 거래량 할당
      }));
  };

  const chartData = getChartDataByPeriod(stockHistory, selectedPeriod);


  // 등락률 계산 및 포맷팅 (latestStockData 사용)
  const calculateChangeRate = (current, fluctuation) => {
    const currentNum = parseFloat(current);
    const fluctuationNum = parseFloat(fluctuation);
    if (isNaN(currentNum) || isNaN(fluctuationNum) || currentNum === 0) return '0.00%';
    
    // 전일 종가를 추정하여 등락률 계산
    const prevClose = currentNum - fluctuationNum;
    if (prevClose === 0) return '0.00%'; // 전일 종가가 0이면 등락률 계산 불가
    
    const rate = (fluctuationNum / prevClose) * 100;
    const sign = rate > 0 ? '+' : '' ;
    return `${sign}${rate.toFixed(2)}%`;
  };

  // 등락폭 부호 및 색상 결정을 위한 유틸리티 함수
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


  return (
    <div className="price-chart-tab-content">
      {/* 백엔드 API에서 받아온 가장 최신 데이터를 기반으로 종목 시세 정보 표시 */}
      <div className="stock-info-summary-pct">
        {latestStockData && (
          <>
            {/* 요청하신 출력 내용으로 변경 */}
            <div>종목명: {latestStockData.stockName}</div>
            <div>현재가: <span className={`current-price ${getPriceClass(latestStockData.stockFluctuation)}`}>
                        {parseFloat(latestStockData.closePrice).toLocaleString()}
                      </span>
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
      
      {/* 상세 인터랙티브 차트 */}
      <div className="main-chart-area-pct">
        {/* 차트 기간/종류 선택 UI (버튼 등) */}
        <div className="chart-controls-pct">
          <div>
            {/* 기간 선택 버튼 */}
            {['1D','1W','1M','3M','1Y','ALL'].map(p => <button key={p} onClick={()=>setSelectedPeriod(p)} className={selectedPeriod === p ? 'active' : ''}>{p}</button>)}
          </div>
          <div>
            {/* 차트 종류 선택 버튼 */}
            <button onClick={()=>setChartType('line')} className={chartType === 'line' ? 'active' : ''}>라인</button>
            <button onClick={()=>setChartType('candlestick')} className={chartType === 'candlestick' ? 'active' : ''}>캔들</button>
          </div>
        </div>
        {chartData.length > 0 ? (
          <StockChart 
            data={chartData} // 기간에 따라 필터링된 과거 데이터
            chartType={chartType} 
            chartOptions={{ height: 400 /* 다른 상세 옵션들 */}}
          />
        ) : (
          <p className="no-data-message-pct">선택된 기간에 대한 차트 데이터가 없습니다.</p>
        )}
      </div>

      {/* C. 호가 정보 & D. 거래원 정보 (가로 또는 세로로 배치) */}
      <div className="additional-market-info-pct">
        {/* 임시 목업 데이터 사용 - 실제 백엔드 연동 시 이 부분도 API 호출로 대체되어야 합니다. */}
        <OrderBookDisplay data={tempMarketData.orderBook} />
        <BrokerActivityDisplay data={tempMarketData.brokerActivity} />
      </div>
    </div>
  );
};

PriceChartTab.propTypes = {
  stockData: PropTypes.object, // StockDetailPage에서 전달받는 기본 정보 (필요시 사용)
  stockCode: PropTypes.string.isRequired,
};

export default PriceChartTab;