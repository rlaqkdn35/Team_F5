package com.smhrd.stock.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_ai_prediction")
public class AiPrediction {

	@Id
	private int pred_inx;
	private String stock_code;
	private String ad_model_name;
	private Timestamp pred_dt;
	
	@Column(precision = 12, scale = 1)
	private BigDecimal target_price;
	
	@Column(precision = 12, scale = 1)
	private BigDecimal fluctuation_rate;
	
	@Lob
	private String pred_reason;
	
	@Column(precision = 12, scale = 1)
	private BigDecimal pred_reliability;
	
	// 필요 없을거 같은데...
	private String ai_image;
	private Timestamp created_at;


	
}
