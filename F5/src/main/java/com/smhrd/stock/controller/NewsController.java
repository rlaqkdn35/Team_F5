package com.smhrd.stock.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.CombinedNewsStockDto;
import com.smhrd.stock.dto.LatestNewsDto;
import com.smhrd.stock.dto.NewsCoreIssueDto;
import com.smhrd.stock.dto.NewsDetailDto;
import com.smhrd.stock.dto.NewsSummaryDto;
import com.smhrd.stock.dto.RecentNewsDto;
import com.smhrd.stock.entity.News;
import com.smhrd.stock.service.NewsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/list")
    public Page<NewsSummaryDto> getPaginatedNewsList(
            @PageableDefault(page = 0, size = 20, sort = "newsDt", direction = Sort.Direction.DESC) Pageable pageable) {
        return newsService.getPaginatedNews(pageable);
    }
    
    @GetMapping("/detail/{newsIdx}")
    public ResponseEntity<NewsDetailDto> getNewsDetail(@PathVariable Long newsIdx) {
        try {
            NewsDetailDto newsDetail = newsService.getNewsDetailById(newsIdx);
            return ResponseEntity.ok(newsDetail);
        } catch (NoSuchElementException e) {
            // 해당 ID의 뉴스를 찾을 수 없을 경우 404 Not Found 반환
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/recent-24-hours")
    public ResponseEntity<List<RecentNewsDto>> getRecentNews() {
        List<RecentNewsDto> recentNews = newsService.getRecentNewsInLast24Hours();
        return ResponseEntity.ok(recentNews);
    }
    
    @GetMapping("/{stockCode}")
    public ResponseEntity<List<News>> getNewsByStockCodePath(@PathVariable String stockCode) {
        List<News> newsList = newsService.getNewsForSingleStockCode(stockCode);
        if (newsList.isEmpty()) {
            // 해당 주식 코드와 관련된 뉴스가 없으면 204 No Content 반환
            return ResponseEntity.noContent().build();
        }
        // 찾은 뉴스 목록을 JSON 형태로 반환 (자동 직렬화)
        return ResponseEntity.ok(newsList);
    }
    
    @GetMapping("/latest-per-individual-stock")
    public List<LatestNewsDto> getLatestNewsPerIndividualStockCode() {
        return newsService.getLatestNewsPerIndividualStockCode();
    }
    
    @GetMapping("/top5-latest")
    public ResponseEntity<List<LatestNewsDto>> getTop5LatestNews() {
        List<LatestNewsDto> newsList = newsService.getTop5LatestNews();
        if (newsList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(newsList);
    }
    
    @GetMapping("/top5-with-details")
    public ResponseEntity<List<NewsCoreIssueDto>> getTop5NewsWithStockDetails() {
        List<NewsCoreIssueDto> newsList = newsService.getTop5LatestNewsWithStockDetails();
        if (newsList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(newsList);
    }
    
    @GetMapping("/daily-analyzed-fluctuation") // 이 메서드의 구체적인 엔드포인트
    public ResponseEntity<List<CombinedNewsStockDto>> getDailyAnalyzedNewsWithFluctuation() {
        // NewsService의 메서드를 호출하여 필요한 데이터를 가져옵니다.
        List<CombinedNewsStockDto> newsData = newsService.getDailyAnalyzedNewsWithStockFluctuation();

        // 가져온 데이터를 HTTP 200 OK 상태 코드와 함께 응답으로 반환합니다.
        return ResponseEntity.ok(newsData);
    }
    
    
}