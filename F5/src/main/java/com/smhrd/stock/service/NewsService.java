package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
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
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.repository.NewsForCompanyRepository;
import com.smhrd.stock.repository.NewsRepository;
import com.smhrd.stock.repository.StockRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsService {

	@Autowired
    private NewsRepository newsRepository;

    @Autowired
    private NewsForCompanyRepository newsForCompanyRepository;
    
    @Autowired
    private StockRepository stockRepository;
    
    public Page<NewsSummaryDto> getPaginatedNews(Pageable pageable) {
        return newsRepository.findAllNewsSummary(pageable);
    }
    
    public NewsDetailDto getNewsDetailById(Long newsIdx) {
        return newsRepository.findNewsDetailById(newsIdx)
                .orElseThrow(() -> new NoSuchElementException("News not found with id: " + newsIdx));
    }
    
    public List<RecentNewsDto> getRecentNewsInLast24Hours() {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        Timestamp timestampOneDayAgo = Timestamp.valueOf(oneDayAgo);

        System.out.println(">>> [NewsService] 뉴스 조회 시작: 지난 24시간 내 뉴스 (기준 시간: " + timestampOneDayAgo + ")");
        List<News> recentNewsList = newsRepository.findByNewsDtAfterOrderByNewsDtDesc(timestampOneDayAgo);
        System.out.println(">>> [NewsService] 조회된 최근 뉴스 개수: " + recentNewsList.size());

        if (recentNewsList.isEmpty()) {
            System.out.println(">>> [NewsService] 경고: 지난 24시간 내 뉴스가 없습니다. 빈 리스트를 반환합니다.");
            return new ArrayList<>();
        }

        // 연관된 모든 종목 코드를 수집하여 중복을 제거합니다.
        Set<String> allRelatedStockCodes = new HashSet<>();
        System.out.println(">>> [NewsService] 모든 뉴스에 대한 연관 종목 코드 수집 시작.");
        for (News news : recentNewsList) {
            // 이 로그 라인이 추가되었습니다. News 객체에서 가져온 news_idx를 바로 출력합니다.
            System.out.println(">>> [NewsService] [첫 번째 루프] 현재 처리 중인 뉴스 NewsIdx: " + news.getNewsIdx() + ", 제목: '" + news.getNewsTitle() + "'");

            List<NewsForCompany> relatedCompanies = newsForCompanyRepository.findByNewsIdx(news.getNewsIdx().intValue());
            System.out.println(">>> [NewsService] [첫 번째 루프] 뉴스 제목: '" + news.getNewsTitle() + "', NewsIdx: " + news.getNewsIdx() + ", 연관 회사 개수: " + relatedCompanies.size());

            relatedCompanies.forEach(nf -> allRelatedStockCodes.add(nf.getStockCode()));
        }
        System.out.println(">>> [NewsService] 수집된 고유 연관 종목 코드 개수: " + allRelatedStockCodes.size() + ", 코드들: " + allRelatedStockCodes);
        if (allRelatedStockCodes.isEmpty()) {
            System.out.println(">>> [NewsService] 경고: 수집된 연관 종목 코드가 없습니다. 일부 뉴스 DTO의 relatedStocks가 비어있을 수 있습니다.");
        }


        // 수집된 모든 종목 코드를 사용하여 Stock 엔티티를 한 번에 가져옵니다.
        List<Stock> stocks = stockRepository.findByStockCodeIn(new ArrayList<>(allRelatedStockCodes));
        System.out.println(">>> [NewsService] 조회된 Stock 엔티티 개수 (종목 코드로부터): " + stocks.size());
        if (stocks.isEmpty() && !allRelatedStockCodes.isEmpty()) {
            System.out.println(">>> [NewsService] 경고: NewsForCompany에는 종목 코드가 있으나, Stock 테이블에서 해당 종목 코드를 찾을 수 없습니다. (누락된 코드: " + allRelatedStockCodes + ")");
        }


        // 종목 코드를 키로, 종목명을 값으로 하는 맵을 생성하여 빠른 조회를 가능하게 합니다.
        Map<String, String> stockCodeToNameMap = stocks.stream()
                .collect(Collectors.toMap(Stock::getStockCode, Stock::getStockName));
        System.out.println(">>> [NewsService] 생성된 종목 코드-이름 맵 크기: " + stockCodeToNameMap.size() + ", 맵 내용: " + stockCodeToNameMap);


        List<RecentNewsDto> result = new ArrayList<>();

        for (News news : recentNewsList) {
            // 두 번째 루프에서도 news_idx를 확인하는 로그를 유지합니다.
            System.out.println(">>> [NewsService] [두 번째 루프] 현재 처리 중인 뉴스 NewsIdx: " + news.getNewsIdx() + ", 제목: '" + news.getNewsTitle() + "'");

            List<NewsForCompany> relatedCompanies = newsForCompanyRepository.findByNewsIdx(news.getNewsIdx().intValue());

            // 연관된 종목 코드를 종목명으로 변환하여 String 리스트로 추출합니다.
            List<String> relatedStockNames = relatedCompanies.stream()
                                                            .map(NewsForCompany::getStockCode)
                                                            .map(stockCode -> {
                                                                String stockName = stockCodeToNameMap.getOrDefault(stockCode, stockCode + "(미등록)");
                                                                if (stockName.endsWith("(미등록)")) {
                                                                    System.out.println(">>> [NewsService] 경고: 뉴스 '" + news.getNewsTitle() + "' 에 대한 종목 코드 '" + stockCode + "' 의 종목명을 찾을 수 없습니다.");
                                                                }
                                                                return stockName;
                                                            })
                                                            .collect(Collectors.toList());

            System.out.println(">>> [NewsService] 뉴스 제목: '" + news.getNewsTitle() + "', 최종 연관 종목명 리스트: " + relatedStockNames);

            RecentNewsDto dto = new RecentNewsDto(
                news.getNewsDt(),
                news.getNewsTitle(),
                relatedStockNames, // 이제 종목명 리스트(List<String>)가 들어갑니다.
                news.getNewsSummary(),
                news.getNewsUrl()
            );
            result.add(dto);
        }

        System.out.println(">>> [NewsService] 뉴스 조회 및 DTO 변환 완료. 총 DTO 개수: " + result.size());
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