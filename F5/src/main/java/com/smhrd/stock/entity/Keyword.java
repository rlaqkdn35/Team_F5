package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_keyword")
public class Keyword {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int keyword_idx;
	private int news_idx;
	@Column(length = 255)
	private String keyword_name;
	private int mentioned_cnt;
	private Timestamp created_at;
}
