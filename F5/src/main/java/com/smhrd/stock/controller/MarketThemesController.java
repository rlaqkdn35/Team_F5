package com.smhrd.stock.controller;

import com.smhrd.stock.dto.MarketThemeStockDto;
import com.smhrd.stock.service.MarketThemesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/market-themes")
@RequiredArgsConstructor
public class MarketThemesController {

    private final MarketThemesService marketThemesService;

    // 52주 신고가 종목 가져오기
    @GetMapping("/high52w")
    public ResponseEntity<List<MarketThemeStockDto>> getHigh52wStocks() {
        List<MarketThemeStockDto> stocks = marketThemesService.getHigh52wStocks();
        return ResponseEntity.ok(stocks);
    }

    // 상한가 종목 가져오기
    @GetMapping("/upperLimit")
    public ResponseEntity<List<MarketThemeStockDto>> getUpperLimitStocks() {
        List<MarketThemeStockDto> stocks = marketThemesService.getUpperLimitStocks();
        return ResponseEntity.ok(stocks);
    }

    // 거래비중상위 종목 가져오기
    @GetMapping("/topVolumeShare")
    public ResponseEntity<List<MarketThemeStockDto>> getTopVolumeShareStocks() {
        List<MarketThemeStockDto> stocks = marketThemesService.getTopVolumeShareStocks();
        return ResponseEntity.ok(stocks);
    }
}