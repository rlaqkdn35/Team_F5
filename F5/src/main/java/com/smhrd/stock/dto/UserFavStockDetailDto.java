package com.smhrd.stock.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFavStockDetailDto {
    private String stockCode;
    private String stockName;
    private BigDecimal closePrice;
    private BigDecimal stockFluctuation;
    private BigDecimal stockVolume;
}