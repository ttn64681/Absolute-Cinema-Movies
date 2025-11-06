package com.acm.cinema_ebkg_system.dto.user;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse.UserDto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * User Profile Response DTO - Returns user profile information
 * 
 * Follows best practices:
 * - Returns DTOs instead of entities (prevents exposing sensitive data)
 * - Uses AuthResponse.UserDto for consistency
 * - Includes address information as separate DTO
 * 
 * Note: Payment cards are fetched separately on the payments page
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private UserDto user;  // User info DTO (excludes password)
    private AddressDTO homeAddress;  // Address DTO (null if no home address)
    
    /**
     * Address DTO - Represents address information
     * Separate from entity to avoid exposing internal structure
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        private Long id;
        private String street;
        private String city;
        private String state;
        private String zip;
        private String country;
    }
}
