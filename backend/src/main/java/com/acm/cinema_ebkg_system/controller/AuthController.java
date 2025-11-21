package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.LoginRequest;
import com.acm.cinema_ebkg_system.dto.auth.RegisterRequest;
import com.acm.cinema_ebkg_system.dto.auth.ResetPasswordRequest;
import com.acm.cinema_ebkg_system.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller - Handles all authentication-related API endpoints
 * 
 * This controller is a lightweight REST controller that delegates all business logic
 * to the AuthService layer, following the Single Responsibility Principle and promoting
 * separation of concerns.
 * 
 * Available Endpoints:
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login - Authenticate existing user
 * - POST /api/auth/refresh - Refresh access token
 * - POST /api/auth/logout - Logout user (client-side token removal)
 * - POST /api/auth/verify-email - Verify email using token
 * - POST /api/auth/resend-verification - Resend verification email
 * - POST /api/auth/forgot-password - Initiate password reset
 * - POST /api/auth/reset-password - Reset password using token
 * - POST /api/auth/check-email - Check if email is available
 * 
 * Security Features:
 * - CORS enabled for frontend integration
 * - JWT token-based authentication
 * - Password hashing via BCrypt (handled in service layer)
 * - Input validation and error handling
 * 
 * Design Patterns:
 * - Service Layer Pattern: Delegates business logic to AuthService
 * - Dependency Injection: Uses Spring's DI for service dependencies
 * 
 * @author ACM Cinema Team
 * @version 2.0
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    // ========== DEPENDENCY INJECTION ==========
    
    @Autowired
    private AuthService authService;  // Service layer for authentication business logic

    // ========== API ENDPOINTS ==========
    
    /**
     * Register a new user in the system
     * 
     * Delegates all business logic to AuthService for registration, address creation,
     * payment card creation, and email sending.
     * 
     * @param request RegisterRequest containing user registration data
     * @return ResponseEntity<AuthResponse> with success status and verification token
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Authenticate an existing user and provide access tokens
     * 
     * Delegates authentication, account status validation, and token generation to AuthService.
     * 
     * @param request LoginRequest containing email, password, and rememberMe flag
     * @return ResponseEntity<AuthResponse> with success status, tokens, and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            
            // If login failed due to account status, return 403 Forbidden
            if (!response.isSuccess() && (response.getMessage().contains("suspended") || 
                                          response.getMessage().contains("verify your email"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Refresh an expired access token using a valid refresh token
     * 
     * Delegates token validation and refresh logic to AuthService.
     * 
     * @param refreshToken The refresh token to validate and use for generating new access token
     * @return ResponseEntity<AuthResponse> with new access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        try {
            AuthResponse response = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, "Invalid refresh token");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Verify email using verification token
     * 
     * Delegates email verification and token generation to AuthService.
     * 
     * @param token Verification token from email
     * @return ResponseEntity<AuthResponse> with success status and tokens
     */
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestParam String token) {
        try {
            AuthResponse response = authService.verifyEmail(token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Resend verification email
     * 
     * Delegates to AuthService for resending verification email.
     * 
     * @param email User's email address
     * @return ResponseEntity<AuthResponse> with success status
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<AuthResponse> resendVerification(@RequestParam String email) {
        try {
            AuthResponse response = authService.resendVerification(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Initiate forgot password process
     * 
     * Delegates to AuthService for password reset initiation.
     * 
     * @param email User's email address
     * @return ResponseEntity<AuthResponse> with success status
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestParam String email) {
        try {
            AuthResponse response = authService.forgotPassword(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Reset password using reset token
     * 
     * Delegates to AuthService for password reset with token.
     * 
     * @param request ResetPasswordRequest containing token and new password
     * @return ResponseEntity<AuthResponse> with success status
     */
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Check if email is already taken
     * 
     * Delegates to AuthService for email availability check.
     * 
     * @param email Email address to check
     * @return ResponseEntity<AuthResponse> with availability status
     */
    @PostMapping("/check-email")
    public ResponseEntity<AuthResponse> checkEmail(@RequestParam String email) {
        try {
            AuthResponse response = authService.checkEmail(email);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, "Error checking email availability.");
            return ResponseEntity.badRequest().body(response);
        }
    }


    /**
     * Logout endpoint - primarily for client-side token cleanup
     * 
     * Note: Since we use stateless JWT tokens, logout is handled client-side by removing tokens.
     * This endpoint provides a standard logout response for consistency.
     * 
     * @return ResponseEntity<AuthResponse> confirming successful logout
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        AuthResponse response = new AuthResponse(true, "Logout successful");
        return ResponseEntity.ok(response);
    }
}
