package com.acm.cinema_ebkg_system.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Login Request DTO - Sent FROM frontend TO backend
 * 
 * Endpoint: POST /api/auth/login
 * Controller: AuthController.login(@RequestBody LoginRequest)
 * 
 * Contains user credentials and remember-me preference
 * Response: AuthResponse w/ JWT tokens and user info
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
    private boolean rememberMe;
}
