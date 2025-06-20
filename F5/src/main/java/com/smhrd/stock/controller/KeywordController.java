package com.smhrd.stock.controller;

import java.util.List;
// import java.util.Collections; // 더 이상 직접 사용하지 않으므로 제거 가능
// import java.util.Map;         // 더 이상 직접 사용하지 않으므로 제거 가능

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // @RequestParam 임포트
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.KeywordDTO; // KeywordDTO 임포트
import com.smhrd.stock.service.KeywordService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/keyword") 
public class KeywordController {

    @Autowired
    private KeywordService keywordService;

    /**
     * 상위 키워드 목록과 각 키워드에 연관된 뉴스 목록을 JSON 형태로 반환합니다.
     * 클라이언트로부터 최소 언급 횟수와 키워드당 뉴스 개수 파라미터를 받습니다.
     *
     * @param minMentionedCount 키워드가 뉴스에서 언급된 최소 횟수 (기본값: 3)
     * @param limitNewsPerKeyword 각 키워드당 가져올 연관 뉴스의 최대 개수 (기본값: 5)
     * @return KeywordDTO 객체의 리스트. 각 KeywordDTO는 키워드 정보와 연관 뉴스 리스트를 포함합니다.
     */
    @GetMapping("/top-with-news") // API 목적을 명확히 하는 새로운 경로
    public List<KeywordDTO> getTopKeywordsWithRelatedNews(
            @RequestParam(defaultValue = "3") int minMentionedCount,
            @RequestParam(defaultValue = "5") int limitNewsPerKeyword
    ) {
        System.out.println("API Call: /keyword/top-with-news");
        System.out.println("  minMentionedCount: " + minMentionedCount);
        System.out.println("  limitNewsPerKeyword: " + limitNewsPerKeyword);

        // 서비스 계층에서 예외 처리를 이미 하고 빈 리스트를 반환하므로,
        // 여기서는 try-catch를 필수로 둘 필요는 없습니다.
        // 다만, 더 세밀한 컨트롤러 레벨의 예외 처리가 필요하면 추가할 수 있습니다.
        List<KeywordDTO> result = keywordService.getTopKeywordsWithRelatedNews(minMentionedCount, limitNewsPerKeyword);

        System.out.println("Returning " + result.size() + " top keywords with related news.");
        return result;
    }

    // 기존 keywordData() 메서드는 더 이상 새로운 로직에 맞지 않으므로 주석 처리하거나 삭제합니다.
    // 만약 여전히 Map<String, Object> 형태의 응답이 필요하다면,
    // getTopKeywordsWithRelatedNews() 결과를 Map 형태로 다시 변환하는 로직이 필요합니다.
    /*
    @GetMapping("/keywordData")
    public List<Map<String, Object>> keywordData() {
        // 이 메서드는 더 이상 KeywordDTO를 직접 사용하지 않고 Map을 반환하도록 되어 있습니다.
        // 새로운 서비스 메서드 (getTopKeywordsWithRelatedNews)의 반환 타입과 일치하지 않습니다.
        // 만약 이 엔드포인트를 유지하려면, 서비스 메서드를 호출한 후 결과를 Map<String, Object>
        // 형태로 변환하는 추가적인 로직이 필요합니다.
        List<Map<String, Object>> list = keywordService.keywordData(); // 이 메서드도 서비스에서 삭제되었거나 변경되었습니다.
        return list;
    }
    */
}