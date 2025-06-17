package com.smhrd.stock.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.service.DailyIndexService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/index/daily")
@RequiredArgsConstructor
public class DailyIndexController {

	private final DailyIndexService dailyIndexService;

	@GetMapping("/save") // 🔁 @PostMapping 이었다면 이렇게 수정
	public String saveDaily() {
		dailyIndexService.saveDailyAverage("KOSPI");
		dailyIndexService.saveDailyAverage("KOSDAQ");
		return "✅ 저장 시도 완료";
	}

	@GetMapping("/recent")
	public ResponseEntity<?> getRecentIndexData() {
		return ResponseEntity.ok(dailyIndexService.getRecentIndexData());
	}
}