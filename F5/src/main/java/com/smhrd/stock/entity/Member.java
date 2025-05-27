package com.smhrd.stock.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;


@Data
@Entity
public class Member {
	
	@Id
	private String id;
}
