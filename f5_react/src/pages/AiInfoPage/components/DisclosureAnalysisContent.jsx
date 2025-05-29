// src/pages/AiInfoPage/components/DisclosureAnalysisContent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DisclosureAnalysisContent.css';

// 메인 탭 정의
const MAIN_DISCLOSURE_TABS = [
  { id: 'byType', name: '공시 유형별 분석' },
  { id: 'all', name: '공시 전체 보기' },
];

// "공시 유형별 분석" 탭 내의 하위 탭(공시 유형) 및 각 테이블 컬럼 정의
const DISCLOSURE_TYPES = [
  { 
    id: 'contract', name: '수주공시', 
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-dac' }, // DAC: DisclosureAnalysisContent
      { key: 'stockName', header: '종목명', className: 'col-name-dac' },
      { key: 'contractAmount', header: '계약금액', className: 'col-amount-dac' },
      { key: 'salesRatio', header: '매출액대비', className: 'col-ratio-dac' },
      { key: 'contractPeriod', header: '계약기간', className: 'col-period-dac' },
      { key: 'contractDetails', header: '계약내용', className: 'col-details-dac' },
      { key: 'contractParty', header: '계약상대', className: 'col-party-dac' },
    ]
  },
  { 
    id: 'equity', name: '지분공시',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-dac' },
      { key: 'stockName', header: '종목명', className: 'col-name-dac' },
      { key: 'reporter', header: '보고자', className: 'col-reporter-dac' },
      { key: 'relationship', header: '관계', className: 'col-relationship-dac' },
      { key: 'reportReason', header: '보고사유', className: 'col-reason-dac' },
      { key: 'changeShares', header: '증감 주식수', className: 'col-shares-dac' },
      { key: 'changeRatio', header: '증감 비율', className: 'col-change-ratio-dac' },
    ]
  },
  {
    id: 'newInvestment', name: '신규투자공시',
    columns: [
      { key: 'analysisDate', header: '분석날짜', className: 'col-date-dac' },
      { key: 'stockName', header: '종목명', className: 'col-name-dac' },
      { key: 'investmentAmount', header: '투자금액', className: 'col-amount-dac' },
      { key: 'equityRatio', header: '자기자본대비', className: 'col-ratio-dac' },
      { key: 'investmentStart', header: '투자시작', className: 'col-period-dac' },
      { key: 'investmentEnd', header: '투자종료', className: 'col-period-dac' },
      { key: 'investmentPurpose', header: '투자내용 및 목적', className: 'col-details-dac' },
    ]
  },
  {
    id: 'convertibleBond', name: '전환사채공시',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-dac' },
      { key: 'stockName', header: '종목명', className: 'col-name-dac' },
      { key: 'bondType', header: '사채종류', className: 'col-type-dac' },
      { key: 'totalAmount', header: '총액', className: 'col-amount-dac' },
      { key: 'maturityDate', header: '만기일', className: 'col-date-dac type2' }, // 날짜지만 다른 스타일 필요시
      { key: 'stockType', header: '주식종류', className: 'col-type-dac' },
      { key: 'shareInfo', header: '주식수(비율)', className: 'col-shares-dac type2' },
      { key: 'claimPeriod', header: '전환청구기간', className: 'col-period-dac type2' },
    ]
  },
  {
    id: 'earnings', name: '실적공시',
    columns: [
      { key: 'date', header: '날짜', className: 'col-date-dac' },
      { key: 'stockName', header: '종목명', className: 'col-name-dac' },
      { key: 'period', header: '기준', className: 'col-period-dac' }, // 예: 2023년, 1분기 등
      { key: 'revenue', header: '매출액', className: 'col-amount-dac' },
      { key: 'operatingProfit', header: '영업이익', className: 'col-amount-dac type2' },
      { key: 'netProfit', header: '당기순이익', className: 'col-amount-dac type3' },
    ]
  },
];

