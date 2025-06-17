package com.smhrd.stock.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.entity.StockPrice;
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
    
 // 특정 주식 코드의 가장 최신 시세 데이터 조회 (GET /stockprices/latest/{stockCode})
    @GetMapping("/latest/{stockCode}")
    public ResponseEntity<StockPrice> getLatestStockPrice(@PathVariable String stockCode) {
        StockPrice latestPrice = stockPriceService.getStockPriceByStockCodeLatest(stockCode);
        if (latestPrice != null) {
            return ResponseEntity.ok(latestPrice); // 200 OK
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 Not Found
        }
    }
}
