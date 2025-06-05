package com.smhrd.stock.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.service.KeywordService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/keyword")
public class KeywordController {
	
	@Autowired
	private KeywordService keywordService;
	
	@GetMapping("/keywordData")
    public List<Map<String, Object>> keywordData() { 
        List<Map<String, Object>> list = keywordService.keywordData();
        
        return list;
    }

}
