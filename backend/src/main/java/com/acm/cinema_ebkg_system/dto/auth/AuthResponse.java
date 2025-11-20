package com.acm.cinema_ebkg_system.dto.auth;

/**
 * Auth Response DTO - Data Transfer Object for authentication responses
 * 
 * Follows Single Responsibility Principle: Handles only authentication responses.
 * Used by all AuthController endpoints for consistent response structure.
 */
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private String refreshToken;
    private UserDto user;

    // Default constructor
    public AuthResponse() {}

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

    // Getters
    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public UserDto getUser() {
        return user;
    }

    // Setters
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    /**
     * User DTO - Represents user data safe for frontend consumption
     * 
     * Security: Excludes password hash and sensitive data.
     * Design: Simple data container. Factory methods are in UserDtoFactory class.
     * Nullable fields are acceptable in DTOs per Spring Boot conventions.
     */
    public static class UserDto {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phoneNumber; // Optional
        private String address; // Optional
        private String state; // Optional
        private String country; // Optional

        // Default constructor
        public UserDto() {}

        // Constructor
        public UserDto(Long id, String email, String firstName, String lastName, String phoneNumber, String address, String state, String country) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.phoneNumber = phoneNumber;
            this.address = address;
            this.state = state;
            this.country = country;
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public String getAddress() {
            return address;
        }

        public String getState() {
            return state;
        }

        public String getCountry() {
            return country;
        }

        // Setters
        public void setId(Long id) {
            this.id = id;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public void setState(String state) {
            this.state = state;
        }

        public void setCountry(String country) {
            this.country = country;
        }
    }
}
