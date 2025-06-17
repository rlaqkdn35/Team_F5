package com.smhrd.stock.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Component
public class OpenApiCaller {

    private static final String API_URL = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price";
    private static final String APP_KEY = "PSkOApzHmbCNxZMj37cZGnSTEhRs1UqICRJM";
    private static final String APP_SECRET = "bKbbZA5WthMzrJpJ2o67DbGV6xuJ+/oipdevfl6GN/qhNCjh2NjskerSvOo4Nd6HkZndGLt1pq6oku6XOEQwizILc6UgfwagKWWIT3ZRsmME6uTdcUUwLzqyxuSOjIaWQP7mTOSD8Mc0yOBxAd5VzLVFO+biJxuwJT+xjwqj0oWV/RAoBLA=";
    private static final String ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6ImVkODBmYTdhLWQ5OGUtNGEyMC1hYzFmLTQ1OGI1NjlkYTVjNyIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTc1MDEzNjE0MCwiaWF0IjoxNzUwMDQ5NzQwLCJqdGkiOiJQU2tPQXB6SG1iQ054Wk1qMzdjWkduU1RFaFJzMVVxSUNSSk0ifQ.xDzje1NA4HvyQ1x-YUeH30V6Z49C0LH8YBqH2aFSBP7fjVYsnP4emj8vRn5kI8Ih0SZxAiLMUI6HHesJ9WU1Uw";
    public Map<String, String> fetchStockData(String stockCode) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("authorization", "Bearer " + ACCESS_TOKEN);
        headers.set("appKey", APP_KEY);
        headers.set("appSecret", APP_SECRET);
        headers.set("tr_id", "FHKST01010100"); // 실전 계좌용
        headers.set("custtype", "P");
        headers.setContentType(MediaType.APPLICATION_JSON);

        String uri = API_URL + "?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=" + stockCode;

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(uri, HttpMethod.GET, entity, Map.class);
        Map<String, Object> body = response.getBody();
        Map<String, String> output = (Map<String, String>) body.get("output");

        return output;
    }
}
