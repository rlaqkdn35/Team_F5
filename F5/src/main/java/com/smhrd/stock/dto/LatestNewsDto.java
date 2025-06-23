// LatestNewsDto.java

package com.smhrd.stock.dto;

import java.sql.Timestamp;

import com.smhrd.stock.entity.News;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LatestNewsDto {
    private Long newsIdx;
    private String newsTitle;
    private String pressName;
    private Timestamp newsDt;
    private String newsSummary;
    private String stockCode; 
    private String stockName;
    private String newsAnalysis;
    private Double newsAnalysisScore;

    // News 엔티티를 LatestNewsDto로 변환하는 정적 팩토리 메소드
    // 여기서는 stockCodes 문자열 전체 대신, 특정 개별 stockCode를 받도록 변경합니다.
    public static LatestNewsDto fromEntity(News news, String individualStockCode, String stockName) {
        return LatestNewsDto.builder()
                .newsIdx(news.getNewsIdx())
                .newsTitle(news.getNewsTitle())
                .pressName(news.getPressName())
                .newsDt(news.getNewsDt())
                .newsSummary(news.getNewsSummary())
                .stockCode(individualStockCode)
                .stockName(stockName)
                .newsAnalysis(news.getNewsAnalysis())
                .newsAnalysisScore(news.getNewsAnalysisScore())
                .build();
    }
}