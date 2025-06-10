package com.smhrd.stock.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smhrd.stock.entity.User;


@Repository
public interface UserRepository extends JpaRepository<User, String> {
   // @Id 필드인 userId를 기준으로 findById가 이미 제공되지만,
   // 명확성을 위해 findByUserId를 추가할 수도 있습니다.
   // Optional<User> findByUserId(String userId); // 이미 JpaRepository에서 제공하는 findById(String id)와 동일

    Optional<User> findByUserIdAndPw(String userId, String pw); // 암호화된 비밀번호와 비교하는 용도로 사용하지 마세요.
    
    Optional<User> findByEmailAndPw(String email, String pw);

    Optional<User> findByEmail(String email);

    Optional<User> findByUserIdAndEmail(String userId, String email);

    // JpaRepository<User, String> 상속으로 findById(String id)는 자동 생성됩니다.
    // 만약 `findById`가 아닌 `findByUserId`를 명시적으로 사용하고 싶다면 추가하세요.
    Optional<User> findByUserId(String userId);
   
   
}