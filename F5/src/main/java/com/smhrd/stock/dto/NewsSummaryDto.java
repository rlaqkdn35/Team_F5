package com.smhrd.stock.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor 
@AllArgsConstructor 
public class NewsSummaryDto {
    private Long newsIdx;
    private String newsTitle;
    private String newsContent;
    private Timestamp newsDt; // 뉴스 발행 일시 (Timestamp 그대로 전달)
     private String pressName;
}