// 임시 목업 데이터 생성 함수
const getMockDisclosureData = (mainTabId, disclosureTypeId) => {
  if (mainTabId === 'all') {
    // '공시 전체 보기' 탭 데이터 (이전과 동일하게 유지 또는 필요에 따라 수정)
    const allItems = [];
    for (let i = 1; i <= 15; i++) {
      const randomTypeIndex = i % DISCLOSURE_TYPES.length;
      allItems.push({
        id: `all_disclosure_${i}`,
        date: `2024-05-${String(10 + i).padStart(2, '0')}`,
        type: DISCLOSURE_TYPES[randomTypeIndex].name,
        stockName: `종목 ${String.fromCharCode(65 + i)}`, // 예: 종목 A, 종목 B
        code: `D${String.fromCharCode(65 + i)}00${i}`,    // 예: DA001
        titleSummary: `${DISCLOSURE_TYPES[randomTypeIndex].name} 관련 주요 내용 요약 ${i}`,
      });
    }
    return allItems;
  }

  // '공시 유형별 분석' 탭 데이터
  const items = [];
  const typeConfig = DISCLOSURE_TYPES.find(dt => dt.id === disclosureTypeId);
  const typeName = typeConfig?.name || disclosureTypeId;
  const numItems = 5; // 각 유형별로 5개의 목업 데이터 생성

  for (let i = 1; i <= numItems; i++) {
    let itemBase = {
      id: `${disclosureTypeId}_${i}`,
      // '공시일' 또는 '분석날짜'는 공통적으로 사용될 수 있는 날짜로 설정
      date: `05/${String(20 - i).padStart(2, '0')}`, // 최근 날짜부터 보이도록 예시 변경
      analysisDate: `05/${String(20 - i).padStart(2, '0')}`,
      stockName: `${typeName} 발생 기업 ${i}`,
      code: `E${disclosureTypeId.substring(0,1).toUpperCase()}${i.toString().padStart(3,'0')}`,
    };

    switch (disclosureTypeId) {
      case 'contract': // 수주공시
        itemBase = { 
          ...itemBase, 
          contractAmount: `${(Math.floor(Math.random()*900)+100)}억원`, 
          salesRatio: `${(Math.random()*30+1).toFixed(1)}%`, 
          contractPeriod: `2024.05.${20-i}~2026.05.${20-i}`, 
          contractDetails: `신규 ${typeName} 체결 (내용 ${i})`, 
          contractParty: `(주)계약상대방${i}`
        };
        break;
      case 'equity': // 지분공시
        itemBase = {
          ...itemBase, 
          reporter: `보고자 ${String.fromCharCode(65 + i)}`, 
          relationship: (i%2===0 ? '최대주주' : '주요임원'), 
          reportReason: (i%3===0 ? '장내매수' : (i%3===1 ? '장내매도': '기타 변동')), 
          changeShares: `${(Math.floor(Math.random()*20000)-10000).toLocaleString()}주`, // 증감 표현
          changeRatio: `${(Math.random()*2-1).toFixed(2)}%` // 증감 표현
        };
        break;
      case 'newInvestment': // 신규투자공시
        itemBase = {
          ...itemBase,
          investmentAmount: `${(Math.floor(Math.random()*450)+50)}억원`,
          equityRatio: `${(Math.random()*25+5).toFixed(1)}%`,
          investmentStart: `2024.06.01`,
          investmentEnd: `2028.05.31`,
          investmentPurpose: `미래 성장 동력 확보를 위한 ${typeName} 목적의 투자 ${i}`,
        };
        break;
      case 'convertibleBond': // 전환사채공시
        itemBase = {
          ...itemBase,
          bondType: (i%2===0 ? '전환사채(CB)' : '신주인수권부사채(BW)'),
          totalAmount: `${(Math.floor(Math.random()*250)+50)}억원`,
          maturityDate: `2027-06-${String(10+i).padStart(2,'0')}`,
          stockType: '보통주',
          shareInfo: `${Math.floor(Math.random()*400000+100000).toLocaleString()}주 (${(Math.random()*12+3).toFixed(1)}%)`,
          claimPeriod: `2025.06.${String(10+i).padStart(2,'0')} ~ 2027.05.${String(10+i).padStart(2,'0')}`,
        };
        break;
      case 'earnings': // 실적공시
        itemBase = {
          ...itemBase,
          period: `2024년 ${Math.ceil(i/2)}분기`, // 예시: 1분기, 2분기, 3분기
          revenue: `${(Math.floor(Math.random()*1800)+200)}억원`,
          operatingProfit: `${(Math.floor(Math.random()*150)-50)}억원`, // 음수 이익(손실) 가능
          netProfit: `${(Math.floor(Math.random()*120)-40)}억원`, // 음수 이익(손실) 가능
        };
        break;
      default: // 혹시 다른 타입이 추가될 경우를 위한 기본값
        itemBase.feature = `${typeName} 관련 일반 내용 ${i}`;
        break;
    }
    items.push(itemBase);
  }
  return items;
};

