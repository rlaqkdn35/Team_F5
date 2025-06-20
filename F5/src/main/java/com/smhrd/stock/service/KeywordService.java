package com.smhrd.stock.service;

import com.smhrd.stock.dto.KeywordDTO;
import com.smhrd.stock.dto.RelatedNewsDto;
import com.smhrd.stock.repository.KeywordRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
// import java.util.HashMap; // 사용되지 않아 제거
// import java.util.Map;     // 사용되지 않아 제거
import java.util.stream.Collectors;

@Service
public class KeywordService {

    @Autowired
    private KeywordRepository keywordRepository;

    @Autowired // EntityManager 주입
    private EntityManager entityManager;

    /**
     * 상위 키워드 목록과 각 키워드에 대한 연관 뉴스 목록을 가져옵니다.
     *
     * @param minMentionedCount 키워드가 뉴스에서 언급된 최소 횟수
     * @param limitNewsPerKeyword 각 키워드당 가져올 연관 뉴스의 최대 개수
     * @return 상위 키워드 통계 및 연관 뉴스를 포함하는 KeywordDTO 리스트
     */
    public List<KeywordDTO> getTopKeywordsWithRelatedNews(int minMentionedCount, int limitNewsPerKeyword) {
        System.out.println("--- KeywordService.getTopKeywordsWithRelatedNews() 시작 ---");
        System.out.println("  > 요청 파라미터: minMentionedCount=" + minMentionedCount + ", limitNewsPerKeyword=" + limitNewsPerKeyword);

        try {
            // 1. 상위 키워드 통계 가져오기
            System.out.println("  > KeywordRepository.findTopKeywordsStats() 호출 중...");
            List<KeywordDTO> topKeywords = keywordRepository.findTopKeywordsStats();
            System.out.println("  > findTopKeywordsStats() 호출 완료. 결과 개수: " + topKeywords.size());

            if (topKeywords.isEmpty()) {
                System.out.println("  > 상위 키워드 데이터가 없습니다. 연관 뉴스 조회를 건너_ㅂ니다.");
                return Collections.emptyList();
            }

            // 2. 각 상위 키워드에 대해 연관 뉴스 목록 가져와서 KeywordDTO에 설정
            for (KeywordDTO keyword : topKeywords) {
                System.out.println("  > 키워드 '" + keyword.getKeyword_Name() + "'에 대한 연관 뉴스 조회 시작.");

                // EntityManager를 사용하여 직접 네이티브 쿼리 생성 및 실행
                String nativeQuerySql = """
                    SELECT
                        n.news_idx,
                        n.news_title,
                        n.news_url,
                        n.press_name
                    FROM
                        t_keyword k
                    JOIN
                        t_news n ON k.news_idx = n.news_idx
                    WHERE
                        k.keyword_name = :keywordName
                        AND k.mentioned_cnt >= :minMentionedCount
                    ORDER BY
                        k.mentioned_cnt DESC, n.news_dt DESC
                    LIMIT :limitNewsCount OFFSET 0
                    """;

                Query query = entityManager.createNativeQuery(nativeQuerySql);
                query.setParameter("keywordName", keyword.getKeyword_Name());
                query.setParameter("minMentionedCount", minMentionedCount);
                query.setParameter("limitNewsCount", limitNewsPerKeyword);
                System.out.println("    > 실행할 네이티브 쿼리: " + nativeQuerySql.replace(":keywordName", "'" + keyword.getKeyword_Name() + "'")
                                                                         .replace(":minMentionedCount", String.valueOf(minMentionedCount))
                                                                         .replace(":limitNewsCount", String.valueOf(limitNewsPerKeyword)));


                List<Object[]> rawNewsData = query.getResultList();
                System.out.println("    > 키워드 '" + keyword.getKeyword_Name() + "'에 대해 " + rawNewsData.size() + "개의 raw 뉴스 데이터 조회됨.");

                if (rawNewsData.isEmpty()) {
                    System.out.println("    > 키워드 '" + keyword.getKeyword_Name() + "'에 대한 연관 뉴스 데이터가 없습니다.");
                } else {
                    // 첫 번째 raw 뉴스 데이터의 내용 출력 (디버깅용)
                    System.out.print("    > 첫 번째 raw 뉴스 데이터 (Object[]): [");
                    for (int i = 0; i < rawNewsData.get(0).length; i++) {
                        System.out.print(rawNewsData.get(0)[i] + (i < rawNewsData.get(0).length - 1 ? ", " : ""));
                    }
                    System.out.println("]");
                }


                // Object[] 결과를 RelatedNewsDto 리스트로 변환
                List<RelatedNewsDto> relatedNewsList = rawNewsData.stream()
                        .map(row -> {
                            // 각 row가 올바른 타입인지 한 번 더 확인 (Type Mismatch 방지)
                            if (row.length < 4) {
                                System.err.println("    > 경고: rawNewsData 행의 컬럼 수가 예상보다 적습니다. 행: " + java.util.Arrays.toString(row));
                                return null; // 또는 예외 처리
                            }
                            Object newsIdxObj = row[0];
                            Object newsTitleObj = row[1];
                            Object newsUrlObj = row[2];
                            Object pressNameObj = row[3];

                            System.out.println("      > 변환 중: newsIdx=" + newsIdxObj + " (" + (newsIdxObj != null ? newsIdxObj.getClass().getSimpleName() : "null") + ")");
                            System.out.println("      > 변환 중: newsTitle=" + newsTitleObj + " (" + (newsTitleObj != null ? newsTitleObj.getClass().getSimpleName() : "null") + ")");
                            System.out.println("      > 변환 중: newsUrl=" + newsUrlObj + " (" + (newsUrlObj != null ? newsUrlObj.getClass().getSimpleName() : "null") + ")");
                            System.out.println("      > 변환 중: pressName=" + pressNameObj + " (" + (pressNameObj != null ? pressNameObj.getClass().getSimpleName() : "null") + ")");

                            return new RelatedNewsDto(
                                    ((Number) newsIdxObj).longValue(), // news_idx
                                    (String) newsTitleObj,               // news_title
                                    (String) newsUrlObj,               // news_url
                                    (String) pressNameObj                // press_name
                            );
                        })
                        .filter(java.util.Objects::nonNull) // null 반환된 경우 필터링
                        .collect(Collectors.toList());

                keyword.setRelatedNews(relatedNewsList); // KeywordDTO에 연관 뉴스 리스트 설정
                System.out.println("  > 키워드 '" + keyword.getKeyword_Name() + "'에 " + relatedNewsList.size() + "개의 연관 뉴스 설정 완료.");
            }

            System.out.println("--- KeywordService.getTopKeywordsWithRelatedNews() 종료 (성공) ---");
            return topKeywords;
        } catch (Exception e) {
            System.err.println("--- KeywordService.getTopKeywordsWithRelatedNews() 중 오류 발생 ---");
            System.err.println("  > 오류 메시지: " + e.getMessage());
            e.printStackTrace(); // 스택 트레이스 출력하여 자세한 오류 확인
            System.err.println("--- KeywordService.getTopKeywordsWithRelatedNews() 오류 처리 완료 ---");
            return Collections.emptyList();
        }
    }

    // 기존 keywordData() 메소드는 그대로 주석 처리 상태를 유지합니다.
    // 필요시 주석을 해제하고 위 설명을 참고하여 적절히 수정하여 사용하세요.
    /*
    public List<Map<String, Object>> keywordData() {
        // ... (기존 주석 처리된 코드)
    }
    */
}