
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
    const maxValue = d3.max(data, d => d.value);

    const colorScale = d3.scaleLinear()
      .domain([0, maxValue]) // 데이터의 value 범위 (0에서 최댓값까지)
      // .range(['#ADD8E6', '#00008B']); // 예시 1: 연한 파랑 -> 진한 파랑
      .range(['#ffcdd2', '#f44336']); // 예시 2: 빨간색 계열 - 연한 빨강 -> 진한 빨강
                                    // #ffcdd2는 밝은 빨강, #f44336는 당신의 메인 빨강입니다.
                                    // 필요에 따라 더 어두운 빨강으로 #b71c1c 등을 쓸 수 있습니다.
      // .range(['#ffcdd2', '#c62828']); // 더 진한 빨강 범위

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
      .attr('fill', d => colorScale(d.data.value))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    bubble.append('text')
      .attr('dy', '0.35em') // 텍스트를 원의 중앙에 정렬
      .text(d => d.data.text) // 버블에 표시될 텍스트
      .style('font-size', d => {
    // d.r은 D3 pack 레이아웃에 의해 계산된 실제 버블의 반지름입니다.
    const radius = d.r;

    // 기본 폰트 크기 비율: 반지름의 몇 분의 1로 할지 결정합니다.
    // 이 값을 조절하여 텍스트 크기를 변경할 수 있습니다. (예: 2, 2.5, 3 등)
    // 숫자가 클수록 텍스트는 버블에 비해 작아집니다.
    const baseFontSize = radius / 3;

    // 최소/최대 폰트 크기 (px 단위)
    const minFontSize = 5;  // 너무 작은 버블에서도 최소한의 가독성을 확보
    const maxFontSize = 20; // 너무 큰 버블에서 텍스트가 과도하게 커지는 것을 방지

    // 계산된 폰트 크기를 최소/최대값 사이로 제한
    const fontSize = Math.max(minFontSize, Math.min(baseFontSize, maxFontSize));

    return `${fontSize}px`;
  })
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