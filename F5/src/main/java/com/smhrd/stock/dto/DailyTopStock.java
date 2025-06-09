package com.smhrd.stock.dto;

import java.time.LocalDate;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyTopStock {
	private Integer rank; // 계산된 값 (DB 컬럼 아님)

    @Column(name = "stock_code")
    private String stockCode;

    // stock_name은 보통 t_stock 테이블에서 조인해서 가져오는 값
    private String stockName;

    @Column(name = "close_price")
    private int closePrice;

    @Column(name = "stock_fluctuation")
    private double stockFluctuation;

    // 계산 필드: 오늘 close_price - 어제 close_price
    private int priceChange;

    @Column(name = "stock_volume")
    private long stockVolume;

    // 상세 정보
    @Column(name = "open_price")
    private int openPrice;

    @Column(name = "high_price")
    private int highPrice;

    @Column(name = "low_price")
    private int lowPrice;

    @Column(name = "price_date")
    private LocalDate priceDate;

}
