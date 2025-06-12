package com.smhrd.stock.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import lombok.Data;

@Data
public class StockPriceWithNameDto {

	private Integer rank; // 순위 (프론트에서 세팅)
	private Long priceId;
	private String stockCode;
	private String stockName;
	private Timestamp priceDate;
	private BigDecimal openPrice;
	private BigDecimal highPrice;
	private BigDecimal lowPrice;
	private BigDecimal closePrice;
	private BigDecimal stockFluctuation;

	public StockPriceWithNameDto(Long priceId, String stockCode, String stockName, Timestamp priceDate,
			BigDecimal openPrice, BigDecimal highPrice, BigDecimal lowPrice, BigDecimal closePrice,
			BigDecimal stockFluctuation) {
		this.priceId = priceId;
		this.stockCode = stockCode;
		this.stockName = stockName;
		this.priceDate = priceDate;
		this.openPrice = openPrice;
		this.highPrice = highPrice;
		this.lowPrice = lowPrice;
		this.closePrice = closePrice;
		this.stockFluctuation = stockFluctuation;
	}
}
