package com.smhrd.stock.service;

import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.NewsDetailDto;
import com.smhrd.stock.dto.NewsSummaryDto;
import com.smhrd.stock.repository.NewsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;

    public Page<NewsSummaryDto> getPaginatedNews(Pageable pageable) {
        return newsRepository.findAllNewsSummary(pageable);
    }
    
    public NewsDetailDto getNewsDetailById(Long newsIdx) {
        return newsRepository.findNewsDetailById(newsIdx)
                .orElseThrow(() -> new NoSuchElementException("News not found with id: " + newsIdx));
    }
    
}