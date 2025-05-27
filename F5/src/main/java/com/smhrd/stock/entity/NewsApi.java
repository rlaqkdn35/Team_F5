package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_news_api")
public class NewsApi {

	@Id
	private int newsapi_idx;
	private String press_name;
	private String spot_title;
	
	@Lob
	private String spot_content;
	private Timestamp created_at;
}
