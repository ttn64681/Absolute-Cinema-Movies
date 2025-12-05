package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Ticket Category Entity - Represents ticket types and pricing in the cinema booking system
 */
@Entity
@Table(name = "ticket_category")
@Data
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
}
