package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.enums.UserStatus;
import com.acm.cinema_ebkg_system.repository.UserRepository;
import com.acm.cinema_ebkg_system.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

/**
 * User Service - Business logic layer for user operations
 * 
 * This service handles all user-related business logic including registration,
 * authentication, and user data management. It ensures proper password hashing
 * and validation before database operations.
 * 
 * Key Responsibilities:
 * - User registration with email uniqueness validation
 * - Password hashing using BCrypt
 * - User authentication (email/password validation)
 * - User data retrieval operations
 * 
 * Security Features:
 * - BCrypt password hashing (salt + hash)
 * - Email uniqueness validation
 * - Secure password comparison (timing attack resistant)
 * 
 * @author ACM Cinema Team
 * @version 1.0
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private AddressService addressService;  // Service for address operations
    
    @Autowired
    private EmailService emailService;  // Data access layer for user operations

    // ========== SECURITY COMPONENTS ==========
    
    /**
     * BCrypt password encoder for secure password hashing
     * - Uses salt for each password hash
     * - Configurable work factor (default: 10)
     * - Timing attack resistant
     */
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ========== USER REGISTRATION ==========
    
    /**
     * Register a new user in the system
     * 
     * Process Flow:
     * 1. Validate email uniqueness (prevent duplicate accounts)
     * 2. Hash the plain text password using BCrypt
     * 3. Save user to database with hashed password
     * 
     * Security Features:
     * - Email uniqueness validation
     * - BCrypt password hashing with salt
     * - Exception handling for duplicate emails
     * 
     * @param user User object containing registration data (password in plain text)
     * @return User Saved user object with hashed password
     * @throws RuntimeException if email already exists
     */
    @Transactional // Ensures user creation and any related operations are atomic
    public User registerUser(User user) {
        // Step 1: Normalize email to lowercase for consistency
        String normalizedEmail = user.getEmail().toLowerCase().trim();
        user.setEmail(normalizedEmail);
        
        // Step 2: Check if user already exists (prevent duplicate accounts)
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email " + user.getEmail() + " already exists");
        }

        // Step 3: Hash the plain text password using BCrypt (includes salt)
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        // Step 4: Save the user to database (timestamps set automatically via @PrePersist)
        return userRepository.save(user);
    }

    // ========== USER AUTHENTICATION ==========
    
    /**
     * Authenticate a user by validating email and password
     * 
     * Process Flow:
     * 1. Find user by email address
     * 2. Verify user exists
     * 3. Compare provided password with stored hash using BCrypt
     * 
     * Security Features:
     * - Timing attack resistant password comparison
     * - BCrypt secure password verification
     * - Clear error messages for debugging
     * 
     * @param email User's email address
     * @param password Plain text password to verify
     * @return User Authenticated user object
     * @throws RuntimeException if user not found or password invalid
     */
    public User authenticateUser(String email, String password) {
        // Step 1: Normalize email to lowercase for consistency
        String normalizedEmail = email.toLowerCase().trim();
        
        // Step 2: Find user by email address
        Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
        
        // Step 3: Verify user exists
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        
        // Step 4: Compare provided password with stored BCrypt hash
        // BCrypt.matches() is timing attack resistant
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    // ========== USER DATA RETRIEVAL ==========
    
    /**
     * Retrieve user by email address
     * 
     * @param email User's email address
     * @return User User object
     * @throws RuntimeException if user not found
     */
    public User getUserByEmail(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        return userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Retrieve user by unique ID
     * 
     * @param id User's unique identifier
     * @return User User object
     * @throws RuntimeException if user not found
     */
    public User getUserById(Long id) {
        return userRepository.findByIdWithAddresses(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ========== ADMIN ONLY OPERATIONS ==========

    /**
     * Retrieve all users from the database
     * 
     * This method returns a list of all users in the system.
     * Typically used for administrative purposes.
     * 
     * @return List<User> List of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Suspend a user account
     * 
     * This method sets a user's account_status to suspended.
     * Suspended users cannot log in to the system.
     * 
     * @param userId User ID to suspend
     * @return User Updated user object with suspended status
     * @throws RuntimeException if user not found
     */
    @Transactional
    public User suspendUser(Long userId) {
        User user = getUserById(userId);
        System.out.println("Suspending user - User: " + user.getEmail() + ", current account_status: " + user.getAccountStatus());
        user.setAccountStatus(UserStatus.suspended);
        User suspendedUser = userRepository.save(user);
        System.out.println("User suspended - User: " + suspendedUser.getEmail() + ", new account_status: " + suspendedUser.getAccountStatus());
        return suspendedUser;
    }

    /**
     * Unsuspend a user account (reactivate)
     * 
     * This method sets a user's account_status back to active.
     * The user can log in again after being unsuspended.
     * 
     * @param userId User ID to unsuspend
     * @return User Updated user object with active status
     * @throws RuntimeException if user not found
     */
    @Transactional
    public User unsuspendUser(Long userId) {
        User user = getUserById(userId);
        System.out.println("Unsuspending user - User: " + user.getEmail() + ", current account_status: " + user.getAccountStatus());
        user.setAccountStatus(UserStatus.active);
        User unsuspendedUser = userRepository.save(user);
        System.out.println("User unsuspended - User: " + unsuspendedUser.getEmail() + ", new account_status: " + unsuspendedUser.getAccountStatus());
        return unsuspendedUser;
    }

    // ========== USER DATA UPDATE ==========

    /**
     * Update user's personal information
     * 
     * Follows Single Responsibility Principle: Only handles profile updates.
     * Password changes use separate method (changePassword).
     * 
     * @param userId User ID to update
     * @param userUpdateRequest UserUpdateRequest DTO containing updated information
     * @return User Updated user object
     * @throws RuntimeException if user not found
     */
    @Transactional // Ensures all profile updates (user + address) succeed or fail together
    public User updatePersonalInfo(Long userId, com.acm.cinema_ebkg_system.dto.user.UserUpdateRequest userUpdateRequest) {
        User user = getUserById(userId);
        
        // Update fields if provided
        if (userUpdateRequest.getFirstName() != null) {
            user.setFirstName(userUpdateRequest.getFirstName());
        }
        if (userUpdateRequest.getLastName() != null) {
            user.setLastName(userUpdateRequest.getLastName());
        }
        if (userUpdateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(userUpdateRequest.getPhoneNumber());
        }
        // Handle profile picture
        if (userUpdateRequest.getProfileImageLink() != null) {
            user.setProfileImageLink(userUpdateRequest.getProfileImageLink());
        }
        
        // Handle enrolled_for_promotions preference
        boolean wasEnrolledForPromotions = user.isEnrolledForPromotions();
        if (userUpdateRequest.getEnrolledForPromotions() != null) {
            user.setEnrolledForPromotions(userUpdateRequest.getEnrolledForPromotions());
        }
        
        // Handle home address in the address table
        if (userUpdateRequest.getHomeStreet() != null || userUpdateRequest.getHomeCity() != null || 
            userUpdateRequest.getHomeState() != null || userUpdateRequest.getHomeZip() != null) {
            
            // Check if user already has a home address
            List<Address> homeAddresses = addressRepository.findByUserIdAndAddressType(userId, AddressType.home);
            Address homeAddress;
            
            if (!homeAddresses.isEmpty()) {
                // Update existing home address
                homeAddress = homeAddresses.get(0);
                
                if (userUpdateRequest.getHomeStreet() != null) {
                    homeAddress.setStreet(userUpdateRequest.getHomeStreet());
                }
                if (userUpdateRequest.getHomeCity() != null) {
                    homeAddress.setCity(userUpdateRequest.getHomeCity());
                }
                if (userUpdateRequest.getHomeState() != null) {
                    homeAddress.setState(userUpdateRequest.getHomeState());
                }
                if (userUpdateRequest.getHomeZip() != null) {
                    homeAddress.setZip(userUpdateRequest.getHomeZip());
                }
                if (userUpdateRequest.getHomeCountry() != null) {
                    homeAddress.setCountry(userUpdateRequest.getHomeCountry());
                } else {
                    homeAddress.setCountry("US"); // default
                }
            } else {
                // Create new home address
                homeAddress = new Address();
                homeAddress.setUser(user);
                homeAddress.setAddressType(AddressType.home);
                
                homeAddress.setStreet(userUpdateRequest.getHomeStreet() != null ? userUpdateRequest.getHomeStreet() : "");
                homeAddress.setCity(userUpdateRequest.getHomeCity() != null ? userUpdateRequest.getHomeCity() : "");
                homeAddress.setState(userUpdateRequest.getHomeState() != null ? userUpdateRequest.getHomeState() : "");
                homeAddress.setZip(userUpdateRequest.getHomeZip() != null ? userUpdateRequest.getHomeZip() : "");
                homeAddress.setCountry(userUpdateRequest.getHomeCountry() != null ? userUpdateRequest.getHomeCountry() : "US");
            }
            
            addressRepository.save(homeAddress);
        }

        // Send confirmation email for profile update
        emailService.sendEditProfileConfirmationEmail(user.getEmail(), user.getFirstName());
        
        // Send promotion enrollment email if user just opted in
        if (userUpdateRequest.getEnrolledForPromotions() != null && 
            !wasEnrolledForPromotions && 
            userUpdateRequest.getEnrolledForPromotions()) {
            emailService.sendPromotionEnrollmentEmail(user.getEmail(), user.getFirstName());
        }

        // Save user to database
        return userRepository.save(user);
    }

    /**
     * Reset a user's password
     * 
     * This method resets a user's password when they have forgotten it and need it to log in.
     * 
     * @param userId User ID to update
     * @param passwordChangeRequest PasswordChangeRequest DTO containing new password
     * @return User Updated user object
     * @throws RuntimeException if user not found
     */

    public User resetForgottenPassword(Long userId, com.acm.cinema_ebkg_system.dto.user.PasswordChangeRequest passwordChangeRequest) {
        // Identify the registered user
        User user = getUserById(userId);

        // Get the new password from the DTO
        String newPassword = passwordChangeRequest.getNewPassword();

        // Hash the plain text password using BCrypt
        String hashedPassword = passwordEncoder.encode(newPassword);

        // Update the password
        user.setPassword(hashedPassword);

        System.out.println("New password: " + newPassword);
        System.out.println("New hashed password: " + hashedPassword);

        // Save the user to database
        User savedUser = userRepository.save(user);

        System.out.println("Saved hashed password: " + savedUser.getPassword());
        System.out.println("Passwords match: " + passwordEncoder.matches(newPassword, savedUser.getPassword()));
        return savedUser;
    }

    /**
     * Update user's password
     * 
     * This method changes a user's password when they request to reset it.
     * 
     * @param userId User ID to update
     * @param passwordChangeRequest PasswordChangeRequest DTO containing current and new password
     * @return User Updated user object
     * @throws RuntimeException if user not found or current password incorrect
     */

    public User changePassword(Long userId, com.acm.cinema_ebkg_system.dto.user.PasswordChangeRequest passwordChangeRequest) {
        // Identify the logged-in user
        User user = getUserById(userId);

        // Get the current password and new password input from the DTO
        String currentPassword = passwordChangeRequest.getCurrentPassword();
        String newPassword = passwordChangeRequest.getNewPassword();

        // Validate that the current password is correct
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            System.out.println("Incorrect password!");
            throw new RuntimeException("Incorrect password!");

        // If correct, encrypt the new password and save it in the database
        } else {

            // Hash the new password using BCrypt
            String hashedPassword = passwordEncoder.encode(newPassword);

            // Update the password
            user.setPassword(hashedPassword);

            System.out.println("New password: " + newPassword);
            System.out.println("New hashed password: " + hashedPassword);

            // Save the user to database
            User savedUser = userRepository.save(user);

            System.out.println("Saved hashed password: " + savedUser.getPassword());
            System.out.println("Passwords match: " + passwordEncoder.matches(newPassword, savedUser.getPassword()));

            // Send confirmation email
            emailService.sendChangePasswordConfirmationEmail(user.getEmail(), user.getFirstName());

            return savedUser;
        }
    }

    // ========== PASSWORD RESET ==========
    
    /**
     * Initiate password reset process for a user
     * 
     * Process Flow:
     * 1. Find user by email address
     * 2. Generate password reset token
     * 3. Set token expiration (1 hour)
     * 4. Send password reset email with reset link
     * 
     * @param email User's email address
     * @throws RuntimeException if user not found
     */
    public void initiatePasswordReset(String email) {
        // Find user by email
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Generate password reset token
        String resetToken = UUID.randomUUID().toString();
        
        // Set token and expiration (1 hour from now)
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusHours(1));
        
        // Save user with reset token
        userRepository.save(user);
        
        // Send password reset email
        emailService.sendPasswordResetEmail(email, resetToken);
        
        System.out.println("Password reset token generated for user: " + email);
    }

    /**
     * Reset password using reset token
     * 
     * Process Flow:
     * 1. Find user by reset token
     * 2. Validate token expiration
     * 3. Hash new password
     * 4. Update password and clear reset token
     * 
     * @param token Password reset token
     * @param newPassword New password in plain text
     * @throws RuntimeException if token is invalid or expired
     */
    public void resetPasswordWithToken(String token, String newPassword) {
        // Find user by reset token
        User user = userRepository.findByPasswordResetToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        
        // Check if token has expired
        if (user.getPasswordResetTokenExpiresAt() == null || 
            user.getPasswordResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired. Please request a new password reset.");
        }
        
        // Hash the new password
        String hashedPassword = passwordEncoder.encode(newPassword);
        
        // Update password and clear reset token
        user.setPassword(hashedPassword);
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        
        // Save user
        userRepository.save(user);
        
        System.out.println("Password reset successfully for user: " + user.getEmail());
    }

    /**
     * Check if email already exists in the system
     * 
     * @param email Email address to check
     * @return boolean true if email exists, false otherwise
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // ========== EMAIL VERIFICATION ==========
    
    /**
     * Generate verification token and send verification email
     * 
     * @param user User to generate token for
     * @return String Generated verification token
     */
    public String generateVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expirationTime = LocalDateTime.now().plusHours(24);
        user.setVerificationToken(token);
        user.setVerificationTokenExpiresAt(expirationTime);
        user.setAccountStatus(UserStatus.inactive);
        User savedUser = userRepository.save(user);
        
        // DEBUG: Log token info
        System.out.println("=== VERIFICATION TOKEN GENERATED ===");
        System.out.println("User Email: " + savedUser.getEmail());
        System.out.println("account_status: " + savedUser.getAccountStatus());
        System.out.println("Token Generated: " + token);
        System.out.println("Token in DB: " + savedUser.getVerificationToken());
        System.out.println("Expires At: " + savedUser.getVerificationTokenExpiresAt());
        System.out.println("====================================");
        
        emailService.sendVerificationEmail(user.getEmail(), token);
        return token;
    }

    /**
     * Verify email using token
     * 
     * @param token Verification token
     * @return User Verified user
     */
    public User verifyEmail(String token) {
        // DEBUG: Log verification attempt
        System.out.println("=== VERIFICATION ATTEMPT ===");
        System.out.println("Token Received: " + token);
        System.out.println("Token Length: " + token.length());
        
        Optional<User> userOptional = userRepository.findByVerificationToken(token);
        if (userOptional.isEmpty()) {
            System.out.println("Result: TOKEN NOT FOUND IN DATABASE");
            System.out.println("===========================");
            throw new RuntimeException("Invalid verification token. This link may have already been used. If you already verified your email, please try logging in.");
        }
        
        User user = userOptional.get();
        System.out.println("Result: TOKEN FOUND for user: " + user.getEmail());
        System.out.println("account_status before verification: " + user.getAccountStatus());
        System.out.println("===========================");
        
        if (user.getVerificationTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired. Please request a new verification email.");
        }
        
        user.setAccountStatus(UserStatus.active);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        User verifiedUser = userRepository.save(user);
        System.out.println("Email verified - account_status updated to: " + verifiedUser.getAccountStatus());
        return verifiedUser;
    }

    /**
     * Resend verification email
     * 
     * @param email User's email address
     * @return String New verification token
     */
    public String resendVerificationEmail(String email) {
        User user = getUserByEmail(email);
        System.out.println("Resending verification email - User: " + user.getEmail() + ", account_status: " + user.getAccountStatus());
        if (user.getAccountStatus() == UserStatus.active) {
            throw new RuntimeException("User is already verified");
        }
        return generateVerificationToken(user);
    }

    /**
     * Get user profile with home address
     * 
     * Combines user information and home address into a UserProfileDTO.
     * 
     * @param userId User ID to get profile for
     * @return UserProfileDTO containing user info and home address (if available)
     * @throws RuntimeException if user not found
     */
    public com.acm.cinema_ebkg_system.dto.user.UserProfileDTO getUserProfile(Long userId) {
        User user = getUserById(userId);
        Optional<Address> homeAddressOpt = addressService.getUserHomeAddress(userId);
        
        // Convert User entity to UserDto using factory method (excludes sensitive data)
        com.acm.cinema_ebkg_system.dto.auth.AuthResponse.UserDto userDto = 
            com.acm.cinema_ebkg_system.mapper.UserDtoFactory.fromUser(user);
        
        // Convert Address entity to AddressDTO if present
        com.acm.cinema_ebkg_system.dto.user.UserProfileDTO.AddressDTO addressDto = null;
        if (homeAddressOpt.isPresent()) {
            Address homeAddress = homeAddressOpt.get();
            addressDto = new com.acm.cinema_ebkg_system.dto.user.UserProfileDTO.AddressDTO(
                homeAddress.getId(),
                homeAddress.getStreet(),
                homeAddress.getCity(),
                homeAddress.getState(),
                homeAddress.getZip(),
                homeAddress.getCountry()
            );
        }
        
        return new com.acm.cinema_ebkg_system.dto.user.UserProfileDTO(userDto, addressDto, null, null);
    }

}
