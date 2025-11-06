package com.acm.cinema_ebkg_system.dto.user;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Update Request DTO - For updating user profile information
 * 
 * Follows Single Responsibility Principle: Only handles profile updates,
 * not password changes (see PasswordChangeRequest).
 * 
 * All fields are optional - only provided fields will be updated.
 */
@Data
@NoArgsConstructor
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean enrolledForPromotions;
    private String profileImageLink;
    
    // Home address fields (stored in address table)
    private String homeStreet;
    private String homeCity;
    private String homeState;
    private String homeZip;
    private String homeCountry;
}

