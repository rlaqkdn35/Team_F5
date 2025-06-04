package com.smhrd.stock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, String> {


}