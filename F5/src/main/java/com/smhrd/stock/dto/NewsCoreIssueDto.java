package com.smhrd.stock.dto;

import java.sql.Timestamp;
import java.util.List;

import com.smhrd.stock.entity.News;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NewsCoreIssueDto {
	private Long newsIdx;
    private String newsTitle;
    private String pressName; // press_name
    private Timestamp newsDt;
    private String newsSummary; // news_summary
    private String newsUrl;
    private List<RelatedStockInfoDto> relatedStocks; // 연관된 종목 정보를 리스트로 가집니다.

    public static NewsCoreIssueDto fromEntity(News news, List<RelatedStockInfoDto> relatedStocks) {
        return NewsCoreIssueDto.builder()
                .newsIdx(news.getNewsIdx())
                .newsTitle(news.getNewsTitle())
                .pressName(news.getPressName())
                .newsDt(news.getNewsDt())
                .newsSummary(news.getNewsSummary())
                .newsUrl(news.getNewsUrl())
                .relatedStocks(relatedStocks)
                .build();
    }
}
