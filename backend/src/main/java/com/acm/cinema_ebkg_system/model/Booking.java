package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Booking Entity - Represents a user's booking for a movie show
 * 
 * This entity maps to the 'booking' table in the database and contains
 * booking information including user, payment, and associated tickets.
 * 
 * Key Features:
 * - Links to User (many bookings belong to one user)
 * - Links to Promotion (optional promotional discount)
 * - Has many tickets (one booking can have multiple tickets)
 * - Tracks total amount
 */
@Entity
@Table(name = "booking")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;
    
    // Many-to-one relationship with User
    // Many bookings belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"bookings", "createdAt", "updatedAt"})
    private User user;
    
    // Movie ID - links to movie table (obtained from movie_show)
    @Column(name = "movie_id", nullable = false)
    private Long movieId;
    
    // Many-to-one relationship with Promotion (optional)
    // Many bookings can use one promotion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", referencedColumnName = "id", nullable = true)
    @JsonIgnoreProperties({"bookings"})
    private Promotion promotion;
    
    // Payment Card ID - nullable for now (can be set later when payment is processed)
    @Column(name = "payment_card_id", nullable = true)
    private Long paymentId;
    
    // Number of tickets in this booking
    @Column(name = "num_tickets", nullable = false)
    private Integer numTickets;
    
    // Total amount for this booking
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal totalAmount;
    
    // One-to-many relationship with Ticket
    // One booking has many tickets
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"booking"})
    private List<Ticket> tickets;
    
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
