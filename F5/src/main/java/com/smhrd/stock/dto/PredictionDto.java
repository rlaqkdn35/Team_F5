package com.smhrd.stock.dto;

import com.smhrd.stock.entity.Prediction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionDto {
    private Integer predIdx;
    private String stockCode;
    private String stockName;
    private Map<String, BigDecimal> predictionDays;
    private LocalDateTime createdAt;

    public static PredictionDto fromEntity(Prediction prediction, String stockName) {
        Map<String, BigDecimal> predictionDaysMap = new HashMap<>();
        predictionDaysMap.put("firstDay", prediction.getFirstDay());
        predictionDaysMap.put("secondDay", prediction.getSecondDay());
        predictionDaysMap.put("thirdDay", prediction.getThirdDay());
        predictionDaysMap.put("fourthDay", prediction.getFourthDay());
        predictionDaysMap.put("fifthDay", prediction.getFifthDay());
        predictionDaysMap.put("sixthDay", prediction.getSixthDay());
        predictionDaysMap.put("seventhDay", prediction.getSeventhDay());
        predictionDaysMap.put("eighthDay", prediction.getEighthDay());
        predictionDaysMap.put("ninthDay", prediction.getNinthDay());
        predictionDaysMap.put("tenthDay", prediction.getTenthDay());

        return PredictionDto.builder()
                .predIdx(prediction.getPredIdx())
                .stockCode(prediction.getStockCode())
                .stockName(stockName)
                .predictionDays(predictionDaysMap)
                .createdAt(prediction.getCreatedAt())
                .build();
    }
}