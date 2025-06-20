package com.smhrd.stock.dto;

import java.util.List;
import java.util.ArrayList; // ArrayList를 초기화하기 위해 import

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자는 필요할 수 있습니다.
public class KeywordDTO {
    private String keyword_Name;
    private Long total_count;
    private Long numArticlesMentionedIn;
    private List<RelatedNewsDto> relatedNews; // 이 필드는 서비스에서 채워질 것입니다.


    // 이 생성자가 SQL 쿼리의 SELECT 절 순서 및 타입 (String, Long, Long)과 정확히 일치해야 합니다.
    public KeywordDTO(String keyword_Name, Long total_count, Long numArticlesMentionedIn) {
        this.keyword_Name = keyword_Name;
        this.total_count = total_count;
        this.numArticlesMentionedIn = numArticlesMentionedIn;
        this.relatedNews = new ArrayList<>(); // 또는 null; 필요에 따라 선택. null보다는 빈 리스트가 안전합니다.
    }


}