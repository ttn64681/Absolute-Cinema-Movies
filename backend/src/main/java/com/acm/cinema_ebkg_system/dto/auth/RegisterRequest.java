package com.acm.cinema_ebkg_system.dto.auth;

import java.util.List;
import com.acm.cinema_ebkg_system.dto.payment.PaymentCardDTO;

/**
 * Registration Request DTO
 * 
 * Design Decision: Uses PaymentCardDTO instead of nested class
 * to follow DRY principle and maintain single source of truth
 * for payment card structure.
 */
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean enrolledForPromotions;
    
    // Home address fields (optional)
    private String homeAddress;
    private String homeCity;
    private String homeState;
    private String homeZip;
    private String homeCountry;
    
    // Use PaymentCardDTO instead of nested class (DRY principle)
    // Note: userId will be set by backend after user creation
    private List<PaymentCardDTO> paymentCards; // Up to 3 payment cards

    // Default constructor
    public RegisterRequest() {}

    // Constructor
    public RegisterRequest(String email, String password, String firstName, String lastName, String phoneNumber, Boolean enrolledForPromotions, String homeAddress, String homeCity, String homeState, String homeZip, String homeCountry, List<PaymentCardDTO> paymentCards) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.enrolledForPromotions = enrolledForPromotions;
        this.homeAddress = homeAddress;
        this.homeCity = homeCity;
        this.homeState = homeState;
        this.homeZip = homeZip;
        this.homeCountry = homeCountry;
        this.paymentCards = paymentCards;
    }

    // Getters
    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

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

    public String getHomeAddress() {
        return homeAddress;
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

    public List<PaymentCardDTO> getPaymentCards() {
        return paymentCards;
    }

    // Setters
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

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

    public void setHomeAddress(String homeAddress) {
        this.homeAddress = homeAddress;
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

    public void setPaymentCards(List<PaymentCardDTO> paymentCards) {
        this.paymentCards = paymentCards;
    }
}
