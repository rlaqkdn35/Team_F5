package com.smhrd.stock.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class StockPriceResponse {
	 private String stck_cntg_hour;        // 시간
	    private String bstp_nmix_prpr;        // 현재 지수
	    private String prdy_vrss_sign;        // 전일 대비 부호
	    private String bstp_nmix_prdy_vrss;   // 전일 대비 수치
	    private String prdy_ctrt;             // 등락률
	    private String acml_vol;              // 누적 거래량
	    private String acml_tr_pbmn;        // 종목명
	    
	    private String stck_prpr; // 현재가
	    private String stck_oprc; // 시가
	    private String stck_hgpr; // 고가
	    private String stck_lwpr; // 저가
	   
	    private String prdy_vrss; // 전일대비

	   
	    
}