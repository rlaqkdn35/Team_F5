import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaChartLine, FaNewspaper, FaComments, FaBookOpen, FaBrain, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import './StockDetailPage.css';

// --- 실제 탭 콘텐츠 컴포넌트들을 임포트 ---
import ComprehensiveAnalysisTab from './tabs/ComprehensiveAnalysisTab.jsx';
import PriceChartTab from './tabs/PriceChartTab.jsx';
import MultiAiAnalysisTab from './tabs/MultiAiAnalysisTab.jsx';
import StockDiscussionTab from './tabs/StockDiscussionTab.jsx';
import PropTypes from 'prop-types';
import NewsDisclosureTab from './tabs/NewsDisclosureTab.jsx';

const TABS_STOCK_DETAIL = [
  { id: 'comprehensive', name: '종합 분석', icon: <FaInfoCircle />, content: ComprehensiveAnalysisTab },
  { id: 'priceChart', name: '시세 차트', icon: <FaChartLine />, content: PriceChartTab },
  { id: 'multiAi', name: '다중 AI', icon: <FaBrain />, content: MultiAiAnalysisTab },
  // { id: 'discussion', name: '종목 토론', icon: <FaComments />, content: StockDiscussionTab },
  { id: 'newsDisclosure', name: '뉴스', icon: <FaNewspaper />, content: NewsDisclosureTab},
];

