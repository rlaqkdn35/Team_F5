package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_croom")
public class Croom {

	@Id
	private int croom_idx;
	
	@ManyToOne
	@JoinColumn(name = "stock_code", referencedColumnName = "stock_code")
	private Stock stock_code;
	private String croom_title;
	
	@Lob
	private String croom_info;
	
	private int croom_limit;
	private Timestamp created_at;
	private String croom_status;
}
