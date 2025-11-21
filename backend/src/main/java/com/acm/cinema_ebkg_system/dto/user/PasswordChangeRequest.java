package com.acm.cinema_ebkg_system.dto.user;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Password Change Request DTO - For changing user passwords
 * 
 * Used for both:
 * - Changing password (requires currentPassword)
 * - Resetting forgotten password (only requires newPassword)
 */
@Data
@NoArgsConstructor
public class PasswordChangeRequest {
    private String currentPassword;  // Required for password change, null for password reset
    private String newPassword;       // Required for both change and reset
}

