package com.acm.cinema_ebkg_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * API Controller - Purely for testing if endpoint connections work lol
 */
@RestController 
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private Environment environment;

    @Autowired(required = false)
    private DataSourceProperties dataSourceProperties;

    /**
     * GET /api/env - Returns environment variables
     * 
     * Uses Environment bean to access properties, which is more resilient than
     * direct @Value injection when environment variables might not be available.
     * 
     * @return Map of environment variables
     */
    @GetMapping("/env")
    public Map<String, String> getEnvironmentVariables() {
        Map<String, String> env = new HashMap<>();
        
        // Get database URL from environment or properties
        String dbUrl = environment.getProperty("spring.datasource.url", "NOT SET");
        String dbUsername = environment.getProperty("spring.datasource.username", "NOT SET");
        String dbPassword = environment.getProperty("spring.datasource.password");
        
        // Get JWT properties
        String jwtSecret = environment.getProperty("jwt.secret");
        String jwtAccessExpiration = environment.getProperty("jwt.access-token-expiration", "NOT SET");
        String jwtRefreshExpiration = environment.getProperty("jwt.refresh-token-expiration", "NOT SET");
        
        // Also check system environment variables directly
        String sysDbUrl = System.getenv("DATABASE_URL");
        String sysDbUsername = System.getenv("DATABASE_USERNAME");
        
        env.put("DATABASE_URL (from properties)", dbUrl);
        env.put("DATABASE_URL (from system env)", sysDbUrl != null ? sysDbUrl.substring(0, Math.min(50, sysDbUrl.length())) + "..." : "NOT SET");
        env.put("DATABASE_USERNAME (from properties)", dbUsername);
        env.put("DATABASE_USERNAME (from system env)", sysDbUsername != null ? sysDbUsername : "NOT SET");
        env.put("DATABASE_PASSWORD", dbPassword != null ? "***" : "NOT SET");
        env.put("JWT_SECRET", jwtSecret != null ? "***" : "NOT SET");
        env.put("JWT_ACCESS_TOKEN_EXPIRATION", jwtAccessExpiration);
        env.put("JWT_REFRESH_TOKEN_EXPIRATION", jwtRefreshExpiration);
        
        // Check if DataSourceProperties is available (means Spring Boot could resolve datasource config)
        if (dataSourceProperties != null) {
            env.put("DataSource configured", "YES");
            env.put("DataSource URL length", String.valueOf(dataSourceProperties.getUrl() != null ? dataSourceProperties.getUrl().length() : 0));
        } else {
            env.put("DataSource configured", "NO");
        }

        return env;
    }

    @GetMapping("/hello")
    public String helloWorld() {
        return "Hello from the Spring Boot Backend!";
    }
}