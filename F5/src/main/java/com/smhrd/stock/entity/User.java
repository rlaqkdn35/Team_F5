package com.smhrd.stock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "user_id", length = 50)
    private String userId;  // 문자열 아이디

    @Column(nullable = true)
    private String pw;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now().withNano(0);

    @Column(nullable = false)
    @Builder.Default
    private String userRole = "ROLE_USER";

    private String provider;      
    private String providerId;
}
