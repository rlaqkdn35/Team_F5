import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './MainPage.css'; // CSS 파일은 여기에 스타일 추가 또는 MainPage.css 사용
import { useNavigate } from 'react-router-dom';

// --- 애니메이션 상수 ---
const transition = { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] };

const splashVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 1.5, type: 'spring', stiffness: 100 } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 1, ...transition } },
};

const backgroundVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.5, delay: 0.2, ...transition } },
};

const topRightTextVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0, transition: { duration: 1, delay: 0.7, ...transition } },
};

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ...transition } },
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.2,
      ...transition,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition },
};

const cardHoverVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 15px 30px rgba(0,0,0,0.15)",
    borderColor: "#007bff",
    transition: { duration: 0.3 }
  }
};

const buttonHoverVariants = {
  hover: { scale: 1.05, backgroundColor: "#0056b3", boxShadow: "0px 8px 20px rgba(0,86,179,0.4)" },
  tap: { scale: 0.95 }
};

// 헤더 애니메이션 Variants
const headerMotionVariants = {
  hidden: { y: '-100%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { duration: 0.4, ease: 'easeInOut' } },
  exit: { y: '-100%', opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
};


// --- 아이콘 컴포넌트 (예시) ---
const AiIcon = ({ char = "💡", color = "#007bff" }) => (
  <motion.div
    className="ai-icon-wrapper"
    style={{ backgroundColor: color }}
    variants={itemVariants}
    whileHover={{ rotate: [0, 15, -10, 15, 0], transition: { duration: 0.5 } }}
  >
    {char}
  </motion.div>
);

// --- 숫자 카운팅 애니메이션 컴포넌트 ---
const AnimatedNumber = ({ value, duration = 1.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef(null); // Renamed ref to avoid conflict with useInView's ref
  const { ref: inViewRefHook, inView } = useInView({ triggerOnce: true, threshold: 0.5 }); // Assign useInView's ref to a different variable

  // Combine refs
  const setRefs = useCallback(
    (node) => {
      countRef.current = node;
      inViewRefHook(node);
    },
    [inViewRefHook]
  );

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseFloat(String(value).replace(/,/g, ''));
      if (isNaN(end)) {
        setDisplayValue(String(value));
        return;
      }

      if (start === end) {
        setDisplayValue(end % 1 === 0 ? end.toLocaleString() : end.toFixed(1));
        return;
      }

      const range = end - start;
      let current = start;
      const animationFrames = Math.max(Math.floor(duration * 60), 1);
      const incrementPerFrame = range / animationFrames;
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        current += incrementPerFrame;

        if (frame >= animationFrames) {
          current = end;
          clearInterval(timer);
        }
        setDisplayValue(current % 1 === 0 || current.toFixed(1).endsWith('.0') ? Math.round(current).toLocaleString() : current.toFixed(1));
      }, duration * 1000 / animationFrames);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  useEffect(() => {
    if (!inView) {
      setDisplayValue(isNaN(parseFloat(String(value).replace(/,/g, ''))) ? String(value) : 0);
    }
  }, [inView, value]);

  return <span ref={setRefs}>{displayValue}</span>;
};

// --- Accuracy Bar Fill 컴포넌트 (자체 InView 사용) ---
const AccuracyBarFill = ({ percentage }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div ref={ref} className="accuracy-bar-wrapper">
      <motion.div
        className="accuracy-bar-fill"
        initial={{ width: 0 }}
        animate={inView ? { width: `${percentage}%`, transition: { duration: 2, delay: 0.2, ease: "circOut" } } : { width: 0 }}
      />
    </div>
  );
};

// --- SectionWrapper 컴포넌트 (MainPage 외부로 이동) ---
const SectionWrapper = ({ children, sectionIndex, className = "", onSectionRef }) => {
  const { ref: inViewRef, inView } = useInView({ // Renamed to avoid potential naming conflicts
    threshold: 0.3,
    triggerOnce: true,
  });

  const combinedRef = useCallback(
    (el) => {
      inViewRef(el); // For useInView
      if (onSectionRef) { // For MainPage's sectionsRef
        onSectionRef(sectionIndex, el);
      }
    },
    [inViewRef, onSectionRef, sectionIndex] // Dependencies for useCallback
  );

  return (
    <motion.section
      ref={combinedRef}
      className={`section ${className}`}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0.8, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
      }}
    >
      {children}
    </motion.section>
  );
};


