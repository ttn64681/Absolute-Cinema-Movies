package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.enums.UserStatus;
import com.acm.cinema_ebkg_system.model.PaymentInfo;

/**
 * User Entity - Represents a user in the cinema booking system
 * 
 * Contains all user info including authentication credentials and personal details collected during registration.
 * 
 * Key Features:
 * - Password hashing handled at service layer (not stored as plain text)
 * - Email uniqueness constraint for login purposes
 */

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // Password - stored as BCrypt hash (never plain text)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    // Optional contact info
    @Column
    private String phoneNumber;

    // User preferences
    @Column(name = "enrolled_for_promotions")
    @Getter(value = AccessLevel.NONE) // Exclude from Lombok - we define custom getters
    @Setter
    private boolean enrolledForPromotions = false;

    @Column(name = "profile_image_link")
    private String profileImageLink;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ========== EMAIL VERIFICATION FIELDS ==========
    
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private UserStatus accountStatus = UserStatus.inactive;
    
    @Column(name = "verification_token")
    private String verificationToken;
    
    @Column(name = "verification_token_expires_at")
    private LocalDateTime verificationTokenExpiresAt;

    // ========== PASSWORD RESET FIELDS ==========
    
    @Column(name = "password_reset_token")
    private String passwordResetToken;
    
    @Column(name = "password_reset_token_expires_at")
    private LocalDateTime passwordResetTokenExpiresAt;

    // Legacy PaymentInfo relationship - no longer used (replaced by PaymentCard)
    // Ignored to prevent JPA from querying non-existent payment_info table
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PaymentInfo> paymentInfos = new ArrayList<>();
    
    // One-to-many relationship with Address
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Address> addresses = new ArrayList<>();

    // ========== JPA LIFECYCLE CALLBACKS ==========
    
    /**
     * JPA callback method - automatically called before saving a new entity
     * Sets the creation and update timestamps
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * JPA callback method - automatically called before updating an existing entity
     * Updates the modification timestamp
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // ========== HOME ADDRESS GETTERS (for JSON serialization) ==========
    
    /**
     * Get home address street
     * Returns the street from the home address if it exists
     */
    public String getHomeStreet() {
        if (addresses != null) {
            return addresses.stream()
                .filter(addr -> addr.getAddressType() != null && addr.getAddressType().equals(AddressType.home))
                .findFirst()
                .map(Address::getStreet)
                .orElse(null);
        }
        return null;
    }
    
    /**
     * Get home address city
     */
    public String getHomeCity() {
        if (addresses != null) {
            return addresses.stream()
                .filter(addr -> addr.getAddressType() != null && addr.getAddressType().equals(AddressType.home))
                .findFirst()
                .map(Address::getCity)
                .orElse(null);
        }
        return null;
    }
    
    /**
     * Get home address state
     */
    public String getHomeState() {
        if (addresses != null) {
            return addresses.stream()
                .filter(addr -> addr.getAddressType() != null && addr.getAddressType().equals(AddressType.home))
                .findFirst()
                .map(Address::getState)
                .orElse(null);
        }
        return null;
    }
    
    /**
     * Get home address ZIP code
     */
    public String getHomeZip() {
        if (addresses != null) {
            return addresses.stream()
                .filter(addr -> addr.getAddressType() != null && addr.getAddressType().equals(AddressType.home))
                .findFirst()
                .map(Address::getZip)
                .orElse(null);
        }
        return null;
    }
    
    /**
     * Get home address country
     */
    public String getHomeCountry() {
        if (addresses != null) {
            return addresses.stream()
                .filter(addr -> addr.getAddressType() != null && addr.getAddressType().equals(AddressType.home))
                .findFirst()
                .map(Address::getCountry)
                .orElse(null);
        }
        return null;
    }

    // ========== CUSTOM GETTERS (Preserved - not generated by Lombok) ==========

    public Boolean getEnrolledForPromotions() {
        return enrolledForPromotions;
    }

    // Boolean getter for compatibility (Lombok generates this but we need explicit for boolean)
    public boolean isEnrolledForPromotions() {
        return enrolledForPromotions;
    }

    public UserStatus getAccountStatus() {
        return accountStatus != null ? accountStatus : UserStatus.inactive;
    }
    
    // Convenience method for backward compatibility - checks if account is active
    public boolean isActive() {
        return accountStatus == UserStatus.active;
    }
    
    // Convenience method for backward compatibility - sets account status based on boolean
    public void setActive(boolean active) {
        this.accountStatus = active ? UserStatus.active : UserStatus.inactive;
    }
    
    public void setAccountStatus(UserStatus accountStatus) {
        this.accountStatus = accountStatus != null ? accountStatus : UserStatus.inactive;
    }
}
