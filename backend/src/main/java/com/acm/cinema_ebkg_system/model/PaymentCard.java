package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import com.acm.cinema_ebkg_system.enums.PaymentCardType;

/**
 * Payment Card Entity - Represents user payment cards in the cinema booking system
 */
@Entity
@Table(name = "payment_card")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

}
