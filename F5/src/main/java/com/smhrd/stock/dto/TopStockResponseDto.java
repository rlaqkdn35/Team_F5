package com.smhrd.stock.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor; // 필드가 변경되었으므로 @AllArgsConstructor는 다시 확인/생성자 수동 생성 필요
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
// @AllArgsConstructor // 필드가 변경되었으므로, @AllArgsConstructor는 다시 확인하거나 이 생성자를 사용하세요.
public class TopStockResponseDto {
    private Integer rank; // 순위 (쿼리에서 NULL, 서비스에서 채울 수 있음)
    private String stock_code;
    private String stock_name;
    private BigDecimal close_price;
    private BigDecimal stock_fluctuation; // <-- 등락률 필드 추가
    private BigDecimal stock_volume;

    public TopStockResponseDto(
        Integer rank,
        String stock_code,
        String stock_name,
        BigDecimal close_price,
        BigDecimal stock_fluctuation, // <-- 추가
        BigDecimal stock_volume
    ) {
        this.rank = rank;
        this.stock_code = stock_code;
        this.stock_name = stock_name;
        this.close_price = close_price;
        this.stock_fluctuation = stock_fluctuation; // <-- 추가
        this.stock_volume = stock_volume;
    }
}