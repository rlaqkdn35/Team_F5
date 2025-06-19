package com.smhrd.stock.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, String> {
	Optional<Stock> findByStockCode(String stockCode);

	List<Stock> findByStockCodeIn(List<String> stockCodes);
	
}