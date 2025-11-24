package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Ticket Category Entity - Represents ticket types and pricing in the cinema booking system
 * 
 * This entity maps to the 'ticket_category' table in the database and contains
 * ticket type information with associated pricing.
 */
@Entity
@Table(name = "ticket_category")
public class TicketCategory {
    // Primary key - auto-generated unique identifier
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ticket category name: 'child', 'senior', 'adult'
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    // Ticket price with decimal precision
    @Column(name = "price", nullable = false, precision = 8, scale = 2)
    private BigDecimal price;

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
    public TicketCategory() {}

    // Constructor
    public TicketCategory(Long id, String name, BigDecimal price, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
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

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
