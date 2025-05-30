// AiPicksPageLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import SubNavigation from '../../components/common/SubNavigation/SubNavigation.jsx';
import './AiPicksPageLayout.css';

const aiPicksSubNavLinks = [
  { name: 'AI종목추천홈', path: '/ai-picks' },
  { name: '오늘의 종목', path: '/ai-picks/today' },
  { name: 'AI 추천', path: '/ai-picks/recommendations' },
  { name: '매매신호', path: '/ai-picks/signal' }, 
];

const AiPicksPageLayout = () => {
  return (
    <div className="ai-picks-page-layout">
      {/* <SubNavigation links={aiPicksSubNavLinks} basePath="/ai-picks" /> */}
      <div className="page-content-area">
        <Outlet />
      </div>
    </div>
  );
};
export default AiPicksPageLayout;