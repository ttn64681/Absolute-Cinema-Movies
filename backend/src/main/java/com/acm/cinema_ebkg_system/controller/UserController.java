package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.service.UserService;
import com.acm.cinema_ebkg_system.service.AddressService;
import com.acm.cinema_ebkg_system.dto.user.UserUpdateRequest;
import com.acm.cinema_ebkg_system.dto.user.PasswordChangeRequest;
import com.acm.cinema_ebkg_system.dto.user.UserProfileDTO;
import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.mapper.UserDtoFactory;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController // Bean that creates a RESTful controller class that handles HTTP requests
@RequestMapping("/api")
public class UserController {
    
    // Dependency injection of services for business logic
    private final UserService userService;
    private final AddressService addressService;

    // Constructor injection - Spring automatically provides service instances
    public UserController(UserService userService, AddressService addressService) {
        this.userService = userService;
        this.addressService = addressService;
    }
    
    // GET /api/user/info - Get current user's information (userId from JWT in frontend)
    @GetMapping("/user/info")
    public User getCurrentUserInfo(@RequestParam Long userId) {
        return userService.getUserById(userId);
    }
    
    // GET /api/user/profile - Get user profile (user info + home address + profile image)
    @GetMapping("/user/profile")
    public UserProfileDTO getUserProfile(@RequestParam Long userId) {
        User user = userService.getUserById(userId);
        Optional<Address> homeAddressOpt = addressService.getUserHomeAddress(userId);
        
        // Convert User entity to UserDto using static factory method (excludes sensitive data)
        AuthResponse.UserDto userDto = UserDtoFactory.fromUser(user);
        
        // Convert Address entity to AddressDTO if present
        UserProfileDTO.AddressDTO addressDto = null;
        if (homeAddressOpt.isPresent()) {
            Address homeAddress = homeAddressOpt.get();
            addressDto = new UserProfileDTO.AddressDTO(
                homeAddress.getId(),
                homeAddress.getStreet(),
                homeAddress.getCity(),
                homeAddress.getState(),
                homeAddress.getZip(),
                homeAddress.getCountry()
            );
        }
        
        // Include profile-specific fields (profileImageLink, enrolledForPromotions)
        return new UserProfileDTO(
            userDto, 
            addressDto, 
            user.getProfileImageLink(), 
            user.isEnrolledForPromotions()
        );
    }
    
    // PUT /api/user/info - Update current user's personal information
    @PutMapping("/user/info")
    public User updateCurrentUserInfo(@RequestParam Long userId, @RequestBody UserUpdateRequest userUpdateRequest) {
        return userService.updatePersonalInfo(userId, userUpdateRequest);
    }
    
    // PUT /api/user/change-password - Change current user's password
    @PutMapping("/user/change-password")
    public User changeCurrentUserPassword(@RequestParam Long userId, @RequestBody PasswordChangeRequest passwordChangeRequest) {
        return userService.changePassword(userId, passwordChangeRequest);
    }

    // GET /api/users - Return list of all users (for admin use)
    @GetMapping("/users")
    public List<User> getAllUsers() {
        System.out.println("Getting all users");
        return userService.getAllUsers();
    }

    // GET /api/users/{userId} - Return user by ID
    @GetMapping("/users/{userId}")
    public User getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId);
    }

    // GET /api/users/{userId}/name - Return user's full name by ID
    @GetMapping("/users/{userId}/name")
    public String getUserName(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return user.getFirstName() + " " + user.getLastName();
    }

    // PUT /api/users/{userId}/info - Update a user's personal information
    @PutMapping("/users/{userId}/info")
    public User updateUser(@PathVariable Long userId, @RequestBody UserUpdateRequest userUpdateRequest) {
        return userService.updatePersonalInfo(userId, userUpdateRequest);
    }

    // PUT /api/users/{userId}/forgot-password - Reset a user's forgotten password (Login)
    @PutMapping("/users/{userId}/forgot-password")
    public User resetPassword(@PathVariable Long userId, @RequestBody PasswordChangeRequest passwordChangeRequest) {
        return userService.resetForgottenPassword(userId, passwordChangeRequest);
    }

    // PUT /api/users/{userId}/change-password - Change a user's password (Edit Profile)
    @PutMapping("/users/{userId}/change-password")
    public User changePassword(@PathVariable Long userId, @RequestBody PasswordChangeRequest passwordChangeRequest) {
        return userService.changePassword(userId, passwordChangeRequest);
    }
    
}
