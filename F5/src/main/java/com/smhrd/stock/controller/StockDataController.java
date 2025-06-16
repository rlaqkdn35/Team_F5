package com.smhrd.stock.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.StockDataForFrontendDto;
import com.smhrd.stock.service.SectorService;

@RestController
@RequestMapping("/stock")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StockDataController {

    private final SectorService sectorService;

    @Autowired
    public StockDataController(SectorService sectorService) {
        this.sectorService = sectorService;
    }


    @GetMapping("/latest-data") // 이 엔드포인트는 모든 종목의 최신 데이터와 업종 정보를 제공
    public ResponseEntity<List<StockDataForFrontendDto>> getLatestStockDataForFrontend() {
        List<StockDataForFrontendDto> allStockData = sectorService.getAllLatestStockDataForFrontend();
        return ResponseEntity.ok(allStockData);
    }
}