package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Movie Show Entity - Represents a movie showing in a specific room
 * 
 * This entity maps to the 'movie_show' table and creates the many-to-many
 * association between movies and show rooms.
 */
@Entity
@JsonIgnoreProperties
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
    @JsonManagedReference
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

    // Default constructor
    public MovieShow() {}

    // Constructor
    public MovieShow(Long id, Movie movie, ShowRoom showRoom, String status, Integer availableSeats, List<ShowSeat> seats, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.movie = movie;
        this.showRoom = showRoom;
        this.status = status;
        this.availableSeats = availableSeats;
        this.seats = seats;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Movie getMovie() {
        return movie;
    }

    public ShowRoom getShowRoom() {
        return showRoom;
    }

    public String getStatus() {
        return status;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public List<ShowSeat> getSeats() {
        return seats;
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

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public void setShowRoom(ShowRoom showRoom) {
        this.showRoom = showRoom;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public void setSeats(List<ShowSeat> seats) {
        this.seats = seats;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

