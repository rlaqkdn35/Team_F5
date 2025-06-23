package com.smhrd.stock.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CombinedStockDetailDto {
    private String stockCode; // 특정 종목을 식별하는 코드
    private String stockName;
    private BigDecimal stockFluctuation; // 등락률
    private BigDecimal closePrice;       // 종가 (news_dt와 같은 날짜의 최신 값)
    private Timestamp priceDate;     // 등락률/종가가 조회된 날짜 (news_dt와 같은 날짜)
}