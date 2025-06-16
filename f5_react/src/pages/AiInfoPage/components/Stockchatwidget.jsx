import React, { useState, useEffect, useRef } from 'react';
import Stockchat from './Stockchat';
import { FaComments } from 'react-icons/fa';
import './Stockchatwidget.css'; // 외부 CSS 파일 임포트

function StockchatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetWrapperRef = useRef(null); // 위젯 래퍼 div에 대한 ref

  const toggleChat = () => setIsOpen(prev => !prev);

  // 나뭇잎 애니메이션을 위한 useEffect 훅
  useEffect(() => {
    if (!isOpen || !widgetWrapperRef.current) return; // 위젯이 닫혀있거나 ref가 없으면 아무것도 하지 않음

    const wrapper = widgetWrapperRef.current;
    const leaves = [];
    const numberOfLeaves = 10; // 떨어뜨릴 나뭇잎의 개수 (원하는 만큼 조절)

    const createLeaf = () => {
      const leaf = document.createElement('div');
      leaf.classList.add('autumn-leaf'); // CSS에서 정의할 클래스
      leaf.textContent = Math.random() > 0.5 ? '🍂' : '🍁'; // 무작위 나뭇잎 이모지

      // 무작위 초기 위치 및 애니메이션 속성 설정
      const startX = Math.random() * wrapper.clientWidth; // 위젯 너비 내에서 무작위 시작 X
      const duration = 8 + Math.random() * 7; // 8초에서 15초 사이의 무작위 지속 시간
      const delay = Math.random() * 5; // 0초에서 5초 사이의 무작위 지연 시간
      const rotation = Math.random() * 720 - 360; // -360도에서 360도 사이의 무작위 회전
      const endXOffset = Math.random() * 100 - 50; // -50px에서 50px 사이의 무작위 수평 이동 오프셋

      leaf.style.left = `${startX}px`;
      leaf.style.animation = `fallAndRotate ${duration}s linear ${delay}s infinite`;
      leaf.style.setProperty('--end-y', `${wrapper.clientHeight + 100}px`); // 위젯 높이 + 여유 공간
      leaf.style.setProperty('--end-x-offset', `${endXOffset}px`); // 수평 이동 오프셋 변수 설정
      leaf.style.setProperty('--rotation', `${rotation}deg`); // 회전 변수 설정
      leaf.style.fontSize = `${20 + Math.random() * 10}px`; // 20px에서 30px 사이의 무작위 크기

      wrapper.appendChild(leaf);
      leaves.push(leaf);

      // 애니메이션이 끝나면 DOM에서 제거하여 메모리 관리 (무한 반복이므로 필요에 따라 조정)
      // 이 예제에서는 무한 반복이므로 제거 로직은 생략합니다.
      // 실제 프로젝트에서는 애니메이션 종료 후 요소를 제거하는 것이 좋습니다.
    };

    // 초기 나뭇잎 생성
    for (let i = 0; i < numberOfLeaves; i++) {
      createLeaf();
    }

    // 컴포넌트 언마운트 시 또는 위젯이 닫힐 때 나뭇잎 요소 제거
    return () => {
      leaves.forEach(leaf => leaf.remove());
    };
  }, [isOpen]); // isOpen 상태가 변경될 때마다 효과 재실행

  return (
    <>
      <button
        onClick={toggleChat}
        className="stockchat-autumn-toggle-button"
      >
        <FaComments />
      </button>

      {isOpen && (
        <div
          className="stockchat-autumn-widget-wrapper"
          ref={widgetWrapperRef} // ref 연결
        >
          <Stockchat />
        </div>
      )}
    </>
  );
}

export default StockchatWidget;