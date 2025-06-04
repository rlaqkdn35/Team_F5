import React, { useState, useEffect } from 'react';
import './RecommendationsPage.css'; // CSS 파일을 위한 임포트

// Chart.js 관련 임포트 및 모듈 등록이 제거되었습니다.

const RecommendationsPage = () => {
    const [aiModels, setAiModels] = useState([]);
    const [recommendedStocks, setRecommendedStocks] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState(null);
    useEffect(() => {
        // 섹션 1 더미 데이터: AI 모델 점수 및 추천 정보
        const dummyAiModels = [
            { id: 'modelA', name: 'AI 모델 A', score: 92, summary: '시장 데이터를 기반으로 단기 급등 종목을 예측합니다.', recommendedStock: { code: '452101', name: 'NVIDIA Corp.', reason: '최근 기술 혁신 발표와 시장 수요 증가로 긍정적 모멘텀이 예상됩니다.' } },
            { id: 'modelB', name: 'AI 모델 B', score: 88, summary: '거시 경제 지표와 기업 펀더멘털을 분석하여 장기 투자를 제안합니다.', recommendedStock: { code: '542101', name: 'Microsoft Corp.', reason: '클라우드 컴퓨팅 부문의 꾸준한 성장과 안정적인 수익 구조를 갖추고 있습니다.' } },
            { id: 'modelC', name: 'AI 모델 C', score: 95, summary: '소셜 미디어 트렌드와 뉴스 심리를 반영하여 시장 변동성을 포착합니다.', recommendedStock: { code: '000100', name: 'Tesla Inc.', reason: '일론 머스크의 최신 트윗과 전기차 시장의 회복 기대감이 반영되었습니다.' } },
        ];

        setAiModels(dummyAiModels);
        if (dummyAiModels.length > 0) {
            const initialTopAi = dummyAiModels.reduce((prev, current) => (prev.score > current.score) ? prev : current);
            setSelectedModelId(initialTopAi.id);
        }
        // 섹션 2 더미 데이터: 각 모델의 예측 그래프 및 수익률 (약 20개)
        const dummyRecommendedStocks = [
            {
                code: 'AAPL', name: 'Apple Inc.',
                modelAPrediction: [170, 172, 175, 173, 176, 178, 180],
                modelBPrediction: [170, 169, 171, 170, 172, 171, 173],
                modelCPrediction: [170, 171, 170, 172, 174, 173, 175],
                returns: { day: 0.5, week: 1.2, month: 3.5, year: 25.0 }
            },
            {
                code: 'MSFT', name: 'Microsoft Corp.',
                modelAPrediction: [420, 418, 422, 425, 423, 427, 430],
                modelBPrediction: [420, 421, 420, 423, 425, 424, 426],
                modelCPrediction: [420, 419, 421, 420, 422, 421, 423],
                returns: { day: -0.2, week: 0.8, month: 2.1, year: 30.0 }
            },
            {
                code: 'NVDA', name: 'NVIDIA Corp.',
                modelAPrediction: [950, 960, 975, 980, 990, 1000, 1010],
                modelBPrediction: [950, 945, 955, 960, 958, 965, 970],
                modelCPrediction: [950, 970, 980, 995, 1005, 1015, 1025],
                returns: { day: 1.5, week: 5.0, month: 10.0, year: 80.0 }
            },
            {
                code: 'GOOGL', name: 'Alphabet Inc.',
                modelAPrediction: [170, 171, 172, 173, 174, 175, 176],
                modelBPrediction: [170, 169, 170, 171, 170, 172, 171],
                modelCPrediction: [170, 172, 171, 173, 175, 174, 176],
                returns: { day: 0.3, week: 0.9, month: 2.8, year: 28.0 }
            },
            {
                code: 'AMZN', name: 'Amazon.com Inc.',
                modelAPrediction: [185, 184, 186, 185, 187, 186, 188],
                modelBPrediction: [185, 186, 185, 187, 188, 187, 189],
                modelCPrediction: [185, 183, 184, 182, 185, 184, 186],
                returns: { day: -0.8, week: -1.5, month: 0.5, year: 20.0 }
            },
            {
                code: 'TSLA', name: 'Tesla Inc.',
                modelAPrediction: [178, 176, 175, 173, 172, 170, 168],
                modelBPrediction: [178, 179, 177, 178, 180, 179, 181],
                modelCPrediction: [178, 180, 182, 185, 188, 190, 192],
                returns: { day: 2.1, week: 4.5, month: 8.0, year: -10.0 }
            },
            {
                code: 'META', name: 'Meta Platforms Inc.',
                modelAPrediction: [490, 492, 495, 498, 500, 502, 505],
                modelBPrediction: [490, 488, 490, 489, 491, 490, 492],
                modelCPrediction: [490, 493, 496, 499, 502, 505, 508],
                returns: { day: 0.7, week: 2.0, month: 5.0, year: 35.0 }
            },
            {
                code: 'NFLX', name: 'Netflix Inc.',
                modelAPrediction: [620, 618, 622, 620, 625, 623, 627],
                modelBPrediction: [620, 621, 620, 623, 625, 624, 626],
                modelCPrediction: [620, 619, 621, 620, 622, 621, 623],
                returns: { day: -0.1, week: 0.5, month: 1.5, year: 18.0 }
            },
            {
                code: 'AMD', name: 'Advanced Micro Devices',
                modelAPrediction: [160, 162, 165, 168, 170, 172, 175],
                modelBPrediction: [160, 159, 161, 160, 162, 161, 163],
                modelCPrediction: [160, 163, 166, 169, 172, 175, 178],
                returns: { day: 1.0, week: 3.0, month: 7.0, year: 50.0 }
            },
            {
                code: 'INTC', name: 'Intel Corp.',
                modelAPrediction: [30, 29, 28, 27, 26, 25, 24],
                modelBPrediction: [30, 31, 30, 32, 31, 33, 32],
                modelCPrediction: [30, 28, 27, 26, 25, 24, 23],
                returns: { day: -1.0, week: -2.5, month: -5.0, year: -15.0 }
            },
            {
                code: 'SBUX', name: 'Starbucks Corp.',
                modelAPrediction: [90, 91, 92, 93, 94, 95, 96],
                modelBPrediction: [90, 89, 90, 89, 90, 89, 90],
                modelCPrediction: [90, 92, 91, 93, 94, 95, 96],
                returns: { day: 0.4, week: 1.0, month: 2.0, year: 10.0 }
            },
            {
                code: 'COST', name: 'Costco Wholesale Corp.',
                modelAPrediction: [700, 705, 710, 715, 720, 725, 730],
                modelBPrediction: [700, 698, 702, 700, 705, 703, 708],
                modelCPrediction: [700, 703, 706, 709, 712, 715, 718],
                returns: { day: 0.6, week: 1.8, month: 4.0, year: 22.0 }
            },
            {
                code: 'ADBE', name: 'Adobe Inc.',
                modelAPrediction: [500, 505, 510, 515, 520, 525, 530],
                modelBPrediction: [500, 498, 502, 500, 505, 503, 508],
                modelCPrediction: [500, 503, 506, 509, 512, 515, 518],
                returns: { day: 0.9, week: 2.5, month: 6.0, year: 40.0 }
            },
            {
                code: 'CRM', name: 'Salesforce Inc.',
                modelAPrediction: [270, 272, 275, 278, 280, 282, 285],
                modelBPrediction: [270, 269, 271, 270, 272, 271, 273],
                modelCPrediction: [270, 273, 276, 279, 282, 285, 288],
                returns: { day: 0.2, week: 1.1, month: 3.0, year: 27.0 }
            },
            {
                code: 'PYPL', name: 'PayPal Holdings Inc.',
                modelAPrediction: [60, 59, 58, 57, 56, 55, 54],
                modelBPrediction: [60, 61, 60, 62, 61, 63, 62],
                modelCPrediction: [60, 58, 57, 56, 55, 54, 53],
                returns: { day: -0.5, week: -1.0, month: -2.0, year: -8.0 }
            },
            {
                code: 'CMCSA', name: 'Comcast Corp.',
                modelAPrediction: [45, 46, 47, 48, 49, 50, 51],
                modelBPrediction: [45, 44, 45, 44, 45, 44, 45],
                modelCPrediction: [45, 46, 47, 48, 49, 50, 51],
                returns: { day: 0.3, week: 0.8, month: 1.5, year: 7.0 }
            },
            {
                code: 'TMUS', name: 'T-Mobile US Inc.',
                modelAPrediction: [150, 152, 154, 156, 158, 160, 162],
                modelBPrediction: [150, 149, 151, 150, 152, 151, 153],
                modelCPrediction: [150, 153, 156, 159, 162, 165, 168],
                returns: { day: 0.7, week: 2.2, month: 4.5, year: 32.0 }
            },
            {
                code: 'QCOM', name: 'QUALCOMM Inc.',
                modelAPrediction: [180, 182, 185, 188, 190, 192, 195],
                modelBPrediction: [180, 179, 181, 180, 182, 181, 183],
                modelCPrediction: [180, 183, 186, 189, 192, 195, 198],
                returns: { day: 0.8, week: 2.4, month: 5.5, year: 38.0 }
            },
            {
                code: 'INTU', name: 'Intuit Inc.',
                modelAPrediction: [650, 655, 660, 665, 670, 675, 680],
                modelBPrediction: [650, 648, 652, 650, 655, 653, 658],
                modelCPrediction: [650, 653, 656, 659, 662, 665, 668],
                returns: { day: 0.5, week: 1.6, month: 3.2, year: 26.0 }
            },
            {
                code: 'CSCO', name: 'Cisco Systems Inc.',
                modelAPrediction: [50, 49, 48, 47, 46, 45, 44],
                modelBPrediction: [50, 51, 50, 52, 51, 53, 52],
                modelCPrediction: [50, 48, 47, 46, 45, 44, 43],
                returns: { day: -0.2, week: -0.8, month: -1.5, year: -5.0 }
            },
        ];

        setRecommendedStocks(dummyRecommendedStocks);
    }, []);

    const getPredictionStatus = (predictionValue) => {
        // 예측 값의 마지막 요소를 기준으로 판단
        const lastValue = predictionValue[predictionValue.length - 1];
        const firstValue = predictionValue[0];

        if (lastValue > firstValue * 1.02) { // 2% 이상 상승 시
            return { score: lastValue, state: '강한 상승', class: 'positive' };
        } else if (lastValue > firstValue * 1.005) { // 0.5% ~ 2% 상승 시
            return { score: lastValue, state: '상승', class: 'positive' };
        } else if (lastValue < firstValue * 0.98) { // 2% 이상 하락 시
            return { score: lastValue, state: '강한 하락', class: 'negative' };
        } else if (lastValue < firstValue * 0.995) { // 0.5% ~ 2% 하락 시
            return { score: lastValue, state: '하락', class: 'negative' };
        } else { // 그 외 (횡보)
            return { score: lastValue, state: '횡보', class: 'neutral' };
        }
    };

    const selectedAiModel = aiModels.find(model => model.id === selectedModelId);

    // 종합 AI 추천 종목 (항상 동일하게 표시됩니다)
    const combinedRecommendation = {
        stock: { code: 'SPY', name: 'S&P 500 ETF', reason: '세 모델의 종합적인 분석 결과, 시장 전반의 안정적인 상승이 예상됩니다.' },
        summary: '다양한 AI 모델의 시그널을 통합 분석하여 현재 시장에서 가장 균형 잡힌 투자 기회를 제공합니다.'
    };

    return (
        <div className="recommendations-page">
            {/* --- 섹션 1: AI 모델 요약 및 추천 --- */}
            <div className="ai-summary-section">
                {/* AI 모델 점수 요약 바 */}
                <div className="today-recommendations-grid">
                    {combinedRecommendation && (
                        <div className="recommendation-box combined-recommendation">
                            <h3>종합 AI 추천 종목</h3>
                            <p className="recommended-stock-name">
                                <span className="stock-code-tag">{combinedRecommendation.stock.code}</span> {combinedRecommendation.stock.name}
                            </p>
                            <p className="recommendation-reason">{combinedRecommendation.stock.reason}</p>
                            <p className="ai-comment">AI 요약: {combinedRecommendation.summary}</p>
                        </div>
                    )}
                    
                </div>
                <div className="ai-score-summary-bar">
                    <h3>모델별 AI 추천 종목</h3>
                {aiModels.map(model => (
                    <div
                        key={model.id}
                        className={`model-score-item ${selectedModelId === model.id ? 'selected-model' : ''}`} // className 변경
                        onClick={() => setSelectedModelId(model.id)} // onClick 이벤트 핸들러 추가
                    >
                    <p>이미지 공간</p>
                    <span className="model-name">{model.name}</span>
                    <span className="model-score">{model.score}점</span>
                    </div>
                ))}
    
                {selectedAiModel && ( // 이 조건문이 topAi에서 selectedAiModel로 변경
                    // <Link to>
                    <div className="recommendation-box top-ai-recommendation">
                    <h3><span className="top-ai-indicator">🌟</span> 선택된 AI 추천 종목 ({selectedAiModel.name})</h3> {/* 텍스트 및 변수 변경 */}
                    <p className="recommended-stock-name">
                        <span className="stock-code-tag">{selectedAiModel.recommendedStock.code}</span> {selectedAiModel.recommendedStock.name}
                    </p>
                    <p className="recommendation-reason">{selectedAiModel.recommendedStock.reason}</p>
                    <p className="ai-comment">AI 요약: {selectedAiModel.summary}</p>
                    </div>
                    // </Link>
                )}
                </div>
            </div>


            {/* --- 섹션 2: 각 모델의 주식 예측 및 수익률 (표 형식) --- */}
            <div className="stock-prediction-section">
                <h2>AI별 종목 예측 및 수익률</h2>
                <div className="stock-table-container">
                    <table className="stock-prediction-table">
                        <thead>
                        <tr>
                            <th className="th-name-code">종목명 (코드)</th>
                                <th className="th-prediction">모델 A 예측</th> {/* 변경: th-chart -> th-prediction */}
                                <th className="th-prediction">모델 B 예측</th> {/* 변경: th-chart -> th-prediction */}
                                <th className="th-prediction">모델 C 예측</th> {/* 변경: th-chart -> th-prediction */}
                                <th className="th-returns">수익률 (일)</th> {/* 변경: th-returns를 일/주/월/년으로 분리 */}
                                <th className="th-returns">수익률 (주)</th>
                                <th className="th-returns">수익률 (월)</th>
                                <th className="th-returns">수익률 (년)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recommendedStocks.map(stock => (
                                <tr key={stock.code}>
                                <td className="td-name-code">
                                    <span className="stock-name">{stock.name}</span>
                                    <span className="stock-code-small">({stock.code})</span>
                                </td>
                                {/* 모델 A 예측 스코어 및 상태 */}
                                <td className="td-prediction">
                                    {(() => { // 즉시 실행 함수로 여러 요소 렌더링
                                        const predictionA = getPredictionStatus(stock.modelAPrediction);
                                        return (
                                            <>
                                                <div className="prediction-score">{predictionA.score.toFixed(2)}</div>
                                                <div className={`prediction-state ${predictionA.class}`}>
                                                    {predictionA.state}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </td>
                                {/* 모델 B 예측 스코어 및 상태 */}
                                <td className="td-prediction">
                                    {(() => {
                                        const predictionB = getPredictionStatus(stock.modelBPrediction);
                                        return (
                                            <>
                                                <div className="prediction-score">{predictionB.score.toFixed(2)}</div>
                                                <div className={`prediction-state ${predictionB.class}`}>
                                                    {predictionB.state}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </td>
                                {/* 모델 C 예측 스코어 및 상태 */}
                                <td className="td-prediction">
                                    {(() => {
                                        const predictionC = getPredictionStatus(stock.modelCPrediction);
                                        return (
                                            <>
                                                <div className="prediction-score">{predictionC.score.toFixed(2)}</div>
                                                <div className={`prediction-state ${predictionC.class}`}>
                                                    {predictionC.state}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </td>
                                {/* 수익률 (일) */}
                                <td className="td-returns">
                                    <span className={stock.returns.day >= 0 ? 'positive' : 'negative'}>{stock.returns.day.toFixed(2)}%</span>
                                </td>
                                {/* 수익률 (주) */}
                                <td className="td-returns">
                                    <span className={stock.returns.week >= 0 ? 'positive' : 'negative'}>{stock.returns.week.toFixed(2)}%</span>
                                </td>
                                {/* 수익률 (월) */}
                                <td className="td-returns">
                                    <span className={stock.returns.month >= 0 ? 'positive' : 'negative'}>{stock.returns.month.toFixed(2)}%</span>
                                </td>
                                {/* 수익률 (년) */}
                                <td className="td-returns">
                                    <span className={stock.returns.year >= 0 ? 'positive' : 'negative'}>{stock.returns.year.toFixed(2)}%</span>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecommendationsPage;