package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.CombinedNewsStockDto;
import com.smhrd.stock.dto.CombinedStockDetailDto;
import com.smhrd.stock.dto.LatestNewsDto;
import com.smhrd.stock.dto.NewsCoreIssueDto;
import com.smhrd.stock.dto.NewsDetailDto;
import com.smhrd.stock.dto.NewsSummaryDto;
import com.smhrd.stock.dto.RecentNewsDto;
import com.smhrd.stock.dto.RelatedStockInfoDto;
import com.smhrd.stock.dto.StockPriceDto;
import com.smhrd.stock.entity.News;
import com.smhrd.stock.entity.NewsForCompany;
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.NewsForCompanyRepository;
import com.smhrd.stock.repository.NewsRepository;
import com.smhrd.stock.repository.StockPriceRepository;
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
    
    @Autowired
    private StockPriceRepository stockPriceRepository;
    
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
        System.out.println("뉴스 서비스 - getLatestNewsPerIndividualStockCode() 시작");

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
                if (!latestNewsByIndividualStockCode.containsKey(trimmedCode)) { // putIfAbsent 대신 containsKey로 명시적 확인
                    String stockName = null;
                    Optional<Stock> stockOptional = stockRepository.findByStockCode(trimmedCode);
                    if (stockOptional.isPresent()) {
                        stockName = stockOptional.get().getStockName();
                        System.out.println("DEBUG: 종목 코드 [" + trimmedCode + "]에 대한 종목명: [" + stockName + "] 발견.");
                    } else {
                        System.out.println("WARN: 종목 코드 [" + trimmedCode + "]에 해당하는 Stock 엔티티를 찾을 수 없습니다.");
                    }
                    // ⭐ stockName을 LatestNewsDto.fromEntity()에 전달합니다.
                    latestNewsByIndividualStockCode.put(trimmedCode, LatestNewsDto.fromEntity(news, trimmedCode, stockName));
                }
            }
        }

        System.out.println("뉴스 서비스 - getLatestNewsPerIndividualStockCode() 종료. 최종 결과 " + latestNewsByIndividualStockCode.size() + "건.");
        // Map의 values() (LatestNewsDto 객체들)을 리스트로 변환하여 반환합니다.
        // 이 리스트의 크기는 latestNewsByIndividualStockCode 맵의 키 개수와 동일합니다.
        // 즉, 뉴스 데이터가 있는 모든 개별 종목 코드에 대한 최신 뉴스가 각각 하나씩 포함됩니다.
        return new ArrayList<>(latestNewsByIndividualStockCode.values());
    }


    public List<LatestNewsDto> getTop5LatestNews() {
        System.out.println("뉴스 서비스 - getTop5LatestNews() 시작");

        // 1. 데이터베이스에서 최신 뉴스 5개를 newsDt 기준으로 내림차순 정렬하여 가져옵니다.
        // NewsRepository에 findTop5ByOrderByNewsDtDesc() 메서드가 정의되어 있어야 합니다.
        List<News> latestNews = newsRepository.findTop5ByOrderByNewsDtDesc();

        if (latestNews.isEmpty()) {
            System.out.println("WARN: 최신 뉴스 5개를 찾을 수 없습니다. 빈 리스트를 반환합니다.");
            return new ArrayList<>();
        }

        List<LatestNewsDto> result = new ArrayList<>();

        // 2. 각 News 엔티티를 LatestNewsDto로 변환하면서 종목명을 추가합니다.
        for (News news : latestNews) {
            String primaryStockCode = null;
            String primaryStockName = null;

            // news.getStockCodes()에서 첫 번째 유효한 종목 코드를 추출합니다.
            if (news.getStockCodes() != null && !news.getStockCodes().trim().isEmpty()) {
                String[] stockCodesArray = news.getStockCodes().split(",");
                if (stockCodesArray.length > 0) {
                    primaryStockCode = stockCodesArray[0].trim(); // 첫 번째 종목 코드 사용

                    // 추출한 종목 코드로 Stock 엔티티에서 종목명을 조회합니다.
                    if (!primaryStockCode.isEmpty()) {
                        Optional<Stock> stockOptional = stockRepository.findByStockCode(primaryStockCode);
                        if (stockOptional.isPresent()) {
                            primaryStockName = stockOptional.get().getStockName();
                            System.out.println("DEBUG: 종목 코드 [" + primaryStockCode + "]에 대한 종목명: [" + primaryStockName + "] 발견.");
                        } else {
                            System.out.println("WARN: 종목 코드 [" + primaryStockCode + "]에 해당하는 Stock 엔티티를 찾을 수 없습니다.");
                        }
                    }
                }
            } else {
                System.out.println("INFO: 뉴스 [" + news.getNewsTitle() + "]: 연결된 종목 코드가 없습니다.");
            }

            // ⭐ LatestNewsDto.fromEntity() 팩토리 메서드를 호출할 때
            // ⭐ `primaryStockName`도 함께 전달하여 DTO의 `stockName` 필드를 채웁니다.
            LatestNewsDto dto = LatestNewsDto.fromEntity(news, primaryStockCode, primaryStockName);
            result.add(dto);
        }

        System.out.println("뉴스 서비스 - getTop5LatestNews() 종료. 최종 결과 " + result.size() + "건.");
        return result;
    }
    
    public List<NewsCoreIssueDto> getTop5LatestNewsWithStockDetails() {
        List<News> top5News = newsRepository.findTop5ByOrderByNewsDtDesc();
        List<NewsCoreIssueDto> result = new ArrayList<>();

        for (News news : top5News) {
            List<RelatedStockInfoDto> relatedStocks = new ArrayList<>();

            LocalDate newsDate = news.getNewsDt().toLocalDateTime().toLocalDate();
            LocalDate sevenDaysAgo = newsDate.minusDays(7);

            Timestamp endDate = Timestamp.valueOf(newsDate.atTime(23, 59, 59, 999_999_999));
            Timestamp startDate = Timestamp.valueOf(sevenDaysAgo.atStartOfDay());

            if (news.getStockCodes() != null && !news.getStockCodes().trim().isEmpty()) {
                String[] stockCodesArray = news.getStockCodes().split(",");

                for (String code : stockCodesArray) {
                    String trimmedCode = code.trim();
                    if (trimmedCode.isEmpty()) continue;

                    Optional<Stock> stockOptional = stockRepository.findByStockCode(trimmedCode);

                    if (stockOptional.isPresent()) {
                        Stock stock = stockOptional.get();

                        List<StockPrice> stockPrices = stockPriceRepository
                                .findByStock_StockCodeAndPriceDateBetweenOrderByPriceDateDesc(trimmedCode, startDate, endDate);

                        // ⭐ 추가된 로직: 같은 날짜의 주가 데이터 중 가장 최신 시간의 데이터만 선택
                        Map<LocalDate, StockPrice> dailyLatestStockPrices = stockPrices.stream()
                            .collect(Collectors.groupingBy(
                                stockPrice -> stockPrice.getPriceDate().toLocalDateTime().toLocalDate(), // 날짜만 기준으로 그룹화
                                Collectors.reducing(
                                    (sp1, sp2) -> sp1.getPriceDate().after(sp2.getPriceDate()) ? sp1 : sp2 // 같은 날짜 중 최신 시간 선택
                                )
                            ))
                            .entrySet().stream()
                            .filter(entry -> entry.getValue().isPresent()) // Optional이 비어있을 경우 (발생할 가능성은 적음) 필터링
                            .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> entry.getValue().get()
                            ));

                        // Map의 값(StockPrice 객체들)을 리스트로 변환하고, 날짜 역순으로 정렬 (최신 날짜가 먼저 오도록)
                        List<StockPrice> filteredAndSortedStockPrices = dailyLatestStockPrices.values().stream()
                            .sorted(Comparator.comparing(StockPrice::getPriceDate).reversed())
                            .collect(Collectors.toList());


                        List<StockPriceDto> stockPriceDtos = filteredAndSortedStockPrices.stream()
                                .map(StockPriceDto::fromEntity)
                                .collect(Collectors.toList());

                        relatedStocks.add(RelatedStockInfoDto.builder()
                                .stockCode(stock.getStockCode())
                                .stockName(stock.getStockName())
                                .companyInfo(stock.getCompanyInfo())
                                .stockPrices(stockPriceDtos)
                                .build());
                    }
                }
            }
            result.add(NewsCoreIssueDto.fromEntity(news, relatedStocks));
        }
        return result;
    }
    
    public List<CombinedNewsStockDto> getDailyAnalyzedNewsWithStockFluctuation() {
        System.out.println("뉴스 서비스 - getDailyAnalyzedNewsWithStockFluctuation() 시작");

        // 1. 데이터베이스에서 가장 최신 뉴스 날짜를 조회합니다.
        Timestamp latestOverallNewsDate = newsRepository.findLatestNewsDate();

        if (latestOverallNewsDate == null) {
            System.out.println("WARN: 데이터베이스에 어떤 뉴스도 존재하지 않습니다. 빈 리스트를 반환합니다.");
            return new ArrayList<>(); // 뉴스가 아예 없으면 빈 리스트 반환
        }

        // 가장 최신 뉴스 날짜를 기준으로 조회 범위 설정 (UTC 기준)
        // DB에 저장된 시간이 KST라면, .atZone(ZoneId.of("Asia/Seoul")) 또는 서버 기본 시간대 등을 고려해야 합니다.
        // 현재는 UTC로 통일 가정.
        LocalDate latestNewsLocalDate = latestOverallNewsDate.toInstant().atZone(ZoneOffset.UTC).toLocalDate();
        Timestamp startOfLatestNewsDay = Timestamp.from(latestNewsLocalDate.atStartOfDay(ZoneOffset.UTC).toInstant());
        Timestamp endOfLatestNewsDay = Timestamp.from(latestNewsLocalDate.atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant());

        System.out.println("INFO: 조회 기준 뉴스 날짜 (가장 최신): " + latestNewsLocalDate);
        System.out.println("INFO: 조회 범위 시작 (UTC): " + startOfLatestNewsDay);
        System.out.println("INFO: 조회 범위 종료 (UTC): " + endOfLatestNewsDay);

        // 2. 각 뉴스 분석 유형별로 뉴스를 조회하고 합칩니다.
        Set<News> selectedNewsSet = new LinkedHashSet<>(); // 중복 방지 및 순서 유지

        // 가장 최신 날짜를 기준으로 뉴스 조회
        List<News> negativeNews = newsRepository.findTopNByNewsAnalysisAndNewsDtBetweenOrderByNewsAnalysisScoreDescNewsDtDesc("negative", startOfLatestNewsDay, endOfLatestNewsDay, 2);
        selectedNewsSet.addAll(negativeNews);
        System.out.println("INFO: NEGATIVE 뉴스 조회 결과 (" + negativeNews.size() + "건): " + negativeNews.stream().map(News::getNewsTitle).collect(Collectors.joining(", ")));

        List<News> positiveNews = newsRepository.findTopNByNewsAnalysisAndNewsDtBetweenOrderByNewsAnalysisScoreDescNewsDtDesc("positive", startOfLatestNewsDay, endOfLatestNewsDay, 2);
        selectedNewsSet.addAll(positiveNews);
        System.out.println("INFO: POSITIVE 뉴스 조회 결과 (" + positiveNews.size() + "건): " + positiveNews.stream().map(News::getNewsTitle).collect(Collectors.joining(", ")));

        List<News> neutralNews = newsRepository.findTopNByNewsAnalysisAndNewsDtBetweenOrderByNewsAnalysisScoreDescNewsDtDesc("neutral", startOfLatestNewsDay, endOfLatestNewsDay, 2);
        selectedNewsSet.addAll(neutralNews);
        System.out.println("INFO: NEUTRAL 뉴스 조회 결과 (" + neutralNews.size() + "건): " + neutralNews.stream().map(News::getNewsTitle).collect(Collectors.joining(", ")));

        System.out.println("INFO: 선택된 총 뉴스 (중복 제거 전): " + selectedNewsSet.size() + "건");

        List<News> finalSelectedNews = selectedNewsSet.stream()
                                                    .sorted(Comparator.comparing(News::getNewsDt).reversed()) // 최종적으로 최신순 정렬
                                                    .limit(6) // 총 6개만 가져옵니다.
                                                    .collect(Collectors.toList());
        System.out.println("INFO: 최종 선택된 뉴스 (" + finalSelectedNews.size() + "건): " + finalSelectedNews.stream().map(News::getNewsTitle).collect(Collectors.joining(", ")));

        List<CombinedNewsStockDto> combinedResult = new ArrayList<>();

        // 3. 선택된 각 뉴스에 대해 연관된 종목 정보 및 주가 등락률/종가를 조합합니다.
        for (News news : finalSelectedNews) {
            System.out.println("DEBUG: 뉴스 처리 중: [" + news.getNewsTitle() + "], 뉴스 날짜: [" + news.getNewsDt() + "]");
            List<CombinedStockDetailDto> relatedStockDetails = new ArrayList<>();

            if (news.getStockCodes() != null && !news.getStockCodes().trim().isEmpty()) {
                String[] stockCodesArray = news.getStockCodes().split(",");
                System.out.println("DEBUG:   관련 종목 코드: " + news.getStockCodes());

                for (String code : stockCodesArray) {
                    String trimmedCode = code.trim();
                    if (trimmedCode.isEmpty()) {
                        System.out.println("WARN:   빈 종목 코드가 발견되어 스킵합니다.");
                        continue;
                    }
                    System.out.println("DEBUG:     처리 중인 종목 코드: " + trimmedCode);

                    Optional<Stock> stockOptional = stockRepository.findByStockCode(trimmedCode);

                    if (stockOptional.isPresent()) {
                        Stock stock = stockOptional.get();
                        System.out.println("DEBUG:     종목 발견: " + stock.getStockName());

                        // ⭐⭐ 주가 데이터 조회 로직 변경 시작 ⭐⭐
                        // 3a. 먼저 뉴스 날짜와 같은 날짜의 주가 데이터를 시도합니다.
                        Timestamp newsDateStartForPrice = Timestamp.from(news.getNewsDt().toInstant().atZone(ZoneOffset.UTC).toLocalDate().atStartOfDay(ZoneOffset.UTC).toInstant());
                        Timestamp newsDateEndForPrice = Timestamp.from(news.getNewsDt().toInstant().atZone(ZoneOffset.UTC).toLocalDate().atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant());

                        List<StockPrice> newsDayStockPrices = stockPriceRepository
                                .findTop1ByStock_StockCodeAndPriceDateBetweenOrderByPriceDateDesc(
                                        trimmedCode, newsDateStartForPrice, newsDateEndForPrice
                                );
                        System.out.println("DEBUG:     뉴스 날짜 (" + latestNewsLocalDate + ") 기준 StockPrice 조회 결과 (" + newsDayStockPrices.size() + "건) for stockCode " + trimmedCode + ": " + (newsDayStockPrices.isEmpty() ? "없음" : newsDayStockPrices.get(0).getStockFluctuation()));

                        StockPrice finalStockPrice = null;

                        if (!newsDayStockPrices.isEmpty()) {
                            finalStockPrice = newsDayStockPrices.get(0);
                            System.out.println("DEBUG:     뉴스 날짜에 맞는 주가 데이터 사용: 날짜: " + finalStockPrice.getPriceDate());
                        } else {
                            // 3b. 뉴스 날짜에 주가 데이터가 없으면, 해당 종목의 "가장 최신" 주가 데이터를 가져옵니다.
                            System.out.println("WARN:     종목 [" + trimmedCode + "]에 대한 뉴스 날짜 [" + news.getNewsDt().toInstant().atZone(ZoneOffset.UTC).toLocalDate() + "]에 주가 데이터가 없습니다. 해당 종목의 가장 최신 주가 데이터를 조회합니다.");
                            Optional<StockPrice> latestOverallStockPrice = stockPriceRepository.findTop1ByStock_StockCodeOrderByPriceDateDesc(trimmedCode);

                            if (latestOverallStockPrice.isPresent()) {
                                finalStockPrice = latestOverallStockPrice.get();
                                System.out.println("DEBUG:     종목 [" + trimmedCode + "]의 가장 최신 주가 데이터 사용 (날짜: " + finalStockPrice.getPriceDate() + "): " + finalStockPrice.getStockFluctuation());
                            } else {
                                System.out.println("WARN:     종목 [" + trimmedCode + "]에 대한 어떤 주가 데이터도 찾을 수 없습니다. (fallback 실패)");
                            }
                        }

                        // ⭐⭐ 주가 데이터 조회 로직 변경 끝 ⭐⭐

                        // DTO에 값 설정
                        if (finalStockPrice != null) {
                            relatedStockDetails.add(CombinedStockDetailDto.builder()
                                    .stockCode(stock.getStockCode())
                                    .stockName(stock.getStockName())
                                    .stockFluctuation(finalStockPrice.getStockFluctuation())
                                    .closePrice(finalStockPrice.getClosePrice())
                                    .priceDate(finalStockPrice.getPriceDate())
                                    .build());
                        } else {
                            // 어떤 주가 데이터도 찾지 못한 경우
                            relatedStockDetails.add(CombinedStockDetailDto.builder()
                                    .stockCode(stock.getStockCode())
                                    .stockName(stock.getStockName())
                                    .stockFluctuation(null)
                                    .closePrice(null)
                                    .priceDate(null)
                                    .build());
                        }

                    } else {
                        System.out.println("WARN:   종목 코드 [" + trimmedCode + "]에 해당하는 Stock 엔티티를 찾을 수 없습니다.");
                    }
                }
            } else {
                System.out.println("INFO:   뉴스 [" + news.getNewsTitle() + "]: 연결된 종목 코드가 없습니다.");
            }
            combinedResult.add(CombinedNewsStockDto.builder()
                    .newsIdx(news.getNewsIdx())
                    .newsTitle(news.getNewsTitle())
                    .newsDt(news.getNewsDt())
                    .newsAnalysis(news.getNewsAnalysis())
                    .stockCodes(news.getStockCodes())
                    .relatedStockDetails(relatedStockDetails)
                    .build());
        }
        System.out.println("뉴스 서비스 - getDailyAnalyzedNewsWithStockFluctuation() 종료. 최종 결과 " + combinedResult.size() + "건.");
        return combinedResult;
    }
    
}