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
	@Column(name="related_idx") 
	private int relatedIdx;

	@Column(name="stock_code") 
	private String stockCode;

	@Column(name="news_idx") 
	private Long newsIdx;
	
	@Column(name="relevance_score", precision = 5, scale = 2)
	private BigDecimal relevanceScore;

	@Column(name="created_at") 
	private Timestamp createdAt;
}
