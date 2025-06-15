// src/pages/MyPage/components/UserFavorite.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link 컴포넌트 import
import './UserFavorite.css'; // 관심 종목 페이지 전용 CSS

const UserFavorite = ({ currentUser, onLogout }) => {
  // 실제 앱에서는 currentUser 객체를 통해 로그인 여부와 사용자 ID를 확인하고,
  // 해당 사용자의 관심 종목 데이터를 API에서 가져올 것입니다.
  // 여기서는 목업 데이터를 사용합니다.

  const [interestStocks, setInterestStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 실제 API 호출 로직:
    // if (currentUser && currentUser.userId) {
    //   fetch(`/api/users/${currentUser.userId}/interest-stocks`)
    //   .then(response => {
    //   if (!response.ok) {
    //     throw new Error('Failed to fetch interest stocks');
    //   }
    //   return response.json();
    //   })
    //   .then(data => {
    //     setInterestStocks(data);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     setError(err.message);
    //     setLoading(false);
    //   });
    // } else {
    //   // 로그인하지 않은 경우 (MyPage는 ProtectedElement로 보호되지만, 만약을 대비)
    //   setInterestStocks([]);
    //   setLoading(false);
    // }

    // 목업 데이터 로드 (실제 API 호출 대체)
    const fetchMockData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 지연 시뮬레이션
      if (!currentUser) { // currentUser prop이 없으면 로그인 상태가 아님을 시뮬레이션
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const mockData = [
        { id: '005930', name: '삼성전자', currentPrice: 82000, 대비: '+2,000', changeRate: '+2.50%', tradeVolume: '15,234,567' },
        { id: '000660', name: 'SK하이닉스', currentPrice: 195000, 대비: '-1,500', changeRate: '-0.76%', tradeVolume: '8,123,456' },
        { id: '035420', name: '네이버', currentPrice: 180500, 대비: '+500', changeRate: '+0.28%', tradeVolume: '2,345,678' },
        { id: '035720', name: '카카오', currentPrice: 50200, 대비: '+1,200', changeRate: '+2.45%', tradeVolume: '4,567,890' },
        { id: '005380', name: '현대차', currentPrice: 231000, 대비: '-500', changeRate: '-0.22%', tradeVolume: '1,876,543' },
      ];
      setInterestStocks(mockData);
      setLoading(false);
    };

    fetchMockData();
  }, [currentUser]); // currentUser가 변경될 때마다 데이터를 다시 불러옴

  if (loading) {
    return <div className="user-favorite-container loading">관심 종목을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="user-favorite-container error">오류: {error}</div>;
  }

  return (
    <div className="user-favorite-container">
      <h2 className="favorite-page-title">관심 종목</h2>
      <p className="favorite-page-description">
        회원님이 등록하신 관심 종목 목록입니다.
      </p>

      {interestStocks.length === 0 ? (
        <p className="no-favorite-message">등록된 관심 종목이 없습니다.</p>
      ) : (
        <div className="favorite-table-wrapper">
          <table className="favorite-table">
            <thead>
              <tr>
                <th>종목명</th>
                <th>현재가</th>
                <th>대비</th>
                <th>등락률</th>
                <th>거래량</th>
              </tr>
            </thead>
            <tbody>
              {interestStocks.map(stock => (
                <tr key={stock.id}>
                  <td className="stock-name-cell">
                    {/* 종목별 링크 추가 */}
                    <Link to={`/stock-detail/${stock.id}`} className="stock-link">
                      {stock.name}
                    </Link>
                  </td>
                  <td className="align-right">{stock.currentPrice.toLocaleString()}원</td>
                  <td className={`align-right ${parseFloat(stock.대비.replace(',', '')) > 0 ? 'positive' : parseFloat(stock.대비.replace(',', '')) < 0 ? 'negative' : ''}`}>
                    {stock.대비}
                  </td>
                  <td className={`align-right ${parseFloat(stock.changeRate) > 0 ? 'positive' : parseFloat(stock.changeRate) < 0 ? 'negative' : ''}`}>
                    {stock.changeRate}
                  </td>
                  <td className="align-right">{stock.tradeVolume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserFavorite;