import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink를 사용하여 활성 링크 스타일링
import PropTypes from 'prop-types';
import './SubNavigation.css'; // SubNavigation 스타일

const SubNavigation = ({ links, basePath = "" }) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <nav className="sub-navigation-bar">
      <ul className="sub-navigation-list">
        {links.map((link) => (
          <li key={link.name} className="sub-navigation-item">
            <NavLink
              to={link.path}
              // 'end' prop은 부모 경로와 정확히 일치할 때만 active 클래스를 적용하도록 도와줍니다.
              // 예를 들어 /ai-info 와 /ai-info/price-analysis 가 있을 때,
              // /ai-info/price-analysis 접속 시 /ai-info 링크는 active가 되지 않도록 합니다.
              // (단, link.path가 basePath와 정확히 같을 때만 end를 적용하거나, 모든 링크에 적용할지 결정)
              end={link.path === basePath || links.find(l => l.path === basePath && l.name === link.name)}
              className={({ isActive }) =>
                isActive ? "sub-nav-link active" : "sub-nav-link"
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

SubNavigation.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ).isRequired,
  basePath: PropTypes.string, // 해당 서브네비게이션의 기본 경로 (선택적)
};

export default SubNavigation;