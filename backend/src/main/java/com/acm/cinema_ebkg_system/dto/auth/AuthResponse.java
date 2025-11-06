package com.acm.cinema_ebkg_system.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Auth Response DTO - Data Transfer Object for authentication responses
 * 
 * Follows Single Responsibility Principle: Handles only authentication responses.
 * Used by all AuthController endpoints for consistent response structure.
 */
@Data
@NoArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private String refreshToken;
    private UserDto user;

    // Convenience constructors for common use cases
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, String token, String refreshToken, UserDto user) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    /**
     * User DTO - Represents user data safe for frontend consumption
     * 
     * Security: Excludes password hash and sensitive data.
     * Design: Simple data container. Factory methods are in UserDtoFactory class.
     * Nullable fields are acceptable in DTOs per Spring Boot conventions.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phoneNumber; // Optional
        private String address; // Optional
        private String state; // Optional
        private String country; // Optional
    }
}
