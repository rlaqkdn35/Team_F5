package com.smhrd.stock.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.service.StockPriceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // React 포트 기준
public class StockPriceController {

    private final StockPriceService stockPriceService;

    @GetMapping("/daily")
    public List<StockPriceWithNameDto> getDailyStocks() {
        // 실제 운영에서는 LocalDate.now() 사용
        LocalDate targetDate = LocalDate.now(); // 확인용 하드코딩
        return stockPriceService.getDailyStockData(targetDate);
    }
    
    @GetMapping("/{stockCode}/history")
    public List<StockPriceWithNameDto> getStockHistoryByCode(@PathVariable String stockCode) { // DTO 타입 변경
        return stockPriceService.getStockHistoryByCode(stockCode);
    }
    
}
