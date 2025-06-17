package com.smhrd.stock.repository;

import com.smhrd.stock.entity.KosdaqStockPriceEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface KosdaqStockPriceRepository extends JpaRepository<KosdaqStockPriceEntity, Long> {
	 List<KosdaqStockPriceEntity> findByStockCode(String stockCode);

	    List<KosdaqStockPriceEntity> findByStockNameContaining(String stockName);
}
