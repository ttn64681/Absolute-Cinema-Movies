package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.enums.UserStatus;

/**
 * User Entity - Represents a user in the cinema booking system
 * 
 * This entity maps to the 'users' table in the database and contains all user information
 * including authentication credentials and personal details collected during registration.
 * 
 * Key Features:
 * - JPA Entity with automatic table creation
 * - Password hashing handled at service layer (not stored as plain text)
 * - Automatic timestamp management for created_at and updated_at
 * - Email uniqueness constraint for login purposes
 */

@Entity
@Table(name = "users")
public class User {
    // Primary key - auto-generated unique identifier
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Email address - used as username for login, must be unique
    @Column(nullable = false, unique = true)
    private String email;

    // Password - stored as BCrypt hash (never plain text)
    @Column(nullable = false)
    private String password;

    // Required personal information
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    // Optional contact information
    @Column
    private String phoneNumber;

    // User preferences
    @Column(name = "enrolled_for_promotions")
    private boolean enrolledForPromotions = false;

    // Profile picture link
    @Column(name = "profile_image_link")
    private String profileImageLink;

    // Audit fields - automatically managed timestamps
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

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
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

    // ========== STANDARD GETTERS AND SETTERS ==========

    // Getters
    public Long getId() {
        return id;
    }

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

    public boolean isEnrolledForPromotions() {
        return enrolledForPromotions;
    }

    public Boolean getEnrolledForPromotions() {
        return enrolledForPromotions;
    }

    public String getProfileImageLink() {
        return profileImageLink;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public UserStatus getAccountStatus() {
        return accountStatus != null ? accountStatus : UserStatus.inactive;
    }
    
    // Convenience method for backward compatibility - checks if account is active
    public boolean isActive() {
        return accountStatus == UserStatus.active;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public LocalDateTime getVerificationTokenExpiresAt() {
        return verificationTokenExpiresAt;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public LocalDateTime getPasswordResetTokenExpiresAt() {
        return passwordResetTokenExpiresAt;
    }

    public List<PaymentInfo> getPaymentInfos() {
        return paymentInfos;
    }

    public List<Address> getAddresses() {
        return addresses;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

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

    public void setEnrolledForPromotions(boolean enrolledForPromotions) {
        this.enrolledForPromotions = enrolledForPromotions;
    }

    public void setProfileImageLink(String profileImageLink) {
        this.profileImageLink = profileImageLink;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setAccountStatus(UserStatus accountStatus) {
        this.accountStatus = accountStatus != null ? accountStatus : UserStatus.inactive;
    }
    
    // Convenience method for backward compatibility - sets account status based on boolean
    public void setActive(boolean active) {
        this.accountStatus = active ? UserStatus.active : UserStatus.inactive;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public void setVerificationTokenExpiresAt(LocalDateTime verificationTokenExpiresAt) {
        this.verificationTokenExpiresAt = verificationTokenExpiresAt;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public void setPasswordResetTokenExpiresAt(LocalDateTime passwordResetTokenExpiresAt) {
        this.passwordResetTokenExpiresAt = passwordResetTokenExpiresAt;
    }

    public void setPaymentInfos(List<PaymentInfo> paymentInfos) {
        this.paymentInfos = paymentInfos;
    }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }
}
