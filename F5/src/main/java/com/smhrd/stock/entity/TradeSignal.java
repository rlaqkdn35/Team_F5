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
@Table(name="t_trade_signal")
public class TradeSignal {

	@Id
	private int signal_idx;
	private String stock_code;
	private String signal_type;
	private Timestamp signal_dt;
	
	@Column(precision = 12, scale = 1)
	private BigDecimal signal_at_price;
	
	@Lob
	private String signal_reason;
	
	private Timestamp created_at;
	private int newsapi_idx;
}
