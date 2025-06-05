package com.smhrd.stock.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smhrd.stock.repository.KeywordRepository;

@Service
public class KeywordService {

	@Autowired
	private KeywordRepository keywordRepository;

	public List<Map<String, Object>> keywordData() {
        System.out.println("Fetching keyword data");
        try {
            List<Object[]> results = keywordRepository.findTop100KeywordStats();
            return results.stream().map(result -> {
                Map<String, Object> map = new HashMap<>();
                map.put("keywordName", (String) result[0]);
                map.put("totalCount", ((Number) result[1]).longValue());
                map.put("numArticlesMentionedIn", ((Number) result[2]).longValue());
                return map;
            }).toList();
        } catch (Exception e) {
            System.err.println("Error in keywordData: " + e.getMessage());
            return Collections.emptyList();
        }
    }
	
}
