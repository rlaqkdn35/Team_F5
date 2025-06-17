package com.smhrd.stock.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

public class StockCsvUtil {

    public static Map<String, String> readStockCodeNameMap() {
        Map<String, String> stockMap = new HashMap<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(Objects.requireNonNull(
                        StockCsvUtil.class.getClassLoader().getResourceAsStream("kosdaq150.csv"))))) {

            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 2) {
                    stockMap.put(parts[0].trim(), parts[1].trim());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV 파일 읽기 실패: " + e.getMessage());
        }

        return stockMap;
    }
}
