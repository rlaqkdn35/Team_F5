import React from 'react';
import { Outlet } from 'react-router-dom'; // 중첩 라우트의 자식 컴포넌트를 렌더링
import SubNavigation from '../../components/common/SubNavigation/SubNavigation.jsx';
import './AiInfoPage.css'; // AiInfoPageLayout 스타일

const aiInfoSubNavLinks = [ // 실제로는 이 데이터를 props로 받거나 Context 등에서 가져올 수 있습니다.
  { name: 'AI정보분석 홈', path: '/ai-info' },
  { name: '시세분석', path: '/ai-info/price-analysis' },
  { name: '이슈분석', path: '/ai-info/issue-analysis' },
  // { name: '수급분석', path: '/ai-info/supply-demand-analysis' },
  { name: '테마/업종', path: '/ai-info/theme-sector' },
  // { name: '공시분석', path: '/ai-info/disclosure-analysis' },
  // { name: '리포트분석', path: '/ai-info/report-analysis' },
  { name: '뉴스', path: '/ai-info/news' },
];

const AiInfoPageLayout = () => {
  return (
    <div className="ai-info-page-container">
      <SubNavigation links={aiInfoSubNavLinks} basePath="/ai-info" />
      <div className="page-content-area">
        {/* 여기에 /ai-info 의 하위 경로에 해당하는 컴포넌트가 렌더링됩니다. */}
        <Outlet /> 
      </div>
    </div>
  );
};

export default AiInfoPageLayout;