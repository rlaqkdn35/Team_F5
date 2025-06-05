package com.smhrd.stock.dto;

import lombok.Getter;

@Getter
public class KeywordDTO {
	private String keyword_Name;
    private long total_count; // SUM(mentioned_cnt) 이므로 Long 타입
    private long numArticlesMentionedIn; // COUNT(DISTINCT news_idx) 이므로 Long 타입

    public KeywordDTO(String keyword_Name, Long total_count, Long numArticlesMentionedIn) {
        this.keyword_Name = keyword_Name;
        this.total_count = total_count;
        this.numArticlesMentionedIn = numArticlesMentionedIn;
    }

}