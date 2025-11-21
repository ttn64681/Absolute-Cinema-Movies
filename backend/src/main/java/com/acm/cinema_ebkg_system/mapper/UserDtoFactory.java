package com.acm.cinema_ebkg_system.mapper;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse.UserDto;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.model.Admin;

/**
 * UserDto Factory - Creates UserDto instances from various entity types
 * 
 * Uses Static Factory Methods pattern (Joshua Bloch's pattern from Effective Java).
 * This is NOT the Factory Method Pattern (Gang of Four) - we're using static utility methods
 * rather than inheritance/polymorphism.
 * 
 * Benefits:
 * - Centralized conversion logic (single place to update)
 * - Clear, descriptive method names (fromUser, fromAdmin)
 * - Encapsulates entity-to-DTO conversion logic
 * - Better separation of concerns than putting methods in DTO class
 * 
 * Usage:
 * - UserDtoFactory.fromUser(user)
 * - UserDtoFactory.fromAdmin(admin)
 * 
 * Note: Address information is provided separately via UserProfileDTO when needed.
 */
public class UserDtoFactory {
    
    /**
     * Static factory method: Creates UserDto from User entity (basic info only)
     * 
     * @param user User entity to convert
     * @return UserDto with basic user information (no address)
     */
    public static UserDto fromUser(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhoneNumber()
        );
    }
    
    /**
     * Static factory method: Creates UserDto from Admin entity
     * Admin doesn't have firstName/lastName, so uses "Admin" as defaults
     * 
     * @param admin Admin entity to convert
     * @return UserDto representing admin user
     */
    public static UserDto fromAdmin(Admin admin) {
        return new UserDto(
            admin.getId(),
            admin.getEmail(),
            "Admin",
            "Admin",
            null
        );
    }
}

