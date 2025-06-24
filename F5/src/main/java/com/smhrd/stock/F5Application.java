package com.smhrd.stock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class F5Application {

	public static void main(String[] args) {
		SpringApplication.run(F5Application.class, args);
	}

}
