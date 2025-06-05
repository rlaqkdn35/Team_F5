package com.smhrd.stock.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "t_stockprice")
public class StockPrice {

    @Id
    @Column(name = "price_id")
    private Long priceId;

    @Column(name = "stock_code")
    private String stockCode;

    @Column(name = "price_date")
    private Timestamp priceDate;

    @Column(name = "open_price", precision = 12, scale = 1)
    private BigDecimal openPrice;

    @Column(name = "high_price", precision = 12, scale = 1)
    private BigDecimal highPrice;

    @Column(name = "low_price", precision = 12, scale = 1)
    private BigDecimal lowPrice;

    @Column(name = "close_price", precision = 12, scale = 1)
    private BigDecimal closePrice;

    @Column(name = "stock_volume", precision = 12, scale = 1)
    private BigDecimal stockVolume;

    @Column(name = "stock_fluctuation", precision = 12, scale = 1)
    private BigDecimal stockFluctuation;
}
