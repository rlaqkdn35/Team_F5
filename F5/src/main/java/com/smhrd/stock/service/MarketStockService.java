package com.smhrd.stock.service;

import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.stock.dto.StockPriceResponse;
import com.smhrd.stock.dto.StockPriceResponseWrapper;

@Service
public class MarketStockService {

	private final RestTemplate restTemplate = new RestTemplate();

    private static final String API_URL = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/exp-index-trend";

    public String getMarketStockPrice(String marketCode) {
        String url = API_URL +
                "?FID_MKOP_CLS_CODE=1" +
                "&FID_INPUT_HOUR_1=10" +
                "&FID_INPUT_ISCD=" + marketCode +
                "&FID_COND_MRKT_DIV_CODE=U";

        HttpHeaders headers = new HttpHeaders();
        headers.set("content-type", "application/json; charset=utf-8");
        headers.set("authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6Ijg3ODE3ZGRhLTQ0YTYtNDEzMy1iZjlhLThhMzI0OWY4ZjJlZCIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTc1MDgxMTk0MiwiaWF0IjoxNzUwNzI1NTQyLCJqdGkiOiJQU2tPQXB6SG1iQ054Wk1qMzdjWkduU1RFaFJzMVVxSUNSSk0ifQ.pUbvfGLHcT_ZIjiSLAfB347teZ2H50OHjEEWr4OZ-Svg5Os1Gnb5NuwwCPOUtcE2F5bS2oIezvOGYM484j5x-w"); // 발급받은 최신 토큰
        headers.set("appkey", "PSkOApzHmbCNxZMj37cZGnSTEhRs1UqICRJM");
        headers.set("appsecret", "bKbbZA5WthMzrJpJ2o67DbGV6xuJ+/oipdevfl6GN/qhNCjh2NjskerSvOo4Nd6HkZndGLt1pq6oku6XOEQwizILc6UgfwagKWWIT3ZRsmME6uTdcUUwLzqyxuSOjIaWQP7mTOSD8Mc0yOBxAd5VzLVFO+biJxuwJT+xjwqj0oWV/RAoBLA=");
        headers.set("custtype", "P");
        headers.set("tr_id", "FHPST01840000");
        headers.set("tr_cont", "");
        headers.set("mac_address", "24-4B-FE-CC-D8-1F");
        headers.set("hashkey", "abc1a265e2af6edb7e423f2b0efcdd8b371101a86471f4d4c6eb7d552a345b53");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
        );

        return response.getBody();
    }
    // ✅ 코스피용 메서드
    public String getKospiData() {
        return getMarketStockPrice("0001"); // KOSPI 코드
    }

    // ✅ 코스닥용 메서드
    public String getKosdaqData() {
        return getMarketStockPrice("1001"); // KOSDAQ 코드
    }
	public List<StockPriceResponse> getIndexPrices(String marketType) {
		String marketCode = marketType.equalsIgnoreCase("KOSPI") ? "0001" : "1001";
	    String json = getMarketStockPrice(marketCode);

	    try {
	        ObjectMapper mapper = new ObjectMapper();
	        StockPriceResponseWrapper wrapper = mapper.readValue(json, StockPriceResponseWrapper.class);
	        return wrapper.getOutput();
	    } catch (Exception e) {
	        e.printStackTrace();
	        return Collections.emptyList(); // 예외 발생 시 빈 리스트 반환
	    }
	}
	
}