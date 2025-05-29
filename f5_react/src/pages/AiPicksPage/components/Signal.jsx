// src/pages/AiPicksPage/components/Signal.jsx
import React, { useState, useEffect } from 'react';
import './Signal.css'; // Signal 페이지 전용 CSS 파일 (빨간 계열 디자인)

// 가정: 로그인 상태를 관리하는 컨텍스트 또는 전역 상태에서 currentUser 정보를 가져온다고 가정
// 실제 앱에서는 Context API, Redux, Recoil 등 전역 상태 관리 도구를 사용할 수 있습니다.
// 여기서는 간단한 예시를 위해 prop으로 isLoggedIn을 받거나, useState로 임시 구현합니다.
// 실제 앱에서는 currentUser 객체를 받아 userId 등으로 로그인 여부를 판단할 것입니다.

const Signal = () => {
  // 실제 앱에서는 전역 상태(예: Context API)에서 로그인 여부를 가져올 것입니다.
  // 여기서는 임시로 useState를 사용하여 시뮬레이션합니다.
  // const { currentUser } = useContext(AuthContext); // 예시: 실제 사용 시
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 테스트를 위한 임시 로그인 상태

  // useEffect를 사용하여 컴포넌트 마운트 시 로그인 상태를 확인하거나 (실제 데이터 연동 시)
  // 목업 데이터를 불러오는 등의 작업을 할 수 있습니다.
  useEffect(() => {
    // 실제 로그인 상태를 여기서 확인 (예: localStorage, API 호출 등)
    // setIsLoggedIn(!!localStorage.getItem('userToken'));
    // 일단은 테스트를 위해 true로 설정하여 로그인 상태를 시뮬레이션합니다.
    setIsLoggedIn(true); // 나중에 실제 로그인 상태로 변경 필요
  }, []);

  // AI 매매 신호 데이터 (목업 데이터)
  const allSignals = [
    { id: 1, type: 'BUY', stock: '삼성전자', code: '005930', price: 82000, change: '+2.5%', time: '2025-05-27 10:30', strength: '매우 강함', reason: '강력한 거래량 동반 이동평균선 돌파', premium: true },
    { id: 2, type: 'SELL', stock: 'SK하이닉스', code: '000660', price: 195000, change: '-1.0%', time: '2025-05-27 10:00', strength: '중간', reason: '단기 과열 및 저항선 도달', premium: true },
    { id: 3, type: 'HOLD', stock: '네이버', code: '035420', price: 180000, change: '+0.5%', time: '2025-05-27 09:45', strength: '보통', reason: '특별한 변동성 없음', premium: false }, // 비로그인도 볼 수 있는 신호
    { id: 4, type: 'BUY', stock: '카카오', code: '035720', price: 50000, change: '+3.2%', time: '2025-05-27 09:30', strength: '강함', reason: '바닥 다지기 후 매수 시그널 발생', premium: true },
    { id: 5, type: 'WATCH', stock: '현대차', code: '005380', price: 230000, change: '-0.8%', time: '2025-05-27 09:00', strength: '약함', reason: '추세 전환 가능성 모니터링', premium: false }, // 비로그인도 볼 수 있는 신호
  ];

  // 로그인 상태에 따라 보여줄 신호 필터링
  const displaySignals = isLoggedIn
    ? allSignals
    : allSignals.filter(signal => !signal.premium); // premium: false인 신호만 보여줌

  return (
    <div className="signal-page-container">
      <h2 className="signal-page-title">AI 매매 신호</h2>
      <p className="signal-page-description">
        AI가 분석한 실시간 매매 신호를 제공합니다.
        {!isLoggedIn && (
          <span className="login-prompt">
            &nbsp;더 많은 프리미엄 신호와 상세 정보를 보려면 <a href="/login">로그인</a>하세요!
          </span>
        )}
      </p>

      {displaySignals.length === 0 && (
        <p className="no-signal-message">
          현재 표시할 수 있는 신호가 없습니다.
          {!isLoggedIn && " 로그인하시면 더 많은 신호를 확인할 수 있습니다."}
        </p>
      )}

      <div className="signal-list">
        {displaySignals.map(signal => (
          <div key={signal.id} className={`signal-card ${signal.type.toLowerCase()}`}>
            <div className="signal-header">
              <span className={`signal-type ${signal.type.toLowerCase()}-text`}>
                {signal.type === 'BUY' && '매수'}
                {signal.type === 'SELL' && '매도'}
                {signal.type === 'HOLD' && '보유'}
                {signal.type === 'WATCH' && '관망'}
              </span>
              <span className="signal-time">{signal.time}</span>
            </div>
            <div className="stock-info">
              <span className="stock-name">{signal.stock}</span>
              <span className="stock-code">({signal.code})</span>
            </div>
            <div className="price-info">
              <span className="current-price">{signal.price.toLocaleString()}원</span>
              <span className={`change ${parseFloat(signal.change) > 0 ? 'positive' : 'negative'}`}>
                {signal.change}
              </span>
            </div>
            {isLoggedIn && (
              <div className="premium-info">
                <p className="signal-strength">
                  신호 강도: <strong className={
                    signal.strength === '매우 강함' ? 'strength-high' :
                    signal.strength === '강함' ? 'strength-medium' :
                    'strength-low'
                  }>{signal.strength}</strong>
                </p>
                <p className="signal-reason">근거: {signal.reason}</p>
                {/* 추가적으로 목표가, 손절가 등의 상세 정보 표시 가능 */}
              </div>
            )}
            {!isLoggedIn && signal.premium && (
              <div className="premium-overlay">
                <p>로그인 후 상세 정보 확인</p>
                <button onClick={() => window.location.href = '/login'}>로그인하기</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Signal;