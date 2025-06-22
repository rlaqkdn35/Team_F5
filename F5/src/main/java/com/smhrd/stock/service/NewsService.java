package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.LatestNewsDto;
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
    public List<LatestNewsDto> getLatestNewsPerIndividualStockCode() {
        // 1. 데이터베이스에서 모든 뉴스를 최신순(newsDt 내림차순)으로 가져옵니다.
        // **주의: 데이터 양이 매우 많다면 이 findAll() 호출이 성능 병목이 될 수 있습니다.**
        // 실제 운영 환경에서는 findAll() 대신 일정 기간의 뉴스만 가져오거나,
        // (예: newsRepository.findByNewsDtAfterOrderByNewsDtDesc(somePastTimestamp))
        // 페이징(Pageable)을 사용하여 데이터를 제한적으로 로드하는 것을 고려해야 합니다.
        List<News> allNews = newsRepository.findAllByOrderByNewsDtDesc();

        // 2. 각 개별 종목 코드별로 가장 최신 뉴스를 저장할 Map을 생성합니다.
        // LinkedHashMap을 사용하면 종목 코드가 처음 발견된 순서대로 결과가 유지됩니다.
        Map<String, News> latestNewsMap = new LinkedHashMap<>();

        // 3. 가져온 뉴스 목록을 순회하며 각 개별 종목 코드별 최신 뉴스를 필터링합니다.
        // allNews가 이미 newsDt 내림차순으로 정렬되어 있으므로,
        // Map에 먼저 들어가는 뉴스가 해당 종목 코드의 가장 최신 뉴스가 됩니다.
        for (News news : allNews) {
            // stock_codes가 null이거나 비어있으면 건너뜁니다.
            if (news.getStockCodes() == null || news.getStockCodes().trim().isEmpty()) {
                continue;
            }

            // stock_codes 문자열을 콤마(,)로 분리합니다.
            String[] codes = news.getStockCodes().split(",");
            for (String code : codes) {
                String trimmedCode = code.trim(); // 각 종목 코드의 앞뒤 공백을 제거합니다.
                if (trimmedCode.isEmpty()) {
                    continue; // 비어있는 문자열은 건너뜁니다.
                }

                // 해당 trimmedCode가 아직 Map의 키로 존재하지 않으면, 현재 news를 최신 뉴스로 저장합니다.
                // newsRepository.findAllByOrderByNewsDtDesc() 덕분에 먼저 발견되는 뉴스가 최신입니다.
                latestNewsMap.putIfAbsent(trimmedCode, news);
            }
        }

        // 4. Map에 저장된 (각 종목 코드별 최신) 뉴스 엔티티들을 DTO로 변환하여 반환합니다.
        return latestNewsMap.values().stream()
                .map(LatestNewsDto::fromEntity)
                .collect(Collectors.toList());
    }

}