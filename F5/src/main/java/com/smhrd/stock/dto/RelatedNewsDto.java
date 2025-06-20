package com.smhrd.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data; // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor 포함
import lombok.NoArgsConstructor;

@Data // @Getter, @Setter 등을 포함
@NoArgsConstructor
@AllArgsConstructor
public class RelatedNewsDto {
    private Long newsIdx; // news_idx (DB의 컬럼명과 일치)
    private String newsTitle; // news_title
    private String newsUrl;   // news_url
    private String pressName; // press_name
    // 필요한 경우 뉴스 내용이나 요약도 추가할 수 있습니다.
    // private String newsContent;
    // private String newsSummary;
}