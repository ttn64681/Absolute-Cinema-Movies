package com.acm.cinema_ebkg_system.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Reset Password Request DTO
 * 
 * This DTO contains the data required to reset a user's password using a reset token.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    private String token;
    private String newPassword;
}

