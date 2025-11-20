package com.acm.cinema_ebkg_system.dto.payment;

import com.acm.cinema_ebkg_system.enums.PaymentCardType;

/**
 * Payment Card DTO for frontend requests
 */
public class PaymentCardDTO {
    private Long userId;
    private PaymentCardType cardType;
    private String cardNumber;
    private String expirationDate;
    private String cardholderName;
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZip;
    private String billingCountry;
    private Boolean isDefault;

    // Default constructor
    public PaymentCardDTO() {}

    // Constructor
    public PaymentCardDTO(Long userId, PaymentCardType cardType, String cardNumber, String expirationDate, String cardholderName, String billingStreet, String billingCity, String billingState, String billingZip, String billingCountry, Boolean isDefault) {
        this.userId = userId;
        this.cardType = cardType;
        this.cardNumber = cardNumber;
        this.expirationDate = expirationDate;
        this.cardholderName = cardholderName;
        this.billingStreet = billingStreet;
        this.billingCity = billingCity;
        this.billingState = billingState;
        this.billingZip = billingZip;
        this.billingCountry = billingCountry;
        this.isDefault = isDefault;
    }

    // Getters
    public Long getUserId() {
        return userId;
    }

    public PaymentCardType getCardType() {
        return cardType;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public String getCardholderName() {
        return cardholderName;
    }

    public String getBillingStreet() {
        return billingStreet;
    }

    public String getBillingCity() {
        return billingCity;
    }

    public String getBillingState() {
        return billingState;
    }

    public String getBillingZip() {
        return billingZip;
    }

    public String getBillingCountry() {
        return billingCountry;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    // Setters
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setCardType(PaymentCardType cardType) {
        this.cardType = cardType;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public void setCardholderName(String cardholderName) {
        this.cardholderName = cardholderName;
    }

    public void setBillingStreet(String billingStreet) {
        this.billingStreet = billingStreet;
    }

    public void setBillingCity(String billingCity) {
        this.billingCity = billingCity;
    }

    public void setBillingState(String billingState) {
        this.billingState = billingState;
    }

    public void setBillingZip(String billingZip) {
        this.billingZip = billingZip;
    }

    public void setBillingCountry(String billingCountry) {
        this.billingCountry = billingCountry;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}



