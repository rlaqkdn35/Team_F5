package com.smhrd.stock.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.dto.NewsDetailDto;
import com.smhrd.stock.dto.NewsSummaryDto;
import com.smhrd.stock.entity.News;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    @Query("SELECT new com.smhrd.stock.dto.NewsSummaryDto(n.newsIdx, n.newsTitle, n.newsContent, n.newsDt, n.pressName) " +
           "FROM News n")
    Page<NewsSummaryDto> findAllNewsSummary(Pageable pageable);
    
    
    @Query("SELECT new com.smhrd.stock.dto.NewsDetailDto(n.newsIdx, n.newsTitle, n.newsContent, n.newsUrl, n.pressName, n.newsDt) " +
            "FROM News n WHERE n.newsIdx = :newsIdx")
     Optional<NewsDetailDto> findNewsDetailById(@Param("newsIdx") Long newsIdx);
}