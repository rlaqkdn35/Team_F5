package com.smhrd.stock.entity;

import com.smhrd.stock.dto.KeywordDTO; // KeywordDTO 임포트
import jakarta.persistence.*; // 필요한 JPA 어노테이션 임포트 (모두 임포트하거나 필요한 것만 임포트)
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor; // 필요하다면 추가

@Entity
@Table(name = "t_keyword") // 실제 DB 테이블 이름과 매칭
@Getter
@Setter
@NoArgsConstructor // Lombok의 NoArgsConstructor를 사용하거나 기본 생성자를 직접 추가
// 여기에 @SqlResultSetMapping과 @NamedNativeQuery를 추가합니다.
@SqlResultSetMapping(
    name = "KeywordDTOMapping",
    classes = @ConstructorResult(
        targetClass = KeywordDTO.class,
        columns = {
            @ColumnResult(name = "keyword_Name", type = String.class),
            @ColumnResult(name = "total_count", type = Long.class),
            @ColumnResult(name = "numArticlesMentionedIn", type = Long.class)
        }
    )
)
@NamedNativeQuery(
    name = "Keyword.findTopKeywordsStats", // 쿼리 이름 (KeywordRepository에서 참조할 이름)
    query = """
        SELECT
            k.keyword_name AS keyword_Name,
            SUM(k.mentioned_cnt) AS total_count,
            COUNT(DISTINCT k.news_idx) AS numArticlesMentionedIn
        FROM
            t_keyword k
        GROUP BY
            k.keyword_name
        ORDER BY
            total_count DESC
        LIMIT 18
        """,
    resultSetMapping = "KeywordDTOMapping" // 위에서 정의한 매핑 이름
)
public class Keyword {

    @Id // 기본 키 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가 전략 (DB에 따라 다를 수 있음)
    @Column(name = "keyword_idx")
    private Integer keywordIdx; // 실제 엔티티의 필드명과 DB 컬럼명

    @Column(name = "keyword_name")
    private String keywordName;

    @Column(name = "mentioned_cnt")
    private Integer mentionedCnt; // 언급 횟수 (int 또는 long)

    @Column(name = "news_idx")
    private Long newsIdx; // 외래 키 (news_idx는 Long일 가능성)

    // Lombok을 사용하지 않는다면 기본 생성자 필요
    // public Keyword() {}

    // 다른 필드 및 Getter/Setter (Lombok @Getter, @Setter로 대체 가능)
}