package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Show Room Entity - Represents cinema auditoriums/screening rooms in the cinema booking system
 * 
 * This entity maps to the 'show_room' table in the database and contains
 * auditorium information including name and seating capacity.
 */
@Entity
@Table(name = "show_room")
public class ShowRoom {
    // Primary key - auto-generated unique identifier
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Auditorium name (e.g., "Auditorium 1", "IMAX Theater")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // Seating capacity
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

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
    public ShowRoom() {}

    // Constructor
    public ShowRoom(Long id, String name, Integer capacity, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
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

    public Integer getCapacity() {
        return capacity;
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

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
