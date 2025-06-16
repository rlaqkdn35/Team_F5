package com.smhrd.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDataForFrontendDto {
    private String stockCode;
    private String stockName;
    private String stockCategory; 
    private BigDecimal closePrice; // 종가
    private BigDecimal openPrice;  // 시가
    private BigDecimal highPrice;  // 고가
    private BigDecimal lowPrice;   // 저가
    private BigDecimal stockVolume; // 거래량
    private BigDecimal stockFluctuation; // 등락폭 (전일 대비 차이 값)
    private Timestamp priceDate;   // 데이터 날짜
}