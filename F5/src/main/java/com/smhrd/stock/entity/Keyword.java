package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_keyword")
public class Keyword {

	@Id
	private int keyword_idx;
	private int news_idx;
	private String keyword_name;
	private int mentioned_cnt;
	private Timestamp created_at;
}
