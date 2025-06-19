package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.NewsDetailDto;
import com.smhrd.stock.dto.NewsSummaryDto;
import com.smhrd.stock.dto.RecentNewsDto;
import com.smhrd.stock.entity.News;
import com.smhrd.stock.entity.NewsForCompany;
import com.smhrd.stock.repository.NewsForCompanyRepository;
import com.smhrd.stock.repository.NewsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsService {

	@Autowired
    private NewsRepository newsRepository;

    @Autowired
    private NewsForCompanyRepository newsForCompanyRepository;
    
    public Page<NewsSummaryDto> getPaginatedNews(Pageable pageable) {
        return newsRepository.findAllNewsSummary(pageable);
    }
    
    public NewsDetailDto getNewsDetailById(Long newsIdx) {
        return newsRepository.findNewsDetailById(newsIdx)
                .orElseThrow(() -> new NoSuchElementException("News not found with id: " + newsIdx));
    }
    
    public List<RecentNewsDto> getRecentNewsInLast24Hours() { // 메소드명도 변경했습니다.
        // 현재 시간으로부터 24시간 전의 시간을 계산합니다. (하루 전)
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1); // 3시간 -> 1일로 변경
        Timestamp timestampOneDayAgo = Timestamp.valueOf(oneDayAgo);

        // 24시간 이내의 모든 뉴스들을 newsDt(뉴스 발행 일시) 기준 최신순으로 가져옵니다.
        List<News> recentNewsList = newsRepository.findByNewsDtAfterOrderByNewsDtDesc(timestampOneDayAgo);

        List<RecentNewsDto> result = new ArrayList<>();

        for (News news : recentNewsList) {
            // 해당 뉴스의 newsIdx를 사용하여 NewsForCompany에서 연관된 종목 코드를 찾습니다.
            // News 엔티티에 newsIdx가 있다면 그 값을 사용하고, 없다면 다른 방법으로 유니크 ID를 생성해야 합니다.
            // 만약 News의 newsIdx가 intValue()로 변환될 필요가 없다면 .intValue()를 제거하세요.
            List<NewsForCompany> relatedCompanies = newsForCompanyRepository.findByNewsIdx(news.getNewsIdx().intValue());

            // 연관된 종목 코드를 String 리스트로 추출합니다.
            List<String> relatedStockCodes = relatedCompanies.stream()
                                                            .map(NewsForCompany::getStockCode)
                                                            .collect(Collectors.toList());

            // RecentNewsDto를 생성하여 리스트에 추가합니다.
            RecentNewsDto dto = new RecentNewsDto(
                news.getNewsDt(),      // 뉴스의 시간 (Timestamp)
                news.getNewsTitle(),   // 뉴스의 제목
                relatedStockCodes,     // 연관 종목 (List<String>)
                news.getNewsSummary(), // 이슈 내용 (1줄 요약)
                news.getNewsUrl()      // 추가: 뉴스의 URL
            );
            result.add(dto);
        }

        return result;
    }
    
    public List<News> getNewsByStockCode(String stockCode) {
        List<NewsForCompany> mappings = newsForCompanyRepository.findByStockCode(stockCode);
        List<Long> newsIds = mappings.stream()
                                     .map(NewsForCompany::getNewsIdx)
                                     .toList();

        return newsRepository.findByNewsIdxIn(newsIds);
    }
}