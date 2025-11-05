package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.LoginRequest;
import com.acm.cinema_ebkg_system.mapper.UserDtoFactory;
import com.acm.cinema_ebkg_system.model.Admin;
import com.acm.cinema_ebkg_system.service.AdminService;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Controller - Handles all admin-related API endpoints
 * 
 * This controller manages admin authentication, user management, and admin-specific operations.
 * It integrates with AdminService for business logic and JwtUtil for token management.
 * 
 * Available Endpoints:
 * - POST /api/admin/login - Authenticate admin user
 * - POST /api/admin/create - Create new admin user
 * - GET /api/admin/all - Get all admins
 * - GET /api/admin/{email} - Get admin by email
 * - PUT /api/admin/status - Update admin status
 * - PUT /api/admin/role - Update admin role
 * - DELETE /api/admin/{email} - Delete admin
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
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminController {

    // ========== DEPENDENCY INJECTION ==========
    
    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    // ========== UTILITY ENDPOINTS ==========
    
    /**
     * Check if an email belongs to an admin user
     * Used by frontend to determine if user has admin access
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkAdminAccess(@RequestParam String email) {
        try {
            boolean isAdmin = adminService.adminExists(email);
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("isAdmin", isAdmin);
            }});
        } catch (Exception e) {
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("isAdmin", false);
            }});
        }
    }

    // ========== AUTHENTICATION ENDPOINTS ==========
    
    /**
     * Admin login endpoint - authenticates admin users
     * 
     * Process Flow:
     * 1. Authenticate admin credentials (email/password)
     * 2. Check if admin is active
     * 3. Generate JWT tokens for admin session
     * 4. Return success response with tokens and admin data
     * 
     * @param request LoginRequest containing email and password
     * @return ResponseEntity<AuthResponse> with success status, tokens, and admin info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> adminLogin(@RequestBody LoginRequest request) {
        try {
            // Step 1: Authenticate admin credentials
            Admin admin = adminService.authenticateAdmin(request.getEmail(), request.getPassword());
            
            // Step 2: Generate new JWT tokens for authenticated admin session with ADMIN role
            String token = jwtUtil.generateToken(admin.getEmail(), admin.getId(), "ADMIN", request.isRememberMe());
            String refreshToken = jwtUtil.generateRefreshToken(admin.getEmail(), admin.getId(), "ADMIN", request.isRememberMe());

            // Step 3: Create admin DTO using factory method (Factory Method pattern)
            AuthResponse.UserDto adminDto = UserDtoFactory.fromAdmin(admin);

            // Step 4: Return success response with tokens and admin data
            AuthResponse response = new AuthResponse(true, "Admin login successful", token, refreshToken, adminDto);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Handle authentication failures
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ========== ADMIN MANAGEMENT ENDPOINTS ==========
    
    /**
     * Create a new admin user
     * 
     * @param request CreateAdminRequest containing admin data
     * @return ResponseEntity<AuthResponse> with creation status
     */
    @PostMapping("/create")
    public ResponseEntity<AuthResponse> createAdmin(@RequestBody CreateAdminRequest request) {
        try {
            adminService.createAdmin(
                request.getEmail(),
                request.getPassword(),
                request.getProfileImageLink()
            );
            
            AuthResponse response = new AuthResponse(true, "Admin created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, "Failed to create admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all admins
     * 
     * @return ResponseEntity<List<Admin>> with all admin users
     */
    @GetMapping("/all")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        try {
            List<Admin> admins = adminService.getAllAdmins();
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get admin by email
     * 
     * @param email Admin's email address
     * @return ResponseEntity<Admin> with admin data
     */
    @GetMapping("/{email}")
    public ResponseEntity<Admin> getAdminByEmail(@PathVariable String email) {
        try {
            Admin admin = adminService.getAdminByEmail(email);
            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update admin profile image
     * 
     * @param request UpdateProfileImageRequest containing email and new profile image URL
     * @return ResponseEntity<AuthResponse> with update status
     */
    @PutMapping("/profile-image")
    public ResponseEntity<AuthResponse> updateAdminProfileImage(@RequestBody UpdateProfileImageRequest request) {
        try {
            adminService.updateAdminProfileImage(request.getEmail(), request.getProfileImageLink());
            AuthResponse response = new AuthResponse(true, "Admin profile image updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, "Failed to update admin profile image: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete admin
     * 
     * @param email Admin's email address
     * @return ResponseEntity<AuthResponse> with deletion status
     */
    @DeleteMapping("/{email}")
    public ResponseEntity<AuthResponse> deleteAdmin(@PathVariable String email) {
        try {
            adminService.deleteAdmin(email);
            AuthResponse response = new AuthResponse(true, "Admin deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, "Failed to delete admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ========== REQUEST DTOs ==========
    
    public static class CreateAdminRequest {
        private String email;
        private String password;
        private String profileImageLink;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getProfileImageLink() { return profileImageLink; }
        public void setProfileImageLink(String profileImageLink) { this.profileImageLink = profileImageLink; }
    }

    public static class UpdateProfileImageRequest {
        private String email;
        private String profileImageLink;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getProfileImageLink() { return profileImageLink; }
        public void setProfileImageLink(String profileImageLink) { this.profileImageLink = profileImageLink; }
    }
}
