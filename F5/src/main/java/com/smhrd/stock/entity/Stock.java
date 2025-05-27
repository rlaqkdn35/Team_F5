package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_stock")
public class Stock {

	@Id
	private String stock_code;
	private String stock_name;
	private String market_type;
	@Lob
	private String company_info;
	private Timestamp listing_date;
}
