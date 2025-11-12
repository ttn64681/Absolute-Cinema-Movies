package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.LoginRequest;
import com.acm.cinema_ebkg_system.dto.auth.RegisterRequest;
import com.acm.cinema_ebkg_system.dto.auth.ResetPasswordRequest;
import com.acm.cinema_ebkg_system.mapper.UserDtoFactory;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.enums.UserStatus;
import com.acm.cinema_ebkg_system.service.UserService;
import com.acm.cinema_ebkg_system.service.AddressService;
import com.acm.cinema_ebkg_system.service.PaymentCardService;
import com.acm.cinema_ebkg_system.service.EmailService;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
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

    // ========== DEPENDENCY INJECTION ==========
    
    @Autowired
    private UserService userService;  // Service layer for user business logic
    
    @Autowired
    private AddressService addressService;  // Service for address operations
    
    @Autowired
    private PaymentCardService paymentCardService;  // Service for payment card operations

    @Autowired
    private JwtUtil jwtUtil;  // Utility for JWT token operations
    
    @Autowired
    private EmailService emailService;  // Service for sending emails

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
            // Step 1: Create User entity from request data
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());  // Will be hashed in UserService
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhoneNumber(request.getPhoneNumber());
            
            // Set enrollment preference
            if (request.getEnrolledForPromotions() != null) {
                user.setEnrolledForPromotions(request.getEnrolledForPromotions());
            }

            // Step 2: Register user (validates email uniqueness, hashes password, saves to DB)
            User savedUser = userService.registerUser(user);
            
            // Log account_status after registration (defaults to inactive)
            System.out.println("Registration successful - User: " + savedUser.getEmail() + ", account_status: " + savedUser.getAccountStatus() + " (default)");
            
            // Step 3: Create home address if provided
            if (request.getHomeAddress() != null && !request.getHomeAddress().trim().isEmpty()) {
                Address homeAddr = new Address();
                homeAddr.setUser(savedUser);
                homeAddr.setAddressType(AddressType.home);
                homeAddr.setStreet(request.getHomeAddress());
                homeAddr.setCity(request.getHomeCity() != null ? request.getHomeCity() : "");
                homeAddr.setState(request.getHomeState() != null ? request.getHomeState() : "");
                homeAddr.setZip(request.getHomeZip() != null ? request.getHomeZip() : "");
                homeAddr.setCountry(request.getHomeCountry() != null ? request.getHomeCountry() : "US");
                addressService.createAddress(homeAddr);
            }
            
            // Step 4: Create payment cards and billing addresses if provided
            if (request.getPaymentCards() != null && !request.getPaymentCards().isEmpty()) {
                for (com.acm.cinema_ebkg_system.dto.payment.PaymentCardDTO cardDto : request.getPaymentCards()) {
                    // Create billing address for this payment card
                    Address billingAddress = new Address();
                    billingAddress.setUser(savedUser);
                    billingAddress.setAddressType(AddressType.billing);
                    billingAddress.setStreet(cardDto.getBillingStreet());
                    billingAddress.setCity(cardDto.getBillingCity());
                    billingAddress.setState(cardDto.getBillingState());
                    billingAddress.setZip(cardDto.getBillingZip());
                    billingAddress.setCountry(cardDto.getBillingCountry() != null ? cardDto.getBillingCountry() : "US");
                    
                    Address savedAddress = addressService.createAddress(billingAddress);
                    
                    // Create payment card
                    PaymentCard paymentCard = new PaymentCard();
                    paymentCard.setUser(savedUser);
                    paymentCard.setAddress(savedAddress);
                    paymentCard.setCardNumber(cardDto.getCardNumber()); // Should be encrypted in production
                    paymentCard.setCardholderName(cardDto.getCardholderName());
                    paymentCard.setPaymentCardType(cardDto.getCardType());
                    paymentCard.setExpirationDate(cardDto.getExpirationDate());
                    
                    // Set is_default flag
                    if (cardDto.getIsDefault() != null) {
                        paymentCard.setIsDefault(cardDto.getIsDefault());
                    } else {
                        paymentCard.setIsDefault(false);
                    }
                    
                    paymentCardService.createPaymentCard(paymentCard);
                }
            }
            
            // Step 5: Generate verification token and send email
            String verificationToken = userService.generateVerificationToken(savedUser);
            
            // Step 6: If user enrolled for promotions, send welcome email
            // Note: We send this regardless of email verification status because they explicitly opted in
            if (savedUser.isEnrolledForPromotions()) {
                emailService.sendPromotionEnrollmentEmail(savedUser.getEmail(), savedUser.getFirstName());
            }

            // Step 7: Return success response with verification token for testing
            AuthResponse response = new AuthResponse(true, "Registration successful! Verification token: " + verificationToken);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Handle any errors (email already exists, validation failures, etc.)
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
            // Step 1: Authenticate user credentials (validates email exists and password matches)
            User user = userService.authenticateUser(request.getEmail(), request.getPassword());
            
            // Step 2: Check account_status (email verified)
            System.out.println("Login attempt - User: " + user.getEmail() + ", account_status: " + user.getAccountStatus());
            if (user.getAccountStatus() != UserStatus.active) {
                String message = user.getAccountStatus() == UserStatus.suspended 
                    ? "Your account has been suspended. Please contact support." 
                    : "Please verify your email before logging in. Check your inbox for the verification link.";
                AuthResponse response = new AuthResponse(false, message);
                return ResponseEntity.status(403).body(response);
            }

            // Step 3: Generate new JWT tokens for authenticated session
            // Use different expiration times based on "Remember Me" selection
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), request.isRememberMe());
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId(), request.isRememberMe());

            // Step 4: Create user DTO using factory method (Factory Method pattern)
            AuthResponse.UserDto userDto = UserDtoFactory.fromUser(user);

            // Step 5: Return success response with tokens and user data
            AuthResponse response = new AuthResponse(true, "Login successful", token, refreshToken, userDto);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Handle authentication failures (user not found, invalid password, etc.)
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
            // Step 1: Validate refresh token and extract user information
            String email = jwtUtil.getUsernameFromToken(refreshToken);
            Long userId = jwtUtil.getUserIdFromToken(refreshToken);
            Boolean rememberMe = jwtUtil.getRememberMeFromToken(refreshToken);

            // Step 2: Get user information from database
            User user = userService.getUserById(userId);
            if (user == null) {
                AuthResponse response = new AuthResponse(false, "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            // Step 3: Generate new access token with same user information and remember me preference
            String newToken = jwtUtil.generateToken(email, userId, rememberMe != null ? rememberMe : false);

            // Step 4: Create user DTO using factory method
            AuthResponse.UserDto userDto = UserDtoFactory.fromUser(user);

            // Step 5: Return new access token with user information (refresh token stays the same)
            AuthResponse response = new AuthResponse(true, "Token refreshed successfully", newToken, refreshToken, userDto);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Handle invalid or expired refresh token
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
            // Step 1: Verify the email token and activate user
            User user = userService.verifyEmail(token);
            
            // Step 2: Generate JWT tokens for verified user (default to remember me for email verification)
            String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getId(), true);
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId(), true);
            
            // Step 3: Create user DTO using factory method
            AuthResponse.UserDto userDto = UserDtoFactory.fromUser(user);
            
            // Step 4: Return success response with tokens
            AuthResponse response = new AuthResponse(true, "Email verified successfully! You can now use all features.", jwtToken, refreshToken, userDto);
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
            userService.resendVerificationEmail(email);
            AuthResponse response = new AuthResponse(true, "Verification email has been resent. Please check your inbox.");
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
            userService.initiatePasswordReset(email);
            AuthResponse response = new AuthResponse(true, "Password reset email has been sent. Please check your inbox.");
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
            userService.resetPasswordWithToken(request.getToken(), request.getNewPassword());
            AuthResponse response = new AuthResponse(true, "Password has been reset successfully. You can now log in with your new password.");
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
            boolean emailExists = userService.emailExists(email);
            if (emailExists) {
                AuthResponse response = new AuthResponse(false, "Email is already taken. Please use a different email address.");
                return ResponseEntity.badRequest().body(response);
            } else {
                AuthResponse response = new AuthResponse(true, "Email is available.");
                return ResponseEntity.ok(response);
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