const StockDetailPage = ({ currentUser }) => {
  const { stockCode } = useParams();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS_STOCK_DETAIL[0].id);

  // 백엔드 API 기본 URL 설정 (개발 환경에 맞게 변경)
  const API_BASE_URL = 'http://localhost:8084/F5';

  // 종목 상세 정보와 관심 종목 상태를 가져오는 useEffect
  useEffect(() => {
    const fetchStockDetailAndFavoriteStatus = async () => {
      setLoading(true);
      setError(null);
      console.log(`StockDetailPage: Fetching data for stock: ${stockCode}`);

      try {
        // 1. 종목 기본 정보 가져오기
        const stockResponse = await axios.get(`${API_BASE_URL}/stocks/stockinfo/${stockCode}`); // 경로 변경 (stockinfo 제거)
        const stockInfo = stockResponse.data;

        // 2. 최신 시세 정보 가져오기 (StockPrice 엔티티에서 정보)
        const priceResponse = await axios.get(`${API_BASE_URL}/stock/latest/${stockCode}`);
        const latestPriceData = priceResponse.data; // 최신 시세 데이터

        // 모든 데이터 통합하여 상태 업데이트
        setStockData({
          name: stockInfo.stockName,
          // StockPrice에서 가져온 값 사용
          price: latestPriceData.closePrice ? latestPriceData.closePrice.toLocaleString() : 'N/A', // 종가 사용
          changeRate: latestPriceData.stockFluctuation ? `${(latestPriceData.stockFluctuation).toFixed(2)}%` : 'N/A', // 변동률 사용
          changeType: latestPriceData.stockFluctuation > 0 ? 'positive' : (latestPriceData.stockFluctuation < 0 ? 'negative' : 'neutral'),
          updateTime: new Date().toLocaleTimeString('ko-KR'),
          companyOverview: stockInfo.companyInfo || '기업 개요 정보가 없습니다.',
        });
        
        // 2. 관심 종목 여부 확인 (사용자가 로그인 되어 있을 때만)
        if (currentUser && currentUser.userId) {
          const favoriteCheckResponse = await axios.get(`${API_BASE_URL}/userfav/${currentUser.userId}/favorites/check/${stockCode}`);
          setIsFavorite(favoriteCheckResponse.data.isFavorite);
        } else {
          setIsFavorite(false); // 로그인되지 않았으면 관심 종목 아님
        }

      } catch (err) {
        console.error("Failed to fetch data:", err);
        if (axios.isAxiosError(err)) { // Axios 에러인지 확인
            if (err.response) {
                setError(`데이터를 가져오는 데 실패했습니다: ${err.response.status} - ${err.response.data.message || err.message || '알 수 없는 오류'}`);
            } else if (err.request) {
                setError("네트워크 오류: 서버에 연결할 수 없습니다.");
            } else {
                setError(`요청 오류: ${err.message}`);
            }
        } else {
            setError(`알 수 없는 오류: ${err.message}`);
        }
        setStockData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetailAndFavoriteStatus();
  }, [stockCode, currentUser]);

  // 관심 종목 설정/해제 토글 함수
  const toggleFavorite = async () => {
    if (!currentUser || !currentUser.userId) {
      alert("로그인 후 관심 종목을 설정할 수 있습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        // 관심 종목 해제 (DELETE 요청)
        await axios.delete(`${API_BASE_URL}/userfav/${currentUser.userId}/favorites/${stockCode}`);
        setIsFavorite(false); // 상태 업데이트
        // console.log(`${stockCode} 관심종목에서 삭제되었습니다.`);
      } else {
        // 관심 종목 설정 (POST 요청)
        await axios.post(`${API_BASE_URL}/userfav/${currentUser.userId}/favorites/${stockCode}`);
        setIsFavorite(true); // 상태 업데이트
        // console.log(`${stockCode} 관심종목에 추가되었습니다.`);
      }
    } catch (err) {
      console.error("관심 종목 업데이트 실패:", err);
      if (axios.isAxiosError(err)) {
          if (err.response) {
              if (err.response.status === 409) { // 409 Conflict는 이미 등록됨
                  setError("이미 관심 종목으로 등록되어 있습니다.");
              } else {
                  setError(`관심 종목 업데이트 실패: ${err.response.status} - ${err.response.data.message || err.message || '알 수 없는 오류'}`);
              }
          } else if (err.request) {
              setError("네트워크 오류: 관심 종목 업데이트 서버에 연결할 수 없습니다.");
          } else {
              setError(`요청 오류: ${err.message}`);
          }
      } else {
          setError(`알 수 없는 오류: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="loading-message-sdtp">종목 상세 정보를 불러오는 중입니다...</p>;
  }
  if (error) {
    return <p className="error-message-sdtp">{error}</p>;
  }
  if (!stockData) {
    return <p className="no-data-message-sdtp">해당 종목 정보를 찾을 수 없습니다.</p>;
  }

  const ActiveTabContent = TABS_STOCK_DETAIL.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="stock-detail-page">
      <div className="stock-summary-header-sdtp">
        <div className="stock-title-price">
          <h1 className="stock-name-sdtp">{stockData.name} <span className="stock-code-sdtp">({stockCode})</span></h1>
          <div className="price-info-sdtp">
            <span className={`current-price-sdtp ${stockData.changeType}`}>{stockData.price}</span>
            <span className={`change-rate-sdtp ${stockData.changeType}`}>{stockData.changeRate}</span>
            <span className="update-time-sdtp">(기준: {stockData.updateTime})</span>
          </div>
        </div>
        <button onClick={toggleFavorite} className="favorite-button-sdtp" aria-label="관심종목 추가/삭제" disabled={loading}>
          {isFavorite ? <FaStar style={{ color: '#ffc107' }} /> : <FaRegStar />}
          <span style={{ marginLeft: '5px' }}>관심 {isFavorite ? '해제' : '설정'}</span>
        </button>
      </div>

      <nav className="stock-detail-tabs-sdtp">
        {TABS_STOCK_DETAIL.map(tab => (
          <button
            key={tab.id}
            className={`tab-button-sdtp ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="tab-icon-sdtp">{tab.icon}</span>}
            {tab.name}
          </button>
        ))}
      </nav>

      <div className="stock-detail-tab-content-sdtp">
        {ActiveTabContent ? (
          <ActiveTabContent stockData={stockData} stockCode={stockCode} currentUser={currentUser} />
        ) : (
          <p>선택된 탭의 콘텐츠를 불러올 수 없습니다.</p>
        )}
      </div>
    </div>
  );
};

StockDetailPage.propTypes = {
  currentUser: PropTypes.shape({ userId: PropTypes.string, nickname: PropTypes.string })
};

export default StockDetailPage;