import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './BubbleChart.css';

const BubbleChart = ({ data, onBubbleClick, activeBubbleId, width = 600, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) {
      console.warn('No data provided for BubbleChart');
      return; // 데이터가 없으면 렌더링 중단
    }

    // 데이터 변환: { keywordName, totalCount, numArticlesMentionedIn } -> { text, value, id }
    const formattedData = data.map(item => ({
      text: item.keywordName || 'Unknown', // keywordName을 text로 사용
      value: Number(item.totalCount) || 0, // totalCount를 value로 매핑, 숫자로 변환
      id: (item.keywordName || 'unknown').toLowerCase().replace(/\s+/g, '_'), // id 생성
      numArticlesMentionedIn: Number(item.numArticlesMentionedIn) || 0, // 추가 정보 유지
    }));

    // 유효한 데이터 필터링
    const validData = formattedData.filter(d => d.value >= 0);
    if (validData.length === 0) {
      console.warn('No valid data for BubbleChart after filtering');
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 기존 SVG 내용 제거

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // SVG 크기 설정 및 그룹 요소 추가
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 스케일 설정 (버블 크기 조절)
    const maxValue = d3.max(validData, d => d.value) || 1; // maxValue가 0이 되지 않도록
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, maxValue])
      .range([10, Math.min(chartWidth, chartHeight) / 4]); // 차트 크기에 비례한 최대 반지름

    const colorScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range(['#F0F0F0', '#A88AFF']); // 연보라 계열로 변경

    // D3 팩(Pack) 레이아웃 설정
    const pack = d3.pack()
      .size([chartWidth, chartHeight])
      .padding(5); // 버블 간 패딩 추가

    // 계층적 데이터 구조 생성
    const root = d3
      .hierarchy({ children: validData })
      .sum(d => d.value || 0); // 각 노드의 크기를 value로 설정

    // 팩 레이아웃 적용
    const nodes = pack(root).leaves();

    // 버블 그리기
    const bubble = g
      .selectAll('.bubble')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .classed('active', d => d.data.id === activeBubbleId) // 이 버블의 ID가 activeBubbleId와 일치하면 'active' 클래스 추가
      .attr('transform', d => {
        const x = isNaN(d.x) ? chartWidth / 2 : d.x; // x가 NaN이면 기본값
        const y = isNaN(d.y) ? chartHeight / 2 : d.y; // y가 NaN이면 기본값
        return `translate(${x},${y})`;
      })
      .on('click', function(event, d) {
        // 모든 버블의 'active' 클래스를 직접 제거하는 대신,
        // 부모 컴포넌트의 handleBubbleClick을 호출하여 상태를 변경합니다.
        // D3는 다음에 렌더링될 때 activeBubbleId에 따라 클래스를 다시 설정합니다.
        if (onBubbleClick) {
          onBubbleClick(d.data);
        }
      });
    bubble
      .append('circle')
      .attr('r', d => (isNaN(d.r) ? 10 : d.r)) // r이 NaN이면 기본값 10
      .attr('fill', d => colorScale(d.data.value || 0))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0);

    bubble.append('text')
      .attr('dy', '0.35em') // 텍스트를 원의 중앙에 정렬
      .text(d => d.data.text) // 버블에 표시될 텍스트
      .style('font-size', d => {
    // d.r은 D3 pack 레이아웃에 의해 계산된 실제 버블의 반지름입니다.
    const radius = d.r;

    // 기본 폰트 크기 비율: 반지름의 몇 분의 1로 할지 결정합니다.
    // 이 값을 조절하여 텍스트 크기를 변경할 수 있습니다. (예: 2, 2.5, 3 등)
    // 숫자가 클수록 텍스트는 버블에 비해 작아집니다.
    const baseFontSize = radius / 3.5;

    // 최소/최대 폰트 크기 (px 단위)
    const minFontSize = 5;  // 너무 작은 버블에서도 최소한의 가독성을 확보
    const maxFontSize = 20; // 너무 큰 버블에서 텍스트가 과도하게 커지는 것을 방지

    // 계산된 폰트 크기를 최소/최대값 사이로 제한
    const fontSize = Math.max(minFontSize, Math.min(baseFontSize, maxFontSize));

    return `${fontSize}px`;
  })
      .style('text-anchor', 'middle') // 텍스트 가운데 정렬
      .style('fill', 'white') // 텍스트 색상
      .style('pointer-events', 'none'); // 클릭 이벤트 통과
  }, [data, onBubbleClick, width, height]); // 의존성 배열

  return (
    <div className="bubble-chart-wrapper">
      <svg className="bubble-svg" ref={svgRef}></svg> {/* D3 렌더링 SVG */}
    </div>
  );
};

export default BubbleChart;