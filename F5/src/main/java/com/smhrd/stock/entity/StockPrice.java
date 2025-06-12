package com.smhrd.stock.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "t_stockprice")
public class StockPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private Long priceId;

    @ManyToOne
    @JoinColumn(name = "stock_code")
    private Stock stock;

    // stockCode를 직접 사용하는 대신, stock 객체를 통해 접근
    public String getStockCode() {
        return stock != null ? stock.getStockCode() : null;
    }

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
