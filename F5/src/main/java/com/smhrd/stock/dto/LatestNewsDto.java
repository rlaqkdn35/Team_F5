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
    // private String stockCodes; // 기존의 여러 종목 코드를 담는 필드는 유지하거나 삭제 가능
    private String stockCode; // <<<--- 이 필드를 추가합니다. 이 DTO가 어떤 '단일' 종목에 대한 뉴스인지 명시합니다.
    private String newsAnalysis;
    private Double newsAnalysisScore;

    // News 엔티티를 LatestNewsDto로 변환하는 정적 팩토리 메소드
    // 여기서는 stockCodes 문자열 전체 대신, 특정 개별 stockCode를 받도록 변경합니다.
    public static LatestNewsDto fromEntity(News news, String individualStockCode) {
        return LatestNewsDto.builder()
                .newsIdx(news.getNewsIdx())
                .newsTitle(news.getNewsTitle())
                .pressName(news.getPressName())
                .newsDt(news.getNewsDt())
                .newsSummary(news.getNewsSummary())
                // .stockCodes(news.getStockCodes()) // 필요에 따라 원본 stockCodes도 포함 가능
                .stockCode(individualStockCode) // <<<--- 개별 종목 코드 설정
                .newsAnalysis(news.getNewsAnalysis())
                .newsAnalysisScore(news.getNewsAnalysisScore())
                .build();
    }
}