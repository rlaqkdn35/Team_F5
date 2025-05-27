
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3'; // D3 라이브러리 임포트
import './BubbleChart.css'; // 이 컴포넌트의 스타일 파일 (다음 단계에서 생성)

const BubbleChart = ({ data, onBubbleClick, width = 600, height = 400 }) => {
  const svgRef = useRef(); // SVG 요소를 참조할 ref

  // D3 렌더링 로직
  useEffect(() => {
    const svg = d3.select(svgRef.current); // SVG 요소 선택
    svg.selectAll('*').remove(); // 기존 SVG 내용을 모두 지웁니다 (업데이트 시 중복 렌더링 방지)

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // SVG 크기 설정 및 그룹 요소 추가
    const g = svg.attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 스케일 설정 (버블 크기 조절)
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.value)]) // 데이터의 value 범위에 따라 크기 조절
      .range([10, 200]); // 버블의 최소/최대 반지름

    // D3 팩(Pack) 레이아웃 설정 (버블 겹치지 않게 배치)
    const pack = d3.pack()
      .size([chartWidth, chartHeight])
      .padding(0); // 버블 간의 패딩

    // 계층적 데이터 구조 생성 (팩 레이아웃을 위해 필요)
    const root = d3.hierarchy({ children: data }) // 가상의 루트 노드 생성
      .sum(d => d.value); // 각 노드의 크기를 d.value로 설정

    // 팩 레이아웃 적용하여 버블 데이터 계산
    const nodes = pack(root).leaves(); // 'leaves'는 가장 하위의 데이터 노드들입니다.

    // 버블 그리기
    const bubble = g.selectAll('.bubble')
      .data(nodes)
      .enter().append('g')
        .attr('class', 'bubble')
        .attr('transform', d => `translate(${d.x},${d.y})`) // 버블의 중심 위치 설정
        .on('click', (event, d) => onBubbleClick(d.data)); // 클릭 이벤트 핸들러

    bubble.append('circle')
      .attr('r', d => d.r) // 반지름 설정
      .attr('fill', '#007bff') // 기본 색상 (CSS에서 오버라이드 가능)
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    bubble.append('text')
      .attr('dy', '0.35em') // 텍스트를 원의 중앙에 정렬
      .text(d => d.data.text) // 버블에 표시될 텍스트
      .style('font-size', d => `${Math.min(20, sizeScale(d.data.value) * 0.4)}px`) // 버블 크기에 따라 폰트 크기 조절
      .style('text-anchor', 'middle') // 텍스트 가운데 정렬
      .style('fill', 'white') // 텍스트 색상
      .style('pointer-events', 'none'); // 텍스트 위로 마우스 이벤트를 통과시켜 버블 클릭 가능하게 함

  }, [data, onBubbleClick, width, height]); // 데이터나 크기 변경 시 재렌더링

  return (
    <div className="bubble-chart-wrapper">
      <svg className="bubble-svg" ref={svgRef}></svg> {/* D3가 그림을 그릴 SVG 요소 */}
    </div>
  );
};

export default BubbleChart;