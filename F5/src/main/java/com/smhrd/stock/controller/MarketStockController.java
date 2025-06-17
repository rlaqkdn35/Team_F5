package com.smhrd.stock.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.StockPriceResponse;
import com.smhrd.stock.service.MarketStockService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stock")
public class MarketStockController {

	@Autowired
    private MarketStockService marketService;

    @GetMapping("/kospi")
    public ResponseEntity<String> getKospiData() {
        return ResponseEntity.ok(marketService.getKospiData());
    }

    @GetMapping("/kosdaq")
    public ResponseEntity<String> getKosdaqData() {
        return ResponseEntity.ok(marketService.getKosdaqData());
    }
}