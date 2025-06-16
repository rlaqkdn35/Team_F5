package com.smhrd.stock.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.entity.StockPrice;

public interface StockPriceRepository extends Repository<StockPrice, Long> {

	@Query("SELECT new com.smhrd.stock.dto.StockPriceWithNameDto(" + "sp.priceId, " + "sp.stock.stockCode, "
			+ "s.stockName, " + "sp.priceDate, " + "sp.openPrice, " + "sp.highPrice, " + "sp.lowPrice, "
			+ "sp.closePrice, " + "sp.stockFluctuation, " + "sp.stockVolume) " + // DTO 생성자 괄호 뒤에 충분한 공백을 추가했습니다.
			"FROM StockPrice sp " + "JOIN Stock s ON sp.stock.stockCode = s.stockCode "
			+ "WHERE FUNCTION('DATE', sp.priceDate) = :targetDate")
	List<StockPriceWithNameDto> findAllByPriceDateWithStockName(@Param("targetDate") LocalDate targetDate);

	@Query(value = "SELECT sp FROM StockPrice sp JOIN FETCH sp.stock s "
			+ "WHERE (sp.stock.stockCode, sp.priceDate) IN "
			+ "(SELECT sub.stock.stockCode, MAX(sub.priceDate) FROM StockPrice sub GROUP BY sub.stock.stockCode)")
	List<StockPrice> findAllLatestStockPricesWithStockInfo();

}
