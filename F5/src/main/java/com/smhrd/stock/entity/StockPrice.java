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
@Table(name="t_stockprice")
public class StockPrice {

	@Id
	private Long price_id;
	private String stock_code;
	private Timestamp price_date;
	
	@Column(precision = 12, scale = 1) 
	private BigDecimal open_price;
	
	@Column(precision = 12, scale = 1) 
	private BigDecimal high_price;
	
	@Column(precision = 12, scale = 1)
	private BigDecimal low_price;
	
	@Column(precision = 12, scale = 1) 
	private BigDecimal close_price;
	
	@Column(precision = 12, scale = 1)
	private BigDecimal stock_volume;
}
