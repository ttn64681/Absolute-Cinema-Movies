package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import com.acm.cinema_ebkg_system.enums.PaymentCardType;

/**
 * Payment Card Entity - Represents user payment cards in the cinema booking system
 * 
 * This entity maps to the 'payment_card' table in the database and contains
 * payment card information with associated billing addresses.
 * 
 * Key Features:
 * - JPA Entity with automatic table creation
 * - Support for multiple payment card types (Visa, Mastercard, Amex, Discover)
 * - One-to-one relationship with billing address
 * - Automatic timestamp management for created_at and updated_at
 * - Default card designation support
 */
@Entity
@Table(name = "payment_card")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PaymentCard {
    // Primary key - auto-generated unique identifier
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign key to user table
    // Many payment cards belong to one user (a user can have up to 3 payment cards)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Foreign key to address table
    // Each payment card has exactly one billing address (1-to-1 relationship)
    @OneToOne(fetch = FetchType.EAGER) // Changed to EAGER to load address with card
    @JoinColumn(name = "address_id", nullable = false)
    @JsonIgnoreProperties({"user"}) // Avoid circular reference with User
    private Address address;
    
    // Expose address_id for frontend use
    @Column(name = "address_id", insertable = false, updatable = false)
    private Long addressId;

    // Encrypted card number
    @Column(name = "card_number", nullable = false, length = 19)
    private String cardNumber;

    // Cardholder name
    @Column(name = "cardholder_name", nullable = false, length = 100)
    private String cardholderName;

    // Payment card type: 'visa', 'mastercard', 'amex', 'discover'
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_card_type", nullable = false)
    private PaymentCardType paymentCardType;


    @Column(name = "is_default")
    private Boolean isDefault = false;

    // Card expiration date in MM/YYYY format
    @Column(name = "expiration_date", nullable = false, length = 7)
    private String expirationDate;

    // Timestamp when record was created
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Timestamp when record was last updated
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // ========== BILLING ADDRESS GETTERS (for JSON serialization) ==========
    
    /**
     * Get billing street address
     * Returns the street address from the associated Address entity
     */
    public String getBillingStreet() {
        return address != null ? address.getStreet() : null;
    }
    
    /**
     * Get billing city
     * Returns the city from the associated Address entity
     */
    public String getBillingCity() {
        return address != null ? address.getCity() : null;
    }
    
    /**
     * Get billing state
     * Returns the state from the associated Address entity
     */
    public String getBillingState() {
        return address != null ? address.getState() : null;
    }
    
    /**
     * Get billing ZIP code
     * Returns the ZIP code from the associated Address entity
     */
    public String getBillingZip() {
        return address != null ? address.getZip() : null;
    }
    
    /**
     * Get billing country
     * Returns the country from the associated Address entity
     */
    public String getBillingCountry() {
        return address != null ? address.getCountry() : null;
    }
    
    // ========== BILLING ADDRESS SETTERS (for frontend updates) ==========
    
    /**
     * Set billing street address
     * Updates the street address in the associated Address entity
     */
    public void setBillingStreet(String street) {
        if (address != null) {
            address.setStreet(street);
        }
    }
    
    /**
     * Set billing city
     * Updates the city in the associated Address entity
     */
    public void setBillingCity(String city) {
        if (address != null) {
            address.setCity(city);
        }
    }
    
    /**
     * Set billing state
     * Updates the state in the associated Address entity
     */
    public void setBillingState(String state) {
        if (address != null) {
            address.setState(state);
        }
    }
    
    /**
     * Set billing ZIP code
     * Updates the ZIP code in the associated Address entity
     */
    public void setBillingZip(String zip) {
        if (address != null) {
            address.setZip(zip);
        }
    }
    
    /**
     * Set billing country
     * Updates the country in the associated Address entity
     */
    public void setBillingCountry(String country) {
        if (address != null) {
            address.setCountry(country);
        }
    }

    // Default constructor
    public PaymentCard() {}

    // Constructor
    public PaymentCard(Long id, User user, Address address, Long addressId, String cardNumber, String cardholderName, PaymentCardType paymentCardType, Boolean isDefault, String expirationDate, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.address = address;
        this.addressId = addressId;
        this.cardNumber = cardNumber;
        this.cardholderName = cardholderName;
        this.paymentCardType = paymentCardType;
        this.isDefault = isDefault;
        this.expirationDate = expirationDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ========== STANDARD GETTERS AND SETTERS ==========

    // Getters
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Address getAddress() {
        return address;
    }

    public Long getAddressId() {
        return addressId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public String getCardholderName() {
        return cardholderName;
    }

    public PaymentCardType getPaymentCardType() {
        return paymentCardType;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public void setCardholderName(String cardholderName) {
        this.cardholderName = cardholderName;
    }

    public void setPaymentCardType(PaymentCardType paymentCardType) {
        this.paymentCardType = paymentCardType;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
