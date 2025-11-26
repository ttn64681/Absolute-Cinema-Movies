package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.acm.cinema_ebkg_system.enums.TicketType;
import java.time.LocalDateTime;

/**
 * Ticket Entity - Represents individual tickets for movie bookings
 * 
 * TODO: Uncomment when fully implementing the ticket system
 * This entity maps to the 'ticket' table in the database and contains
 * ticket information for a specific booking.
 * 
 * Key Features:
 * - Links to Booking (many tickets belong to one booking)
 * - Links to TicketCategory (ticket type and pricing)
 * - Associates with ShowSeats via TicketSeat junction table
 * - Tracks ticket price at time of purchase
 */
@Entity
@Table(name = "ticket")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
// TODO: Uncomment entire class when implementing the ticket system
public class Ticket {
    // TODO: Uncomment all fields when implementing the ticket system
    
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
    
    // One-to-one relationship with TicketSeat
    // One ticket is linked to exactly one seat (ticket_id is UNIQUE in ticket_seat table)
    @OneToOne(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"ticket"})
    private TicketSeat ticketSeat;
    
    
    // Timestamp when record was created
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Timestamp when record was last updated
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public Ticket() {}

    // All-args constructor
    public Ticket(Long id, Booking booking, TicketType ticType, TicketSeat ticketSeat, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.booking = booking;
        this.ticType = ticType;
        this.ticketSeat = ticketSeat;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public TicketType getTicType() {
        return ticType;
    }

    public TicketSeat getTicketSeat() {
        return ticketSeat;
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

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public void setTicType(TicketType ticType) {
        this.ticType = ticType;
    }

    public void setTicketSeat(TicketSeat ticketSeat) {
        this.ticketSeat = ticketSeat;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
