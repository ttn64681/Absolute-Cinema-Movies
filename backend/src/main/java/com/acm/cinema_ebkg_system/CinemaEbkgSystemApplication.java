package com.acm.cinema_ebkg_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Main Spring Boot Application
 * Caching: @EnableCaching enables Spring Cache (configured in CacheConfig.java)
 */
@SpringBootApplication
@EnableCaching
public class CinemaEbkgSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(CinemaEbkgSystemApplication.class, args);
	}

}
