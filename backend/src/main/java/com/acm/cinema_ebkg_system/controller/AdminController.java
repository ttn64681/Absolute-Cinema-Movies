package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.LoginRequest;
import com.acm.cinema_ebkg_system.model.Admin;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.service.AdminService;
import com.acm.cinema_ebkg_system.service.UserService;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import com.acm.cinema_ebkg_system.mapper.UserDtoFactory;
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
    private UserService userService;

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
     * Delegates authentication, token generation, and DTO creation to AdminService.
     * 
     * @param request LoginRequest containing email, password, and rememberMe flag
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

            // Step 3: Create admin DTO using static factory method
            AuthResponse.UserDto adminDto = UserDtoFactory.fromAdmin(admin);

            // Step 4: Return success response w/ tokens, admin data, & role
            AuthResponse response = new AuthResponse(true, "Admin login successful", token, refreshToken, adminDto);
            response.setRole("ADMIN");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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
    public ResponseEntity<?> getAllAdmins() {
        try {
            List<Admin> admins = adminService.getAllAdmins();
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            System.err.println("Error fetching admins: " + e.getMessage());
            e.printStackTrace();
            AuthResponse response = new AuthResponse(false, "Failed to fetch admins: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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

    // ========== USER MANAGEMENT ENDPOINTS ==========

    /**
     * Suspend a user account
     * 
     * Suspended users cannot log in to the system.
     * 
     * @param userId User ID to suspend
     * @return ResponseEntity<User> with updated user data
     */
    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long userId) {
        try {
            System.out.println("AdminController.suspendUser - userId: " + userId);
            User user = userService.suspendUser(userId);
            System.out.println("AdminController.suspendUser - Success: " + user.getEmail() + ", status: " + user.getAccountStatus());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("AdminController.suspendUser - Error: " + e.getMessage());
            e.printStackTrace();
            AuthResponse response = new AuthResponse(false, "Failed to suspend user: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Unsuspend a user account (reactivate)
     * 
     * Unsuspended users can log in again.
     * 
     * @param userId User ID to unsuspend
     * @return ResponseEntity<User> with updated user data
     */
    @PutMapping("/users/{userId}/unsuspend")
    public ResponseEntity<?> unsuspendUser(@PathVariable Long userId) {
        try {
            System.out.println("AdminController.unsuspendUser - userId: " + userId);
            User user = userService.unsuspendUser(userId);
            System.out.println("AdminController.unsuspendUser - Success: " + user.getEmail() + ", status: " + user.getAccountStatus());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("AdminController.unsuspendUser - Error: " + e.getMessage());
            e.printStackTrace();
            AuthResponse response = new AuthResponse(false, "Failed to unsuspend user: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ========== REQUEST DTOs ==========
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CreateAdminRequest {
        private String email;
        private String password;
        private String profileImageLink;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class UpdateProfileImageRequest {
        private String email;
        private String profileImageLink;
    }
}
