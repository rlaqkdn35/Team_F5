package com.smhrd.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyTopStock {
    private int rank;
    private String stockCode;
    private String stockName;
    private double openPrice;
    private double changePercent;
    private double priceChange;
    private long volume;  // DB에서 숫자 그대로 받음, 프론트에서 포맷팅
}
