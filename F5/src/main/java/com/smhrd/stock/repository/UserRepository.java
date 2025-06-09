package com.smhrd.stock.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.stock.entity.User;


public interface UserRepository extends JpaRepository<User, String> {

    
    Optional<User> findByEmailAndPw(String email, String pw);

    Optional<User> findByEmail(String email);

    Optional<User> findByUserIdAndEmail(String userId, String email);

    Optional<User> findByUserId(String userId);

   
	
}