// src/main/java/com/smhrd/stock/repository/PredictionRepository.java
package com.smhrd.stock.repository;

import com.smhrd.stock.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Integer> {

    List<Prediction> findAllByOrderByCreatedAtDesc();
}