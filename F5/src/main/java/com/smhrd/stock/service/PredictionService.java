package com.smhrd.stock.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.PredictionDto;
import com.smhrd.stock.entity.Prediction;
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.repository.PredictionRepository;
import com.smhrd.stock.repository.StockRepository; 

@Service
public class PredictionService {

    @Autowired
    private PredictionRepository predictionRepository;
    
    @Autowired
    private StockRepository stockRepository;

    /**
     * 모든 종목 코드에 대해 각각의 가장 최신 주가 예측 데이터를 가져와 DTO 목록으로 반환합니다.
     * 이 메서드는 데이터베이스에서 모든 예측 데이터를 가져온 후, 각 종목 코드별로 가장 최신 데이터만 필터링합니다.
     * 결과 목록의 크기는 데이터베이스에 예측 데이터가 존재하는 고유한 종목 코드의 총 개수와 같습니다.
     *
     * @return 각 종목 코드별 최신 PredictionDto 목록.
     * 만약 특정 종목 코드에 대한 예측 데이터가 DB에 없다면 해당 종목 코드는 결과에서 제외됩니다.
     */
    public List<PredictionDto> getLatestPredictionsPerStockCode() {
        // 1. 데이터베이스에서 모든 예측 데이터를 created_at 내림차순(최신순)으로 가져옵니다.
        List<Prediction> allPredictions = predictionRepository.findAllByOrderByCreatedAtDesc();

        // 2. 각 개별 stock_code별로 가장 최신 예측 데이터를 저장할 Map을 생성합니다.
        Map<String, PredictionDto> latestPredictionMap = new LinkedHashMap<>();

        for (Prediction prediction : allPredictions) {
            String stockCode = prediction.getStockCode();
            if (stockCode == null || stockCode.trim().isEmpty()) {
                continue;
            }

            String trimmedCode = stockCode.trim();

            // 이미 해당 종목 코드에 대한 최신 예측 데이터가 맵에 있다면 건너뜁니다.
            if (latestPredictionMap.containsKey(trimmedCode)) {
                continue;
            }

            // 종목 코드에 해당하는 종목명을 t_stock 테이블에서 조회합니다.
            Optional<Stock> stockOptional = stockRepository.findByStockCode(trimmedCode);
            // 종목명이 없으면 "알 수 없는 종목명"으로 처리합니다.
            String stockName = stockOptional.map(Stock::getStockName).orElse("알 수 없는 종목명");

            // Prediction 엔티티와 조회된 종목명을 사용하여 DTO를 생성합니다.
            latestPredictionMap.put(trimmedCode, PredictionDto.fromEntity(prediction, stockName));
        }

        return new ArrayList<>(latestPredictionMap.values());
    }
}