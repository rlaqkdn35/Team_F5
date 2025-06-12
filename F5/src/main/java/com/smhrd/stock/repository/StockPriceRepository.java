package com.smhrd.stock.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.entity.StockPrice;

public interface StockPriceRepository extends Repository<StockPrice, Long> {

	@Query("SELECT new com.smhrd.stock.dto.StockPriceWithNameDto(" +
	           "sp.priceId, " +
	           "sp.stock.stockCode, " +
	           "s.stockName, " +
	           "sp.priceDate, " +  // Timestamp로 priceDate를 그대로 반환
	           "sp.openPrice, " +
	           "sp.highPrice, " +
	           "sp.lowPrice, " +
	           "sp.closePrice, " +
	           "sp.stockFluctuation) " +
	           "FROM StockPrice sp " +
	           "JOIN Stock s ON sp.stock.stockCode = s.stockCode " +
	           "WHERE FUNCTION('DATE', sp.priceDate) = :targetDate")  // DB에서 date만 추출하여 비교
	    List<StockPriceWithNameDto> findAllByPriceDateWithStockName(@Param("targetDate") LocalDate targetDate);
	}