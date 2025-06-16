package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="t_croom")
@NoArgsConstructor
@AllArgsConstructor
public class Croom {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "croom_idx", nullable = false)
	private int croomIdx;
	
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
