package com.smhrd.stock.repository;

import java.sql.Timestamp;
import java.util.List;
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

    // newsDt(뉴스 발행 일시)를 기준으로 특정 시간 이후의 뉴스 목록을 조회
    List<News> findByNewsDtAfterOrderByNewsDtDesc(Timestamp newsDt);
    List<News> findByNewsIdxIn(List<Long> newsIdxList);
    
    List<News> findAllByOrderByNewsDtDesc();
    
    List<News> findTop5ByOrderByNewsDtDesc();
    
    @Query("SELECT n FROM News n WHERE n.newsAnalysis = :analysisType AND n.newsDt BETWEEN :startOfDay AND :endOfDay ORDER BY n.newsAnalysisScore DESC, n.newsDt DESC")
    List<News> findByNewsAnalysisAndNewsDtBetweenOrderByNewsAnalysisScoreDescNewsDtDesc(
            @Param("analysisType") String analysisType,
            @Param("startOfDay") Timestamp startOfDay,
            @Param("endOfDay") Timestamp endOfDay,
            Pageable pageable);

    // 편의 메서드: findByNewsAnalysisAndNewsDtBetweenOrderByNewsAnalysisScoreDescNewsDtDesc를 래핑
    default List<News> findTopNByNewsAnalysisAndNewsDtBetweenOrderByNewsAnalysisScoreDescNewsDtDesc(String analysisType, Timestamp startOfDay, Timestamp endOfDay, int limit) {
        return findByNewsAnalysisAndNewsDtBetweenOrderByNewsAnalysisScoreDescNewsDtDesc(analysisType, startOfDay, endOfDay, Pageable.ofSize(limit));
    }
    
    @Query("SELECT MAX(n.newsDt) FROM News n")
    Timestamp findLatestNewsDate();
    
}