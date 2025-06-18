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

import com.smhrd.stock.dto.NewsDetailDto;
import com.smhrd.stock.dto.NewsSummaryDto;
import com.smhrd.stock.dto.RecentNewsDto;
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
    
    
}