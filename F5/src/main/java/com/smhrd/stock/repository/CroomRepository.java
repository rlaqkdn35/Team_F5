package com.smhrd.stock.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.Croom;
import com.smhrd.stock.entity.Stock;

@Repository
public interface CroomRepository extends JpaRepository<Croom, Integer> {



	Optional<Croom> findByStock_StockCode(String stockCode);

	

}
