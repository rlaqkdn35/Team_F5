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
        List<News> allNews = newsRepository.findAllByOrderByNewsDtDesc();

        // Map의 키는 개별 종목 코드(String), 값은 해당 종목 코드에 대한 최신 뉴스 DTO
        // 이렇게 하면 Map에 각 종목 코드별로 하나의 DTO가 매핑됩니다.
        Map<String, LatestNewsDto> latestNewsByIndividualStockCode = new LinkedHashMap<>();

        for (News news : allNews) {
            if (news.getStockCodes() == null || news.getStockCodes().trim().isEmpty()) {
                continue;
            }

            String[] codes = news.getStockCodes().split(",");
            for (String code : codes) {
                String trimmedCode = code.trim();
                if (trimmedCode.isEmpty()) {
                    continue;
                }

                // 해당 trimmedCode에 대한 최신 뉴스가 아직 맵에 없다면,
                // 현재 뉴스 엔티티와 해당 개별 종목 코드를 사용하여 새로운 DTO를 생성하고 저장합니다.
                // 이렇게 함으로써, 하나의 News 엔티티가 여러 개별 종목 코드에 대한 DTO로 변환될 수 있습니다.
                latestNewsByIndividualStockCode.putIfAbsent(trimmedCode, LatestNewsDto.fromEntity(news, trimmedCode));
            }
        }
        
        

        // Map의 values() (LatestNewsDto 객체들)을 리스트로 변환하여 반환합니다.
        // 이 리스트의 크기는 latestNewsByIndividualStockCode 맵의 키 개수와 동일합니다.
        // 즉, 뉴스 데이터가 있는 모든 개별 종목 코드에 대한 최신 뉴스가 각각 하나씩 포함됩니다.
        return new ArrayList<>(latestNewsByIndividualStockCode.values());
    }

    
    public List<LatestNewsDto> getTop5LatestNews() {
        // 1. 데이터베이스에서 모든 뉴스를 newsDt 내림차순(최신순)으로 가져옵니다.
        // 이때, LIMIT 5를 적용하여 처음부터 5개만 가져오도록 레포지토리에 쿼리 메서드를 정의하는 것이 효율적입니다.
        // 현재 newsRepository에 해당 메서드가 없다면 아래와 같이 추가해야 합니다.
        // List<News> top5NewsEntities = newsRepository.findTop5ByOrderByNewsDtDesc();

        // **만약 NewsRepository에 findTop5ByOrderByNewsDtDesc() 같은 메서드가 아직 없다면,**
        // 일단 findAllByOrderByNewsDtDesc()를 사용하고 Java 코드에서 5개로 제한할 수 있습니다.
        // 하지만 DB 레벨에서 LIMIT를 거는 것이 훨씬 효율적입니다.

        // 효율적인 방법: NewsRepository에 다음 메서드 추가 권장
        // public interface NewsRepository extends JpaRepository<News, Long> {
        //     List<News> findTop5ByOrderByNewsDtDesc(); // 이 메서드를 레포지토리에 추가해야 합니다.
        // }
        
        List<News> allNewsSorted = newsRepository.findAllByOrderByNewsDtDesc(); // 현재 레포지토리 기준

        // 2. Stream API를 사용하여 상위 5개의 뉴스만 선택하고, 각 뉴스를 DTO로 변환합니다.
        // 여기서는 각 뉴스 엔티티가 포함하는 '모든 종목 코드' 중 첫 번째 코드를 대표 종목 코드로 사용하여 DTO를 생성합니다.
        // 만약 특정 종목 코드를 기준으로 하고 싶지 않다면 LatestNewsDto.fromEntity(news, null) 또는 빈 문자열을 전달해도 됩니다.
        List<LatestNewsDto> top5NewsDtos = allNewsSorted.stream()
                .limit(5) // 상위 5개만 가져옵니다.
                .map(news -> {
                    // News 엔티티의 stock_codes는 콤마로 구분된 문자열일 수 있습니다.
                    // 여기서는 DTO 생성을 위해 첫 번째 종목 코드를 사용하거나, null/빈 문자열을 전달합니다.
                    String firstStockCode = (news.getStockCodes() != null && !news.getStockCodes().trim().isEmpty())
                                            ? news.getStockCodes().split(",")[0].trim()
                                            : null;
                    return LatestNewsDto.fromEntity(news, firstStockCode);
                })
                .collect(Collectors.toList());

        return top5NewsDtos;
    }
}