// --- MainPage 컴포넌트 ---
export default function MainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('main-page-active');
    return () => {
      document.body.classList.remove('main-page-active');
    };
  }, []);

  const [showSplash, setShowSplash] = useState(true);
  const [showChartText, setShowChartText] = useState(false);
  const [activeSection, setActiveSection] = useState(0); // setActiveSection is stable
  const sectionsRef = useRef([]);

  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 3000);
    const chartTextTimer = setTimeout(() => setShowChartText(true), 3300);

    const handleMouseMoveForHeader = (event) => {
      const y = event.clientY;
      if (y < 70) {
        // Only update if state needs to change to prevent unnecessary re-renders
        setIsHeaderVisible(prev => !prev ? true : prev);
      } else if (y > 150) {
        // Only update if state needs to change
        setIsHeaderVisible(prev => prev ? false : prev);
      }
    };

    window.addEventListener('mousemove', handleMouseMoveForHeader);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(chartTextTimer);
      window.removeEventListener('mousemove', handleMouseMoveForHeader);
    };
  }, []); // Empty dependency array ensures this runs only once

  const assignSectionRef = useCallback((index, element) => {
    sectionsRef.current[index] = element;
  }, []); // This callback is stable

  const scrollToSection = useCallback((index) => {
    if (sectionsRef.current[index]) {
      sectionsRef.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setActiveSection(index);
    }
  }, [setActiveSection]); // Include setActiveSection if its stability isn't guaranteed by useState dispatch nature
                           // Though React's setState dispatchers are stable.

  const goToHome = () => {
    navigate('/ai-info')
  };

  return (
    <div className="mainpage-container">
      <AnimatePresence>
        {isHeaderVisible && (
          <motion.header
            className="mainpage-inline-header"
            variants={headerMotionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              className="mainpage-home-link-button"
              onClick={goToHome}
              whileTap={{ scale: 0.95 }}
            >
              ASTOCK 홈페이지로 가기? 
            </motion.button>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="splash-screen"
            variants={splashVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            ASTOCK
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pass assignSectionRef to each SectionWrapper */}
      <SectionWrapper sectionIndex={0} className="section1" onSectionRef={assignSectionRef}>
        {!showSplash && (
          <motion.div
            className="background-chart-image"
            variants={backgroundVariants}
            initial="hidden"
            animate="visible"
          />
        )}
        {showChartText && !showSplash && (
          <motion.div
            className="chart-recommend-text"
            variants={topRightTextVariants}
            initial="hidden"
            animate="visible"
          >
            <p>AI 주식 차트를 추천합니다 📈</p>
            <motion.span
              className="sub-text"
              initial={{opacity:0}}
              animate={{opacity:1, transition:{delay:1.2, duration:0.8}}}
            >
              데이터 기반의 스마트한 투자, ASTOCK과 함께 시작하세요.
            </motion.span>
          </motion.div>
        )}
        {!showSplash && (
          <motion.div
            className="scroll-prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.5, duration: 1 } }}
            onClick={() => scrollToSection(1)}
            whileHover={{scale: 1.1, color: '#64ffda'}}
          >
            Explore More 👇
          </motion.div>
        )}
      </SectionWrapper>

      <SectionWrapper sectionIndex={1} className="section2" onSectionRef={assignSectionRef}>
        <motion.div className="section-content" variants={staggerContainerVariants}>
          {!showSplash && (
            <motion.div
              className="background-chart2-image"
              variants={backgroundVariants}
              initial="hidden"
              animate="visible"
            />
          )}
          <motion.h2 variants={sectionTitleVariants}>
            <strong>3가지 AI 모델</strong>로<br />최적의 주식을 추천받으세요 📊
          </motion.h2>
          <motion.div className="ai-model-cards-grid">
            {[
              { icon: "🧠", title: "퀀텀 알파 AI", desc: "시장 미시 구조와 고빈도 데이터를 분석하여 단기적 변동성을 예측하고 최적의 매매 타이밍을 포착합니다.", color: "#4A90E2" },
              { icon: "💡", title: "밸류 베타 AI", desc: "기업 펀더멘탈, 재무제표, 산업 동향을 심층 분석하여 장기적으로 안정적인 성장이 기대되는 가치주를 발굴합니다.", color: "#50E3C2" },
              { icon: "📡", title: "센티멘트 감마 AI", desc: "실시간 뉴스, 소셜 미디어, 경제 지표 등 비정형 데이터를 분석하여 시장 심리와 트렌드를 파악, 모멘텀 투자를 지원합니다.", color: "#F5A623" },
            ].map((model, index) => (
              <motion.div
                key={index}
                className="ai-model-card"
                variants={{...itemVariants, ...cardHoverVariants}}
                whileHover="hover"
              >
                <AiIcon char={model.icon} color={model.color}/>
                <h3>{model.title}</h3>
                <p>{model.desc}</p>
                <motion.div className="card-decoration" variants={itemVariants}></motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper sectionIndex={2} className="section3" onSectionRef={assignSectionRef}>
        <motion.div className="section-content" variants={staggerContainerVariants}>
          <motion.h2 variants={sectionTitleVariants}>ASTOCK의 신뢰도 🎯</motion.h2>
          <div className="stats-flex-container">
            <motion.div className="stat-item-card" variants={itemVariants}>
              <h3>현재 총 이용자 수</h3>
              <p className="stat-number-large">
                <AnimatedNumber value="123,456" /> 명
              </p>
              <p className="stat-description">매일 성장하는 ASTOCK 커뮤니티</p>
            </motion.div>
            <motion.div className="stat-item-card" variants={itemVariants}>
              <h3>AI 예측 평균 정확도</h3>
              <p className="stat-number-large">
                <AnimatedNumber value="87.5" /> %
              </p>
              <AccuracyBarFill percentage={87.5} />
              <p className="stat-description">백테스팅 및 실전 데이터 기반</p>
            </motion.div>
          </div>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper sectionIndex={3} className="section4" onSectionRef={assignSectionRef}>
        <motion.div className="section-content" variants={staggerContainerVariants}>
          <motion.h2 variants={sectionTitleVariants}>
            ASTOCK AI가 만들어낸<br /><strong>놀라운 누적 수익률</strong> 💰
          </motion.h2>
          <motion.div className="profit-highlight-area" variants={itemVariants}>
            <p>최근 1년간 AI 추천 포트폴리오 평균</p>
            <motion.h3
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 150, damping: 15, delay: 0.3 } }}
            >
              + <AnimatedNumber value="237.8" /> %
            </motion.h3>
          </motion.div>
          <motion.button
            className="cta-button-primary"
            variants={{...itemVariants, ...buttonHoverVariants}}
            whileHover={{backgroundColor:"#C7A980"}}
            whileTap="tap"
            onClick={() => alert('프리미엄 서비스 체험 페이지로 이동합니다!')}
          >
            지금 바로 ASTOCK 시작하기 ✨
          </motion.button>
          <motion.p className="cta-subtext" variants={itemVariants} style={{marginTop: '15px', fontSize: '0.9em', opacity: 0.8}}>
            첫 달 무료 체험 혜택을 놓치지 마세요!
          </motion.p>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper sectionIndex={4} className="section5" onSectionRef={assignSectionRef}>
        <motion.div className="section-content feature-section-layout" variants={staggerContainerVariants}>
          <motion.div className="feature-text-content" variants={itemVariants}>
            <motion.h2 variants={sectionTitleVariants}>실시간 뉴스 분석 📰<br/>시장의 맥을 짚다</motion.h2>
            <p>수백만 건의 뉴스 기사, 경제 보고서, 소셜 미디어 언급을 AI가 실시간으로 분석하여 시장의 심리와 잠재적 이슈를 포착합니다. 정보의 홍수 속에서 핵심 인사이트를 찾아보세요.</p>
            <ul>
                <motion.li variants={itemVariants}>주요 키워드 및 감성 분석</motion.li>
                <motion.li variants={itemVariants}>이슈 발생 시 즉각 알림</motion.li>
                <motion.li variants={itemVariants}>관련 종목 영향도 예측</motion.li>
            </ul>
          </motion.div>
          <motion.div className="feature-visual-content news-visual" variants={itemVariants}>
            <motion.span className="icon-emphasis" whileHover={{scale:1.2, rotate:5}}>📊</motion.span>
            <motion.span className="icon-emphasis" style={{animationDelay: '0.2s'}} whileHover={{scale:1.2, rotate:-5}}>📈</motion.span>
            <motion.span className="icon-emphasis" style={{animationDelay: '0.4s'}} whileHover={{scale:1.2, rotate:5}}>🗞️</motion.span>
          </motion.div>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper sectionIndex={5} className="section6" onSectionRef={assignSectionRef}>
        <motion.div className="section-content feature-section-layout reverse-layout" variants={staggerContainerVariants}>
           <motion.div className="feature-visual-content alert-visual" variants={itemVariants}>
            <motion.span className="icon-emphasis large-icon" whileHover={{y: -10}}>🔔</motion.span>
            <motion.div className="mini-alerts">
                <motion.p variants={itemVariants}><span>AAPL</span> +2.5%</motion.p>
                <motion.p variants={itemVariants} style={{animationDelay: '0.1s'}}><span>TSLA</span> 목표가 도달</motion.p>
                <motion.p variants={itemVariants} style={{animationDelay: '0.2s'}}><span>MSFT</span> 실적 발표</motion.p>
            </motion.div>
          </motion.div>
          <motion.div className="feature-text-content" variants={itemVariants}>
            <motion.h2 variants={sectionTitleVariants}>놓치지 않는 투자 타이밍,<br/>실시간 알림 서비스 🔔</motion.h2>
            <p>관심 종목의 주가 급변동, 설정 목표가 도달, 주요 공시 및 뉴스 발생 시 즉각적인 알림을 제공합니다. 시장의 모든 순간을 ASTOCK과 함께 하세요.</p>
            <motion.button
                className="cta-button-secondary"
                variants={{...itemVariants, ...buttonHoverVariants}}
                whileHover="hover"
                whileTap="tap"
                onClick={() => alert('알림 설정 페이지로 이동합니다!')}
            >
                알림 설정 바로가기
            </motion.button>
          </motion.div>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper sectionIndex={6} className="section7" onSectionRef={assignSectionRef}>
        <motion.div className="section-content feature-section-layout" variants={staggerContainerVariants}>
          <motion.div className="feature-text-content" variants={itemVariants}>
            <motion.h2 variants={sectionTitleVariants}>나만을 위한 맞춤 포트폴리오 🎯<br/>AI 개인 비서</motion.h2>
            <p>투자 성향, 목표 수익률, 관심 산업군 등 당신의 프로필을 기반으로 AI가 최적화된 맞춤형 주식 포트폴리오를 구성하고 지속적으로 관리해 드립니다. 더 이상 혼자 고민하지 마세요.</p>
            <ol>
                <motion.li variants={itemVariants}>간단한 설문으로 투자 성향 분석</motion.li>
                <motion.li variants={itemVariants}>AI 기반 포트폴리오 자동 생성</motion.li>
                <motion.li variants={itemVariants}>정기적인 리밸런싱 제안</motion.li>
            </ol>
          </motion.div>
          <motion.div className="feature-visual-content personalized-visual" variants={itemVariants}>
            <motion.span className="icon-emphasis large-icon" whileHover={{filter: 'brightness(1.2)'}}>👤</motion.span>
            <motion.span className="icon-emphasis" style={{fontSize: '2em', animationDelay: '0.2s'}} whileHover={{scale:1.2}} >🔗</motion.span>
            <motion.span className="icon-emphasis large-icon" style={{fontSize: '4em', animationDelay: '0.4s'}} whileHover={{color: '#64ffda'}}>📈</motion.span>
          </motion.div>
        </motion.div>
      </SectionWrapper>

      <motion.footer
        className="mainpage-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: {delay:0.5, duration: 1}}}
      >
        <p>&copy; {new Date().getFullYear()} ASTOCK. All Rights Reserved.</p>
        <p>본 서비스에서 제공되는 정보는 투자 참고 자료이며, 최종 투자 결정은 투자자 본인의 판단과 책임하에 이루어져야 합니다.</p>
        <div className="footer-links">
            <a href="#terms">이용약관</a>
            <a href="#privacy">개인정보처리방침</a>
        </div>
      </motion.footer>
    </div>
  );
}