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
@Table(name="t_news_for_company")
public class NewsForCompany {

	@Id
	private int related_idx;
	private String stock_code;
	private int news_idx;
	
	@Column(precision = 5, scale = 2) 
	private BigDecimal relevance_score;
	private Timestamp created_at;
}
