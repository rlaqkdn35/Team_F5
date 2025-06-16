package com.smhrd.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsDetailDto {
    private Long newsIdx;
    private String newsTitle;
    private String newsContent; // 상세 페이지에서는 전체 내용을 보여줄 것
    private String newsUrl;     // 원본 뉴스 URL (선택 사항, 없다면 null)
    private String pressName;
    private Timestamp newsDt;
}