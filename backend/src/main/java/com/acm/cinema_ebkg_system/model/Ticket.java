package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.acm.cinema_ebkg_system.enums.TicketType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Ticket Entity - Represents individual tickets for movie bookings
 */
@Entity
@Table(name = "ticket")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long id;
    
    // Many-to-one relationship with Booking
    // Many tickets belong to one booking (one booking can have multiple tickets)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false) // NOT NULL in database schema
    @JsonIgnoreProperties({"tickets", "createdAt", "updatedAt"})
    private Booking booking;
    
    // Ticket type as ENUM (matches database ticket_type ENUM)
    // Database column: tic_type of type ticket_type
    @Enumerated(EnumType.STRING)
    @Column(name = "tic_type", nullable = false)
    private TicketType ticType;
    
    // Many-to-one relationship with ShowSeat
    // One ticket is linked to exactly one seat via show_seat_id foreign key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_seat_id", nullable = true)
    @JsonIgnoreProperties({"tickets", "movieShow", "createdAt", "updatedAt"})
    private ShowSeat showSeat;
    
    
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
