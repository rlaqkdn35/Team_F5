import React from 'react';
import { Outlet } from 'react-router-dom';
import SubNavigation from '../../components/common/SubNavigation/SubNavigation.jsx'; // 공통 SubNavigation 컴포넌트
import './ForumPageLayout.css'; // 이 레이아웃의 스타일 파일

// 토론실 섹션 하위 메뉴 링크 정의
const forumSubNavLinks = [
  { name: '소셜분석', path: '/forum' },
  { name: '주식종합토론', path: '/forum/discussion' }, // 토론실의 기본 홈 (index route)
  { name: '증권가 속보', path: '/forum/market-newsflash' }, // '증권가속보' -> '증권가 속보' (띄어쓰기 수정)
  { name: '특징주 포착', path: '/forum/noteworthy-stocks' }, // '특징주포착' -> '특징주 포착'
  { name: '정치방', path: '/forum/politics' },
  { name: '나의 활동', path: '/forum/my-activity' }, // 로그인 필요한 메뉴
];

const ForumPageLayout = () => {
  return (
    <div className="forum-page-layout">
      {/* 페이지 제목은 이 레이아웃을 사용하는 각 페이지 컴포넌트에서 개별적으로 h1 등으로 표시하거나,
          혹은 여기에 고정적으로 "토론실"과 같은 제목을 둘 수도 있습니다.
          SubNavigation에서 현재 선택된 링크 이름이 강조되므로, 별도 제목이 없어도 될 수 있습니다.
      */}
      {/* <SubNavigation links={forumSubNavLinks} basePath="/forum" /> */}
      <div className="forum-content-outlet-container"> {/* Outlet을 감싸는 div */}
        <Outlet /> {/* 여기에 각 하위 경로에 맞는 컴포넌트가 렌더링됩니다. */}
      </div>
    </div>
  );
};

export default ForumPageLayout;