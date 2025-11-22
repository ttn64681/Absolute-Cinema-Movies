package com.acm.cinema_ebkg_system.dto.user;

/**
 * Password Change Request DTO - For changing user passwords
 * 
 * Used for both:
 * - Changing password (requires currentPassword)
 * - Resetting forgotten password (only requires newPassword)
 */
public class PasswordChangeRequest {
    private String currentPassword;  // Required for password change, null for password reset
    private String newPassword;       // Required for both change and reset

    // Default constructor
    public PasswordChangeRequest() {}

    // Constructor
    public PasswordChangeRequest(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    // Getters
    public String getCurrentPassword() {
        return currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    // Setters
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

