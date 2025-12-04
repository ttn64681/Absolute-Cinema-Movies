package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.LoginRequest;
import com.acm.cinema_ebkg_system.mapper.UserDtoFactory;
import com.acm.cinema_ebkg_system.model.Admin;
import com.acm.cinema_ebkg_system.repository.AdminRepository;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Admin Service - Business logic layer for Admin operations
 * 
 * This service handles all admin-related business logic including authentication,
 * user management, and admin-specific operations. It integrates with AdminRepository
 * for data persistence and uses PasswordEncoder for secure password handling.
 * 
 * Key Features:
 * - Admin authentication and authorization
 * - Password hashing and verification
 * - Admin user management
 * - Role-based access control
 * 
 * @author ACM Cinema Team
 * @version 1.0
 */
@Service
public class AdminService {

    // ========== DEPENDENCY INJECTION ==========
    
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ========== AUTHENTICATION METHODS ==========
    
    /**
     * Authenticate an admin user with email and password
     * 
     * @param email Admin's email address
     * @param password Admin's plain text password
     * @return Admin authenticated admin user
     * @throws RuntimeException if authentication fails
     */
    public Admin authenticateAdmin(String email, String password) {
        // Find admin by email
        Admin admin = adminRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Admin not found with email: " + email));
        
        // Verify password
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        return admin;
    }

    /**
     * Create a new admin user
     * 
     * @param email Admin's email address
     * @param password Admin's plain text password
     * @param profileImageLink Admin's profile image URL (optional)
     * @return Admin created admin user
     */
    public Admin createAdmin(String email, String password, String profileImageLink) {
        // Check if admin already exists
        if (adminRepository.existsByEmail(email)) {
            throw new RuntimeException("Admin already exists with email: " + email);
        }
        
        // Hash password
        String hashedPassword = passwordEncoder.encode(password);
        
        // Create new admin
        Admin admin = new Admin(email, hashedPassword, profileImageLink);
        return adminRepository.save(admin);
    }

    /**
     * Get admin by email
     * 
     * @param email Admin's email address
     * @return Admin admin user
     * @throws RuntimeException if admin not found
     */
    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Admin not found with email: " + email));
    }

    /**
     * Get admin by ID
     * 
     * @param id Admin's ID
     * @return Admin admin user
     * @throws RuntimeException if admin not found
     */
    public Admin getAdminById(Long id) {
        return adminRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Admin not found with ID: " + id));
    }

    /**
     * Get all admins
     * 
     * @return List<Admin> all admin users
     */
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }


    /**
     * Update admin profile image
     * 
     * @param email Admin's email address
     * @param profileImageLink New profile image URL
     * @return Admin updated admin user
     */
    public Admin updateAdminProfileImage(String email, String profileImageLink) {
        Admin admin = getAdminByEmail(email);
        admin.setProfileImageLink(profileImageLink);
        return adminRepository.save(admin);
    }

    /**
     * Delete admin by email
     * 
     * @param email Admin's email address
     */
    public void deleteAdmin(String email) {
        Admin admin = getAdminByEmail(email);
        adminRepository.delete(admin);
    }

    /**
     * Check if admin exists
     * 
     * @param email Admin's email address
     * @return boolean true if admin exists, false otherwise
     */
    public boolean adminExists(String email) {
        return adminRepository.existsByEmail(email);
    }

    /**
     * Update admin password
     * 
     * @param email Admin's email address
     * @param newPassword New plain text password
     * @return Admin updated admin user
     */
    public Admin updatePassword(String email, String newPassword) {
        Admin admin = getAdminByEmail(email);
        String hashedPassword = passwordEncoder.encode(newPassword);
        admin.setPassword(hashedPassword);
        return adminRepository.save(admin);
    }

    /**
     * Authenticate admin and generate login response with tokens
     * 
     * Process Flow:
     * 1. Authenticate admin credentials
     * 2. Generate JWT tokens with ADMIN role
     * 3. Create admin DTO
     * 
     * @param request LoginRequest containing email, password, and rememberMe flag
     * @return AuthResponse with success status, tokens, and admin data
     * @throws RuntimeException if authentication fails
     */
    public AuthResponse adminLogin(LoginRequest request) {
        // Step 1: Authenticate admin credentials
        Admin admin = authenticateAdmin(request.getEmail(), request.getPassword());
        
        // Step 2: Generate new JWT tokens for authenticated admin session with ADMIN role
        String token = jwtUtil.generateToken(admin.getEmail(), admin.getId(), "ADMIN", request.isRememberMe());
        String refreshToken = jwtUtil.generateRefreshToken(admin.getEmail(), admin.getId(), "ADMIN", request.isRememberMe());

        // Step 3: Create admin DTO using factory method (Factory Method pattern)
        AuthResponse.UserDto adminDto = UserDtoFactory.fromAdmin(admin);

        // Step 4: Return success response w/ tokens, admin data, & set role for frontend routing
        AuthResponse response = new AuthResponse(true, "Admin login successful", token, refreshToken, adminDto);
        response.setRole("ADMIN");
        return response;
    }
}
