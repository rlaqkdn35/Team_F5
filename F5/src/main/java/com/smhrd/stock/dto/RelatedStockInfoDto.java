package com.smhrd.stock.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RelatedStockInfoDto {
	private String stockCode;
    private String stockName; // stock_name
    private String companyInfo; // company_info
    private List<StockPriceDto> stockPrices; // 7일치 주가 데이터 리스트
	
}
