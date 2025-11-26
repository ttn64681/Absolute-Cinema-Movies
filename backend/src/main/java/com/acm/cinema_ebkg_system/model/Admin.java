package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Admin Entity - Represents an admin user in the cinema booking system
 * 
 * This entity maps to the existing 'admin' table in the database and contains
 * admin authentication credentials and profile information.
 * 
 * Key Features:
 * - JPA Entity mapping to existing admin table
 * - Password hashing handled at service layer (not stored as plain text)
 * - Email uniqueness constraint for login purposes
 * - Profile image support
 */
@Entity
@Table(name = "admin")
public class Admin {
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

    // Profile image link (optional)
    @Column(name = "profile_image_link")
    private String profileImageLink;

    // Timestamp fields for audit trail
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Default constructor
    public Admin() {}

    /**
     * Constructor for creating a new admin with basic required information
     * 
     * @param email Admin's email address (used for login)
     * @param password Admin's password (will be hashed before saving)
     */
    public Admin(String email, String password) {
        this.email = email;
        this.password = password;
    }

    /**
     * Constructor for creating a new admin with profile image
     * 
     * @param email Admin's email address (used for login)
     * @param password Admin's password (will be hashed before saving)
     * @param profileImageLink Admin's profile image URL
     */
    public Admin(String email, String password, String profileImageLink) {
        this.email = email;
        this.password = password;
        this.profileImageLink = profileImageLink;
    }

    // All-args constructor
    public Admin(Long id, String email, String password, String profileImageLink, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.profileImageLink = profileImageLink;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ========== JPA LIFECYCLE CALLBACKS ==========
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    public String getProfileImageLink() {
        return profileImageLink;
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

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
