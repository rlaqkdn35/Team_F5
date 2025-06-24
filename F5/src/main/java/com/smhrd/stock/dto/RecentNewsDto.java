package com.smhrd.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentNewsDto {
    private Timestamp newsTime; // 뉴스의 시간 (newsDt)
    private String newsTitle;   // 뉴스의 제목 (newsTitle)
    private String stockCodes; // 연관 종목 (stockCode 리스트)
    private String newsSummary; // 이슈 내용 (newsSummary)
    private String newsUrl;
}