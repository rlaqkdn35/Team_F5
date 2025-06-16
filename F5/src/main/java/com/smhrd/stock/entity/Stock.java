package com.smhrd.stock.entity;

import java.sql.Timestamp;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "t_stock")
public class Stock {

    @Id
    @Column(name = "stock_code")
    private String stockCode;

    @Column(name = "stock_name")
    private String stockName;

    @Column(name = "market_type")
    private String marketType;
    
    @Column(name = "stock_category")
    private String stockCategory;

    @Lob
    @Column(name = "company_info")
    private String companyInfo;

    @Column(name = "listing_date")
    private Timestamp listingDate;
    
    @OneToMany(mappedBy = "stock")  // StockPrice에서 stock 필드로 매핑됨
    @JsonIgnore
    private List<StockPrice> stockPrices; // StockPrice와의 관계
}
