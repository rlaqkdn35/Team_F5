package com.smhrd.stock.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import com.smhrd.stock.entity.StockPrice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPriceDto {
    private Timestamp priceDate;
    private BigDecimal closePrice; 
    private BigDecimal stockFluctuation; 

    public static StockPriceDto fromEntity(StockPrice stockPrice) {
        return StockPriceDto.builder()
                .priceDate(stockPrice.getPriceDate()) 
                .closePrice(stockPrice.getClosePrice())
                .stockFluctuation(stockPrice.getStockFluctuation())
                .build();
    }
}