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
@Table(name = "t_news")
public class News {

	 @Id // 기본 키(Primary Key) 지정
	    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본 키 자동 생성 전략 (MySQL, H2 등)
	    private Long newsIdx;

	    @Column(name = "news_title") // 컬럼명이 필드명과 다를 경우 지정
	    private String newsTitle;

	    @Column(name = "news_content")
	    private String newsContent;

	    @Column(name = "news_url")
	    private String newsUrl;

	    @Column(name = "press_name")
	    private String pressName;

	    @Column(name = "news_dt") // 뉴스 발행 일시
	    private Timestamp newsDt;

	    @Column(name = "created_at") // 레코드 생성 시간
	    private Timestamp createdAt;

	    @Column(name = "news_summary") 
	    private String newsSummary;
	    
	    @Column(name = "news_analysis")
	    private String newsAnalysis;

	    @Column(name = "news_analysis_score")
	    private Double newsAnalysisScore;
	    
	    @Column(name = "stock_codes")
	    private String stockCodes; 
}
