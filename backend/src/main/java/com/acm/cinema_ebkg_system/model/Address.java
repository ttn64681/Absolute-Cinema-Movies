package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

/**
 * Address Entity - Represents user addresses in the cinema booking system
 * 
 * This entity maps to the 'address' table in the database and contains
 * address information for both home and billing addresses.
 */
@Entity
@Table(name = "address")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Address {
    // Primary key - auto-generated unique identifier
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign key to users table
    // Many addresses belong to one user 
    // (a user can have 1 home address and up to 3 billing addresses)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Address type: 'home' or 'billing'
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AddressType addressType;

    // Street address
    @Column(name = "street", nullable = false, length = 255)
    private String street;

    // City
    @Column(name = "city", nullable = false, length = 100)
    private String city;

    // State
    @Column(name = "state", nullable = false, length = 50)
    private String state;

    // ZIP code
    @Column(name = "zip", nullable = false, length = 20)
    private String zip;

    // Country (defaults to 'US')
    @Column(name = "country", length = 50)
    private String country = "US";

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

    // Default constructor
    public Address() {}

    // Getters
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public AddressType getAddressType() {
        return addressType;
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

    public void setAddressType(AddressType addressType) {
        this.addressType = addressType;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
