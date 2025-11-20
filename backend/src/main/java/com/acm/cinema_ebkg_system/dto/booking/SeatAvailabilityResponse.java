package com.acm.cinema_ebkg_system.dto.booking;

import java.util.List;

/**
 * Response DTO for seat availability information
 */
public class SeatAvailabilityResponse {
    private Long showId;
    private List<SeatDTO> seats;
    private Long totalSeats;
    private Long availableSeats;
    private Long reservedSeats;
    
    // Default constructor
    public SeatAvailabilityResponse() {}
    
    // Constructor
    public SeatAvailabilityResponse(Long showId, List<SeatDTO> seats, Long totalSeats, Long availableSeats, Long reservedSeats) {
        this.showId = showId;
        this.seats = seats;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
        this.reservedSeats = reservedSeats;
    }
    
    // Getters
    public Long getShowId() {
        return showId;
    }
    
    public List<SeatDTO> getSeats() {
        return seats;
    }
    
    public Long getTotalSeats() {
        return totalSeats;
    }
    
    public Long getAvailableSeats() {
        return availableSeats;
    }
    
    public Long getReservedSeats() {
        return reservedSeats;
    }
    
    // Setters
    public void setShowId(Long showId) {
        this.showId = showId;
    }
    
    public void setSeats(List<SeatDTO> seats) {
        this.seats = seats;
    }
    
    public void setTotalSeats(Long totalSeats) {
        this.totalSeats = totalSeats;
    }
    
    public void setAvailableSeats(Long availableSeats) {
        this.availableSeats = availableSeats;
    }
    
    public void setReservedSeats(Long reservedSeats) {
        this.reservedSeats = reservedSeats;
    }
}

