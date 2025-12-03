package com.acm.cinema_ebkg_system.config;

import com.acm.cinema_ebkg_system.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

/**
 * Security Configuration
 * 
 * CORS is configured here instead of a separate CorsConfig class because
 * Spring Security's filter chain processes requests before Spring MVC,
 * ensuring CORS headers are set before authentication checks.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * CORS Configuration for Spring Security
     * 
     * Note: CORS must be configured in SecurityConfig (not WebMvcConfigurer) because:
     * - Spring Security's filter chain runs BEFORE Spring MVC
     * - Pre-flight OPTIONS requests need CORS headers before authentication
     * - This ensures CORS is handled at the security layer
     * 
     * Allows requests from frontend origins: localhost:3000, localhost:3001
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS using the configuration source defined above
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Disable CSRF protection because we are using JWT tokens
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Add JWT authentication filter BEFORE UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - no authentication required
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/create").permitAll() // this is for testing...
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                
                // Movie browsing endpoints - PUBLIC (anyone can browse movies)
                .requestMatchers("/api/movies/**").permitAll()
                
                // Seat endpoints - GET, reserve, and release are public (anonymous users can reserve/release)
                .requestMatchers("/api/seats/show/**").permitAll() // Public: view seat availability
                .requestMatchers("/api/seats/check-availability").permitAll() // Public: check availability
                .requestMatchers("/api/seats/reserve").permitAll() // Public: anyone can reserve seats (temporary hold)
                .requestMatchers("/api/seats/release", "/api/seats/release-by-selection").permitAll() // Public: anyone can release seats (cancel reservation)
                
                // Admin endpoints - require ADMIN role
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                
                // User management endpoints - GET all users requires ADMIN role
                // Exact path match must come before wildcard patterns
                .requestMatchers("/api/users").hasAuthority("ROLE_ADMIN") // GET all users (admin only - exact path)
                
                // Individual user endpoints - require USER or ADMIN role (users can access their own, admins can access any)
                // Use pattern that requires at least one path segment (won't match /api/users exactly)
                .requestMatchers("/api/users/*").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN") // /api/users/{userId}
                .requestMatchers("/api/users/*/*").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN") // /api/users/{userId}/info
                .requestMatchers("/api/users/*/*/*").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN") // /api/users/{userId}/change-password
                
                // User profile/payment/booking endpoints - require USER or ADMIN role (admins can access all APIs)
                .requestMatchers("/api/user/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers("/api/payment-card/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers("/api/payment/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers("/api/bookings/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                
                // All other API endpoints require authentication
                // .requestMatchers("/api/**").authenticated()
                
                .anyRequest().permitAll()
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())); // Updated for H2 console (for database management)

        return http.build();
    }
}
