// Page/MyPage/MyPageLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SubNavigation from '../../components/common/SubNavigation/SubNavigation.jsx';
import './MyPageLayout.css';

// 마이페이지 서브 내비게이션 링크 정의
const myPageSubNavLinks = [
  { name: 'AI 비서', path: '/mypage' },
  { name: '관심 종목', path: '/mypage/favorite' },
  { name: '계정 정보', path: '/mypage/profile' },
];

const MyPageLayout = () => {
  const location = useLocation();

  return (
    <div className="my-page-layout-container">
      <aside className="mypage-sidebar">
        <SubNavigation 
          links={myPageSubNavLinks} 
          basePath="/mypage"
        />
      </aside>

      <main className="mypage-content-outlet">
        <Outlet />
      </main>
    </div>
  );
};

export default MyPageLayout;
