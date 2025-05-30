package com.smhrd.stock.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT u.nickname FROM User u WHERE u.user_id = :userId")
    Optional<String> findNicknameByUserId(@Param("userId") String userId);
}
