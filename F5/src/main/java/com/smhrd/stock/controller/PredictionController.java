package com.smhrd.stock.controller;

import com.smhrd.stock.dto.PredictionDto;
import com.smhrd.stock.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController 
@RequestMapping("/predictions")
@CrossOrigin(origins = "http://localhost:3000") 
public class PredictionController {

    @Autowired 
    private PredictionService predictionService;

    /**
     * 각 종목 코드별 가장 최신 주가 예측 데이터를 조회하는 API 엔드포인트.
     * GET 요청에 대해 /api/predictions/latest-per-stock 경로로 매핑됩니다.
     *
     * @return 각 종목 코드별 최신 PredictionDto 객체 목록을 포함하는 ResponseEntity.
     * 데이터가 없는 경우 HTTP 204 No Content를 반환합니다.
     */
    @GetMapping("/latest-per-stock")
    public ResponseEntity<List<PredictionDto>> getLatestPredictionsPerStockCode() {
        List<PredictionDto> predictions = predictionService.getLatestPredictionsPerStockCode();

        // 만약 조회된 예측 데이터가 없다면, 204 No Content HTTP 상태 코드를 반환합니다.
        if (predictions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // 예측 데이터가 있다면, 200 OK HTTP 상태 코드와 함께 데이터를 반환합니다.
        return ResponseEntity.ok(predictions);
    }
}