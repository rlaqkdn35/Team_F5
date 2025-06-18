package com.smhrd.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketThemeStockDto {
    private String priceDate;      
    private String stockName;      
    private String stockCode;      
    private String closePrice;     
    private String stockFluctuation; 
}