package com.smhrd.stock.repository;


import com.smhrd.stock.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailAndPw(String email, String pw);

    Optional<User> findByEmail(String email);

    Optional<User> findByUserIdAndEmail(String userId, String email);

    Optional<User> findByUserId(String userId);
	

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
>>>>>>> branch 'main' of https://github.com/rlaqkdn35/Team_F5.git
}
