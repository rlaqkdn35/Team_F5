package com.smhrd.stock.entity;

import java.sql.Timestamp;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "t_user_fav")
public class UserFav {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "fav_idx")
	private int fav_idx;
	@Column(name = "user_id")
	private String userId;
	@Column(name = "stock_code")
	private String stockCode;
	@Column(name = "created_at")
	private Timestamp created_at;
}
