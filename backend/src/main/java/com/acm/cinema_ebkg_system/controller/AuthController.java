package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.LoginRequest;
import com.acm.cinema_ebkg_system.dto.auth.RegisterRequest;
import com.acm.cinema_ebkg_system.dto.auth.ResetPasswordRequest;
import com.acm.cinema_ebkg_system.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller - Handles all authentication-related API endpoints
 * 
 * This controller manages user registration, login, token refresh, and logout operations.
 * It integrates with the UserService for business logic and JwtUtil for token management.
 * 
 * Available Endpoints:
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login - Authenticate existing user
 * - POST /api/auth/refresh - Refresh access token
 * - POST /api/auth/logout - Logout user (client-side token removal)
 * 
 * Security Features:
 * - CORS enabled for frontend integration
 * - JWT token-based authentication
 * - Password hashing via BCrypt
 * - Input validation and error handling
 * 
 * @author ACM Cinema Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ========== API ENDPOINTS ==========
    
    /**
     * Register a new user in the system
     * 
     * Process Flow:
     * 1. Create User entity from request data
     * 2. Call UserService to register user (validates email uniqueness, hashes password)
     * 3. Generate JWT access and refresh tokens
     * 4. Return success response with tokens and user data
     * 
     * @param request RegisterRequest containing user registration data
     * @return ResponseEntity<AuthResponse> with success status, tokens, and user info
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
     * Process Flow:
     * 1. Validate user credentials (email/password) via UserService
     * 2. Generate new JWT access and refresh tokens
     * 3. Return success response with tokens and user data
     * 
     * @param request LoginRequest containing email and password
     * @return ResponseEntity<AuthResponse> with success status, tokens, and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Refresh an expired access token using a valid refresh token
     * 
     * Process Flow:
     * 1. Validate the provided refresh token
     * 2. Extract user information from the refresh token
     * 3. Generate a new access token
     * 4. Return the new access token (refresh token remains the same)
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
     * Process Flow:
     * 1. Find user by email address
     * 2. Generate password reset token
     * 3. Send password reset email with reset link
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
     * Process Flow:
     * 1. Validate reset token and check expiration
     * 2. Find user by reset token
     * 3. Update password with new password
     * 4. Clear reset token
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
     * Process Flow:
     * 1. Check if user exists with given email
     * 2. Return availability status
     * 
     * @param email Email address to check
     * @return ResponseEntity<AuthResponse> with availability status
     */
    @PostMapping("/check-email")
    public ResponseEntity<AuthResponse> checkEmail(@RequestParam String email) {
        try {
            AuthResponse response = authService.checkEmail(email);
            return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
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
