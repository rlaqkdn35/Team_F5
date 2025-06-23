package com.smhrd.stock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.TradeSignal;

@Repository
public interface TradeSignalRepository extends JpaRepository<TradeSignal, Integer> {
    // 특정 stockCode에 대한 시그널을 조회하는 메서드 등 필요에 따라 추가
    // List<TradeSignal> findByStockCodeOrderByCreatedAtDesc(String stockCode);
}