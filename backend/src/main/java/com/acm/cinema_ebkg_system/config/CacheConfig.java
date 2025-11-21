package com.acm.cinema_ebkg_system.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache Configuration - Caffeine cache w/ TTL & size eviction
 * Pattern: Configuration Class
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Caffeine cache: TTL 10min, max 100 entries (LRU), manual @CacheEvict supported
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("nowPlayingMovies", "upcomingMovies", "searchNowPlayingMovies", "searchUpcomingMovies");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)  // TTL: 10min
                .maximumSize(100)                        // Max 100 entries (LRU eviction)
                .recordStats());                         // Cache stats
        return cacheManager;
    }
}

