package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.LoginRequest;
import com.acm.cinema_ebkg_system.dto.auth.RegisterRequest;
import com.acm.cinema_ebkg_system.dto.auth.ResetPasswordRequest;
import com.acm.cinema_ebkg_system.mapper.UserDtoFactory;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.model.Admin;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.enums.UserStatus;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

/**
 * Authentication Service - Business logic layer for authentication operations
 * 
 * This service handles all authentication-related business logic including registration,
 * login, token management, and email verification. It follows the Single Responsibility
 * Principle by separating authentication concerns from the controller layer.
 * 
 * Key Responsibilities:
 * - User registration with address and payment card creation
 * - User authentication and account status validation
 * - JWT token generation and refresh
 * - Email verification and password reset flows
 * 
 * Design Patterns:
 * - Service Layer Pattern: Encapsulates business logic separate from controllers
 * - Dependency Injection: Uses Spring's DI for service dependencies
 * - Transaction Management: Uses @Transactional for atomic operations
 * 
 * @author ACM Cinema Team
 * @version 1.0
 */
@Service
@Slf4j
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private PaymentCardService paymentCardService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Register a new user in the system
     * 
     * Process Flow:
     * 1. Create User entity from request data
     * 2. Register user (validates email uniqueness, hashes password)
     * 3. Create home address if provided
     * 4. Create payment cards and billing addresses if provided
     * 5. Generate verification token and send email
     * 6. Send promotion enrollment email if user opted in
     * 
     * @param request RegisterRequest containing user registration data
     * @return AuthResponse with success status and verification token
     * @throws RuntimeException if registration fails (e.g., email already exists)
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
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
        log.debug("Registration successful - User: {}, account_status: {} (default)", savedUser.getEmail(), savedUser.getAccountStatus());
        
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
            for (com.acm.cinema_ebkg_system.dto.payment.PaymentCardRequestDTO cardDto : request.getPaymentCards()) {
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
        
        // Step 6: If user enrolled for promotions, send welcome email (non-blocking; SMTP may be unreachable on free tier)
        if (savedUser.isEnrolledForPromotions()) {
            try {
                emailService.sendPromotionEnrollmentEmail(savedUser.getEmail(), savedUser.getFirstName());
            } catch (Exception e) {
                log.warn("Could not send promotion enrollment email: {}", e.getMessage());
            }
        }

        // Step 7: Return success (user can verify email via resend if verification email failed)
        return new AuthResponse(true, "Registration successful! Please check your email to verify your account. If you do not receive it, use Resend verification from the login page.");
    }

    /**
     * Authenticate an existing user and provide access tokens
     * 
     * Process Flow:
     * 1. Authenticate user credentials (validates email exists and password matches)
     * 2. Check account status (must be active - email verified)
     * 3. Generate JWT access and refresh tokens
     * 4. Create user DTO
     * 
     * @param request LoginRequest containing email, password, and rememberMe flag
     * @return AuthResponse with success status, tokens, and user data
     * @throws RuntimeException if authentication fails or account is not active
     */
    public AuthResponse login(LoginRequest request) {
        // Step 1: Authenticate user credentials (validates email exists and password matches)
        User user = userService.authenticateUser(request.getEmail(), request.getPassword());
        
        // Step 2: Check account_status (email verified)
        log.debug("Login attempt - User: {}, account_status: {}", user.getEmail(), user.getAccountStatus());
        if (user.getAccountStatus() != UserStatus.active) {
            String message = user.getAccountStatus() == UserStatus.suspended 
                ? "Your account has been suspended. Please contact support." 
                : "Please verify your email before logging in. Check your inbox for the verification link.";
            return new AuthResponse(false, message);
        }

        // Step 3: Generate new JWT tokens for authenticated session
        // Use different expiration times based on "Remember Me" selection
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), request.isRememberMe());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId(), request.isRememberMe());

        // Step 4: Create user DTO using factory method (Factory Method pattern)
        AuthResponse.UserDto userDto = UserDtoFactory.fromUser(user);

        // Step 5: Return success response with tokens and user data
        return new AuthResponse(true, "Login successful", token, refreshToken, userDto);
    }

    /**
     * Refresh an expired access token using a valid refresh token
     * 
     * Process Flow:
     * 1. Validate the provided refresh token and extract user information
     * 2. Check role from token (USER or ADMIN)
     * 3. Get user/admin information from database based on role
     * 4. Generate a new access token with same role
     * 5. Create user/admin DTO
     * 
     * @param refreshToken The refresh token to validate and use for generating new access token
     * @return AuthResponse with new access token and user/admin data
     * @throws RuntimeException if refresh token is invalid or user/admin not found
     */
    public AuthResponse refreshToken(String refreshToken) {
        // Step 1: Validate refresh token and extract user information
        String email = jwtUtil.getUsernameFromToken(refreshToken);
        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        Boolean rememberMe = jwtUtil.getRememberMeFromToken(refreshToken);
        String role = jwtUtil.getRoleFromToken(refreshToken);

        // Step 2: Check role and get user/admin information from database
        if ("ADMIN".equals(role)) {
            // Handle admin token refresh
            Admin admin = adminService.getAdminById(userId);
            if (admin == null) {
                return new AuthResponse(false, "Admin not found");
            }

            // Step 3: Generate new access token with ADMIN role
            String newToken = jwtUtil.generateToken(email, userId, "ADMIN", rememberMe != null ? rememberMe : false);

            // Step 4: Create admin DTO using factory method
            AuthResponse.UserDto adminDto = UserDtoFactory.fromAdmin(admin);

            // Step 5: Return new access token with admin information (refresh token stays the same)
            return new AuthResponse(true, "Token refreshed successfully", newToken, refreshToken, adminDto);
        } else {
            // Handle regular user token refresh
        User user = userService.getUserById(userId);
        if (user == null) {
            return new AuthResponse(false, "User not found");
        }

        // Step 3: Generate new access token with same user information and remember me preference
        String newToken = jwtUtil.generateToken(email, userId, rememberMe != null ? rememberMe : false);

        // Step 4: Create user DTO using factory method
        AuthResponse.UserDto userDto = UserDtoFactory.fromUser(user);

        // Step 5: Return new access token with user information (refresh token stays the same)
        return new AuthResponse(true, "Token refreshed successfully", newToken, refreshToken, userDto);
        }
    }

    /**
     * Verify email using verification token
     * 
     * Process Flow:
     * 1. Verify the email token and activate user
     * 2. Generate JWT tokens for verified user
     * 3. Create user DTO
     * 
     * @param token Verification token from email
     * @return AuthResponse with success status and tokens
     * @throws RuntimeException if token is invalid or expired
     */
    public AuthResponse verifyEmail(String token) {
        // Step 1: Verify the email token and activate user
        User user = userService.verifyEmail(token);
        
        // Step 2: Generate JWT tokens for verified user (default to remember me for email verification)
        String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getId(), true);
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId(), true);
        
        // Step 3: Create user DTO using factory method
        AuthResponse.UserDto userDto = UserDtoFactory.fromUser(user);
        
        // Step 4: Return success response with tokens
        return new AuthResponse(true, "Email verified successfully! You can now use all features.", jwtToken, refreshToken, userDto);
    }

    /**
     * Resend verification email
     * 
     * @param email User's email address
     * @return AuthResponse with success status
     * @throws RuntimeException if user not found or already verified
     */
    public AuthResponse resendVerification(String email) {
        userService.resendVerificationEmail(email);
        return new AuthResponse(true, "Verification email has been resent. Please check your inbox.");
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
     * @return AuthResponse with success status
     * @throws RuntimeException if user not found
     */
    public AuthResponse forgotPassword(String email) {
        userService.initiatePasswordReset(email);
        return new AuthResponse(true, "Password reset email has been sent. Please check your inbox.");
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
     * @return AuthResponse with success status
     * @throws RuntimeException if token is invalid or expired
     */
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        userService.resetPasswordWithToken(request.getToken(), request.getNewPassword());
        return new AuthResponse(true, "Password has been reset successfully. You can now log in with your new password.");
    }

    /**
     * Check if email is already taken
     * 
     * @param email Email address to check
     * @return AuthResponse with availability status
     */
    public AuthResponse checkEmail(String email) {
        boolean emailExists = userService.emailExists(email);
        if (emailExists) {
            return new AuthResponse(false, "Email is already taken. Please use a different email address.");
        } else {
            return new AuthResponse(true, "Email is available.");
        }
    }
}

