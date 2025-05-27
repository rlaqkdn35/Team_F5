package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "t_news")
public class News {

	@Id
	private int news_idx;
	private String news_title;
	@Lob
	private String news_content;
	private String news_url;
	private String press_name;
	private Timestamp news_dt;
	private Timestamp create_at;
}
