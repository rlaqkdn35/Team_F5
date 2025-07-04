package com.smhrd.stock.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class StockPriceResponseWrapper {
    private List<StockPriceResponse> output;
}
