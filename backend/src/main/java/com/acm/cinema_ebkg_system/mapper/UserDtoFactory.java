package com.acm.cinema_ebkg_system.mapper;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse.UserDto;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.model.Admin;

/**
 * UserDto Factory - Creates UserDto instances from various entity types
 * 
 * Follows Factory Method pattern with centralized factory class.
 * This provides better separation of concerns compared to static methods
 * within the DTO class itself.
 * 
 * Usage:
 * - UserDtoFactory.fromUser(user)
 * - UserDtoFactory.fromUserWithAddress(user, address)
 * - UserDtoFactory.fromAdmin(admin)
 */
public class UserDtoFactory {
    
    /**
     * Factory method: Creates UserDto from User entity (basic info only)
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
            user.getPhoneNumber(),
            null, null, null
        );
    }
    
    /**
     * Factory method: Creates UserDto with address information
     * Used when address data is available and needed
     * 
     * @param user User entity to convert
     * @param address Address entity (can be null)
     * @return UserDto with user and address information
     */
    public static UserDto fromUserWithAddress(User user, Address address) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhoneNumber(),
            address != null ? address.getStreet() : null,
            address != null ? address.getState() : null,
            address != null ? address.getCountry() : null
        );
    }
    
    /**
     * Factory method: Creates UserDto from Admin entity
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
            null,
            null, null, null
        );
    }
}

