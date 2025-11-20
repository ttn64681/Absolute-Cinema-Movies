package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

/**
 * TicketSeat Entity - Junction table linking tickets to seats
 * 
 * This entity maps to the 'ticket_seat' table and creates a one-to-one
 * relationship between tickets and show seats.
 * 
 * Key Features:
 * - Links Ticket to ShowSeat (one-to-one relationship)
 * - One ticket = one seat (each ticket represents one person in one seat)
 * - One seat can only be linked to one ticket
 * - Both ticket_id and show_seat_id are UNIQUE in the database
 */
@Entity
@Table(name = "ticket_seat", 
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"ticket_id", "show_seat_id"}
       ))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TicketSeat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // One-to-one relationship with Ticket (ticket_id is UNIQUE in database)
    // Each ticket can only be linked to one seat
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false, unique = true, referencedColumnName = "ticket_id")
    @JsonIgnoreProperties({"ticketSeat"})
    private Ticket ticket;
    
    // One-to-one relationship with ShowSeat (show_seat_id is UNIQUE in database)
    // Each seat can only be linked to one ticket
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_seat_id", nullable = false, unique = true, referencedColumnName = "id")
    @JsonIgnoreProperties({"ticketSeat"})
    private ShowSeat showSeat;
    
    // Timestamp when record was created
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Timestamp when record was last updated
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public TicketSeat() {}
    
    // Constructor
    public TicketSeat(Ticket ticket, ShowSeat showSeat) {
        this.ticket = ticket;
        this.showSeat = showSeat;
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

    public Ticket getTicket() {
        return ticket;
    }

    public ShowSeat getShowSeat() {
        return showSeat;
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

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public void setShowSeat(ShowSeat showSeat) {
        this.showSeat = showSeat;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

