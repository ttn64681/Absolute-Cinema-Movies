package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
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
@Data
@NoArgsConstructor
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
}
