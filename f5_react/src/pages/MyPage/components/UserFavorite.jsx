import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link 컴포넌트 import
import './UserFavorite.css'; // 관심 종목 페이지 전용 CSS

const UserFavorite = ({ currentUser, onLogout }) => {
    const [interestStocks, setInterestStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInterestStocks = async () => {
            setLoading(true);
            setError(null); // 이전 오류 초기화

            if (!currentUser || !currentUser.userId) {
                // currentUser 객체나 userId가 없으면 로그인하지 않은 상태로 간주
                setError("로그인이 필요합니다. 사용자 정보를 찾을 수 없습니다.");
                setLoading(false);
                setInterestStocks([]); // 데이터도 초기화
                return;
            }

            try {
                // 실제 API 호출 로직 (백엔드 URL 확인 필수!)
                // 백엔드 URL이 http://localhost:8084 라고 가정합니다.
                const response = await fetch(`http://localhost:8084/F5/userfav/list?userId=${currentUser.userId}`);
                // 만약 React의 package.json에 proxy 설정을 했다면, 아래처럼 짧게 쓸 수 있습니다.
                // const response = await fetch(`/F5/userfav/list?userId=${currentUser.userId}`);

                if (!response.ok) {
                    // HTTP 상태 코드가 200번대가 아닐 경우 에러 처리
                    const errorText = await response.text(); // 서버에서 보낸 에러 메시지도 확인
                    throw new Error(`관심 종목을 불러오는 데 실패했습니다: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
                console.log("백엔드에서 받아온 관심 종목 데이터:", data); // 받아온 데이터 콘솔에 출력 (디버깅용)

                // 받아온 데이터 (UserFavStockDetailDto 리스트)를 그대로 사용
                setInterestStocks(data);
            } catch (err) {
                console.error("관심 종목 데이터 조회 중 오류 발생:", err);
                setError(`관심 종목을 불러오는 데 실패했습니다: ${err.message}`);
                setInterestStocks([]); // 오류 발생 시 데이터 초기화
            } finally {
                setLoading(false);
            }
        };

        fetchInterestStocks();
    }, [currentUser]); // currentUser 객체가 변경될 때마다 데이터를 다시 불러옴

    /**
     * 숫자 값을 받아서 원하는 형식으로 포맷하고, 부호에 따라 CSS 클래스를 반환하는 헬퍼 함수
     * @param {number | string} value - 포맷할 숫자 값 (문자열로 와도 parseFloat로 변환 시도)
     * @param {boolean} isPercentage - 반환 값에 '%'를 붙일지 여부
     * @returns {{displayValue: string, className: string}} - 표시할 값과 CSS 클래스
     */
    const formatNumberAndGetClass = (value, isPercentage = false) => {
        if (value === null || value === undefined) {
            return { displayValue: '-', className: '' };
        }

        const num = parseFloat(value); // 문자열일 경우 숫자로 변환 시도
        if (isNaN(num)) { // 숫자로 변환할 수 없는 경우
            return { displayValue: '-', className: '' };
        }

        let displayValue;
        let className = '';

        if (num > 0) {
            className = 'positive'; // CSS에서 양수 색상 정의 필요
            displayValue = `+${num.toLocaleString()}`; // 양수는 '+' 부호 붙임
        } else if (num < 0) {
            className = 'negative'; // CSS에서 음수 색상 정의 필요
            displayValue = num.toLocaleString(); // 음수는 자동으로 '-' 부호 붙음
        } else { // 0인 경우
            displayValue = '0';
            className = ''; // 0은 특별한 색상 없음
        }

        if (isPercentage) {
            displayValue += '%'; // 퍼센트일 경우 '%' 붙임
        }
        return { displayValue, className };
    };

    /**
     * 등락률을 계산하는 헬퍼 함수.
     * stockFluctuation (변동분)과 closePrice (현재 종가)를 바탕으로 계산.
     * 참고: 정확한 등락률은 (변동분 / 이전종가) * 100 이므로, 이전 종가는 (현재종가 - 변동분)으로 계산합니다.
     * 백엔드에서 등락률을 직접 제공하는 것이 가장 정확하고 좋습니다.
     * @param {number} fluctuation - 변동분 (stockFluctuation)
     * @param {number} closePrice - 현재 종가 (closePrice)
     * @returns {{displayValue: string, className: string}} - 표시할 값과 CSS 클래스
     */
    const calculateChangeRate = (fluctuation, closePrice) => {
        if (closePrice === null || closePrice === undefined || parseFloat(closePrice) === 0) {
            return { displayValue: '-', className: '' }; // 현재가가 없거나 0이면 계산 불가
        }
        const fluctuationNum = parseFloat(fluctuation);
        const closePriceNum = parseFloat(closePrice);

        // 이전 종가 계산: 현재 종가 - 변동분
        const previousClosePrice = closePriceNum - fluctuationNum;

        if (previousClosePrice === 0) {
            return { displayValue: '-', className: '' }; // 이전 종가가 0이면 계산 불가 (나누기 0 방지)
        }

        const rate = (fluctuationNum / previousClosePrice) * 100;
        // 소수점 둘째 자리까지 표시하고 퍼센트 붙임
        return formatNumberAndGetClass(rate.toFixed(2), true);
    };


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
                                <th>등락률</th>
                                <th>거래량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 백엔드에서 받아온 DTO 객체의 필드명에 맞춰 맵핑 */}
                            {interestStocks.map(stock => {
                                // 대비 (stockFluctuation) 처리
                                const { displayValue: fluctuationDisplay, className: fluctuationClass } =
                                    formatNumberAndGetClass(stock.stockFluctuation);

                                // 등락률 계산 및 처리
                                const { displayValue: changeRateDisplay, className: changeRateClass } =
                                    calculateChangeRate(stock.stockFluctuation, stock.closePrice);

                                return (
                                    // key는 고유한 값이어야 하므로 stockCode 사용
                                    <tr key={stock.stockCode}>
                                        <td className="stock-name-cell">
                                            {/* 종목 상세 페이지 링크: /stock-detail/종목코드 */}
                                            <Link to={`/stock-detail/${stock.stockCode}`} className="stock-link">
                                                {stock.stockName} {/* 종목명 */}
                                            </Link>
                                        </td>
                                        {/* 현재가 (closePrice) */}
                                        <td className="align-right">
                                            {stock.closePrice !== null && stock.closePrice !== undefined
                                                ? stock.closePrice.toLocaleString() + '원'
                                                : '-'}
                                        </td>
                                        {/* 등락률 (계산된 값) */}
                                        <td className={`align-right ${fluctuationClass}`}>
                                            {fluctuationDisplay}%
                                        </td>
                                        {/* 거래량 (stockVolume) */}
                                        <td className="align-right">
                                            {stock.stockVolume !== null && stock.stockVolume !== undefined
                                                ? stock.stockVolume.toLocaleString()
                                                : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserFavorite;