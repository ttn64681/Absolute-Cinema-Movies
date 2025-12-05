package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Show Seat Entity - Represents individual seats for each movie show
 */
@Entity
@Table(name = "show_seats", 
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"show_id", "seat_row", "seat_number"}
       ))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    
    // One-to-many relationship with Ticket
    // One seat can be linked to multiple tickets (via show_seat_id foreign key in ticket table)
    @OneToMany(mappedBy = "showSeat", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"showSeat", "booking"})
    private List<Ticket> tickets;
    
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