// 재사용 가능한 테이블 컴포넌트 (내부 또는 별도 파일)
const DisclosureTable = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return <p className="no-data-message-dac">해당 공시 정보가 없습니다.</p>;
  }
  return (
    <div className="disclosure-list-table-dac">
      <div className="table-header-dac">
        {columns.map(col => (
          <span key={col.key} className={col.className}>{col.header}</span>
        ))}
      </div>
      <ul className="table-body-dac">
        {data.map(item => (
          <li key={item.id} className="table-row-dac">
            {columns.map(col => (
              <span key={col.key} className={col.className} title={item[col.key]}>
                {col.key === 'stockName' ? (
                  <Link to={`/stock-detail/${item.code}`}>{item[col.key]}</Link>
                ) : (
                  item[col.key]
                )}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};


const DisclosureAnalysisContent = () => {
  const [activeMainTab, setActiveMainTab] = useState(MAIN_DISCLOSURE_TABS[0].id);
  const [activeDisclosureType, setActiveDisclosureType] = useState(DISCLOSURE_TYPES[0].id); // '공시 유형별' 탭의 기본 활성 하위 탭
  const [disclosureData, setDisclosureData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let data;
    if (activeMainTab === 'byType') {
      data = getMockDisclosureData(activeMainTab, activeDisclosureType);
    } else { // 'all'
      data = getMockDisclosureData(activeMainTab, null);
    }
    setDisclosureData(data);
    setLoading(false);
  }, [activeMainTab, activeDisclosureType]);

  const currentTypeConfig = DISCLOSURE_TYPES.find(type => type.id === activeDisclosureType);
  const currentColumns = activeMainTab === 'byType' && currentTypeConfig ? currentTypeConfig.columns : [
    // '공시 전체 보기' 탭의 기본 컬럼 (예시)
    { key: 'date', header: '날짜', className: 'col-date-dac all-view' },
    { key: 'type', header: '공시유형', className: 'col-type-dac all-view' },
    { key: 'stockName', header: '종목명', className: 'col-name-dac all-view' },
    { key: 'titleSummary', header: '제목/요약', className: 'col-summary-dac all-view' },
  ];


  return (
    <div className="disclosure-analysis-content-page">
      <h1 className="page-main-title-dac">공시 분석</h1>

      <div className="main-disclosure-tabs-container">
        {MAIN_DISCLOSURE_TABS.map(tab => (
          <button
            key={tab.id}
            className={`main-disclosure-tab-button ${activeMainTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveMainTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="disclosure-tab-content">
        {loading ? (
          <p className="loading-message-dac">데이터를 불러오는 중입니다...</p>
        ) : (
          <>
            {activeMainTab === 'byType' && (
              <div className="disclosure-type-tabs-container">
                {DISCLOSURE_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`disclosure-type-tab-button ${activeDisclosureType === type.id ? 'active' : ''}`}
                    onClick={() => setActiveDisclosureType(type.id)}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            )}
            <DisclosureTable data={disclosureData} columns={currentColumns} />
            {/* 페이지네이션 또는 '더보기' 버튼이 필요하다면 여기에 추가 */}
          </>
        )}
      </div>
    </div>
  );
};

export default DisclosureAnalysisContent;