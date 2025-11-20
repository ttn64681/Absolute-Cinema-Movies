package com.acm.cinema_ebkg_system.dto.user;

/**
 * User Update Request DTO - For updating user profile information
 * 
 * Follows Single Responsibility Principle: Only handles profile updates,
 * not password changes (see PasswordChangeRequest).
 * 
 * All fields are optional - only provided fields will be updated.
 */
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

    // Default constructor
    public UserUpdateRequest() {}

    // Getters
    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Boolean getEnrolledForPromotions() {
        return enrolledForPromotions;
    }

    public String getProfileImageLink() {
        return profileImageLink;
    }

    public String getHomeStreet() {
        return homeStreet;
    }

    public String getHomeCity() {
        return homeCity;
    }

    public String getHomeState() {
        return homeState;
    }

    public String getHomeZip() {
        return homeZip;
    }

    public String getHomeCountry() {
        return homeCountry;
    }

    // Setters
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setEnrolledForPromotions(Boolean enrolledForPromotions) {
        this.enrolledForPromotions = enrolledForPromotions;
    }

    public void setProfileImageLink(String profileImageLink) {
        this.profileImageLink = profileImageLink;
    }

    public void setHomeStreet(String homeStreet) {
        this.homeStreet = homeStreet;
    }

    public void setHomeCity(String homeCity) {
        this.homeCity = homeCity;
    }

    public void setHomeState(String homeState) {
        this.homeState = homeState;
    }

    public void setHomeZip(String homeZip) {
        this.homeZip = homeZip;
    }

    public void setHomeCountry(String homeCountry) {
        this.homeCountry = homeCountry;
    }
}

