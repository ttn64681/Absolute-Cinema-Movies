package com.acm.cinema_ebkg_system.dto.user;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse.UserDto;

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
public class UserProfileDTO {
    private UserDto user;  // User info DTO (excludes password)
    private AddressDTO homeAddress;  // Address DTO (null if no home address)

    // Default constructor
    public UserProfileDTO() {}

    // Constructor
    public UserProfileDTO(UserDto user, AddressDTO homeAddress) {
        this.user = user;
        this.homeAddress = homeAddress;
    }

    // Getters
    public UserDto getUser() {
        return user;
    }

    public AddressDTO getHomeAddress() {
        return homeAddress;
    }

    // Setters
    public void setUser(UserDto user) {
        this.user = user;
    }

    public void setHomeAddress(AddressDTO homeAddress) {
        this.homeAddress = homeAddress;
    }
    
    /**
     * Address DTO - Represents address information
     * Separate from entity to avoid exposing internal structure
     */
    public static class AddressDTO {
        private Long id;
        private String street;
        private String city;
        private String state;
        private String zip;
        private String country;

        // Default constructor
        public AddressDTO() {}

        // Constructor
        public AddressDTO(Long id, String street, String city, String state, String zip, String country) {
            this.id = id;
            this.street = street;
            this.city = city;
            this.state = state;
            this.zip = zip;
            this.country = country;
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getStreet() {
            return street;
        }

        public String getCity() {
            return city;
        }

        public String getState() {
            return state;
        }

        public String getZip() {
            return zip;
        }

        public String getCountry() {
            return country;
        }

        // Setters
        public void setId(Long id) {
            this.id = id;
        }

        public void setStreet(String street) {
            this.street = street;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public void setState(String state) {
            this.state = state;
        }

        public void setZip(String zip) {
            this.zip = zip;
        }

        public void setCountry(String country) {
            this.country = country;
        }
    }
}
