package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
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

    @Lob
    @Column(name = "company_info")
    private String companyInfo;

    @Column(name = "listing_date")
    private Timestamp listingDate;
}
