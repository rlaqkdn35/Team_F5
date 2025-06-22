package com.smhrd.stock.dto;

import java.sql.Timestamp; // Timestamp 타입 임포트

import com.smhrd.stock.entity.News; // News 엔티티 임포트

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LatestNewsDto {
    private Long newsIdx;
    private String newsTitle;
    private String pressName;
    private Timestamp newsDt; // 뉴스 발행 일시
    private String newsSummary;
    private String stockCodes; // DTO 필드명도 stock_codes로 변경 (컬럼명과 일치)
    private String newsAnalysis;
    private Double newsAnalysisScore; // decimal(12,5) -> Double

    // stockName 필드 제거 (요청에 없음)

    @Builder
    public LatestNewsDto(Long newsIdx, String newsTitle, String pressName, Timestamp newsDt,
                         String newsSummary, String stockCodes, String newsAnalysis,
                         Double newsAnalysisScore) { // 생성자 파라미터에서 stockName 제거
        this.newsIdx = newsIdx;
        this.newsTitle = newsTitle;
        this.pressName = pressName;
        this.newsDt = newsDt;
        this.newsSummary = newsSummary;
        this.stockCodes = stockCodes;
        this.newsAnalysis = newsAnalysis;
        this.newsAnalysisScore = newsAnalysisScore;
    }

    /**
     * News 엔티티를 LatestNewsDto로 변환하는 정적 팩토리 메소드.
     * stockName 관련 로직을 제거합니다.
     */
    public static LatestNewsDto fromEntity(News news) {
        return LatestNewsDto.builder()
                .newsIdx(news.getNewsIdx())
                .newsTitle(news.getNewsTitle())
                .pressName(news.getPressName())
                .newsDt(news.getNewsDt())
                .newsSummary(news.getNewsSummary())
                .stockCodes(news.getStockCodes()) // News 엔티티의 stockCodes 필드 사용
                .newsAnalysis(news.getNewsAnalysis())
                .newsAnalysisScore(news.getNewsAnalysisScore())
                .build();
    }
}