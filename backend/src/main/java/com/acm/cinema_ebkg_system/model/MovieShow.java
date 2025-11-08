package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Movie Show Entity - Represents a movie showing in a specific room
 * 
 * This entity maps to the 'movie_show' table and creates the many-to-many
 * association between movies and show rooms.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movie_show")
public class MovieShow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Many movie shows belong to one movie (a movie can be shown in multiple rooms)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", referencedColumnName = "movie_id", nullable = false)
    private Movie movie;
    
    // Many movie shows belong to one show room (a room can show multiple movies)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_room_id", nullable = false)
    private ShowRoom showRoom;
    
    // Status: 'now_playing' or 'upcoming'
    @Column(name = "status", nullable = false)
    private String status;
    
    // Available seats count
    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats = 0;
    
    // One-to-many relationship with ShowSeat
    // One show has many seats
    @OneToMany(mappedBy = "movieShow", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"movieShow"})
    private List<ShowSeat> seats;

    // Each MovieShow is associated with one ShowTime
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_time_id", nullable = false)
    private ShowTime showTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
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

