package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

/**
 * Show Seat Entity - Represents individual seats for each movie show
 * 
 * This entity maps to the 'show_seats' table in the database and contains
 * information about individual seats within a movie showing.
 * 
 * Key Features:
 * - Each seat belongs to a specific movie show
 * - Tracks seat availability (is_available)
 * - Records seat position (row and number)
 * - Has seat type (standard, premium, luxury)
 * - Cascade delete when show is deleted
 */
@Entity
@Table(name = "show_seats", 
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"show_id", "seat_row", "seat_number"}
       ))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ShowSeat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Many-to-one relationship with MovieShow
    // Many seats belong to one show (one show has many seats)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false, referencedColumnName = "id")
    @JsonIgnoreProperties({"seats", "movie", "showRoom", "createdAt", "updatedAt"})
    private MovieShow movieShow;
    
    // Seat row identifier (e.g., "A", "B", "1", "2")
    @Column(name = "seat_row", nullable = false, length = 10)
    private String seatRow;
    
    // Seat number within the row
    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;
    
    // Seat type: 'standard', 'premium', 'luxury'
    @Column(name = "seat_type", length = 20)
    private String seatType = "standard";
    
    // Availability status - matches database column is_available
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    // One-to-one relationship with TicketSeat
    // One seat is linked to exactly one ticket (show_seat_id is UNIQUE in ticket_seat table)
    @OneToOne(mappedBy = "showSeat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"showSeat"})
    private TicketSeat ticketSeat;
    
    // Timestamp when record was created
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Timestamp when record was last updated
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Timestamp when seat was reserved (for 10-minute timeout)
    // null if seat is available or permanently booked
    @Column(name = "reserved_at")
    private LocalDateTime reservedAt;
    
    // Default constructor
    public ShowSeat() {}
    
    // Constructor
    public ShowSeat(Long id, MovieShow movieShow, String seatRow, String seatNumber, String seatType, Boolean isAvailable, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime reservedAt) {
        this.id = id;
        this.movieShow = movieShow;
        this.seatRow = seatRow;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.reservedAt = reservedAt;
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

    public MovieShow getMovieShow() {
        return movieShow;
    }

    public String getSeatRow() {
        return seatRow;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public String getSeatType() {
        return seatType;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
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

    public LocalDateTime getReservedAt() {
        return reservedAt;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setMovieShow(MovieShow movieShow) {
        this.movieShow = movieShow;
    }

    public void setSeatRow(String seatRow) {
        this.seatRow = seatRow;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
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

    public void setReservedAt(LocalDateTime reservedAt) {
        this.reservedAt = reservedAt;
    }
}

