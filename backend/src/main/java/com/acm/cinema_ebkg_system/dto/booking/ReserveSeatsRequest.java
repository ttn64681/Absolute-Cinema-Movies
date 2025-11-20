package com.acm.cinema_ebkg_system.dto.booking;

import java.util.List;

/**
 * Request DTO for reserving seats
 * Uses seat_row and seat_number instead of seat IDs
 */
public class ReserveSeatsRequest {
    private Long showId;
    private List<SeatSelection> seats; // List of seats identified by row and number
    
    // Inner class for seat selection
    public static class SeatSelection {
        private String seatRow;
        private String seatNumber;
        
        // Default constructor
        public SeatSelection() {}
        
        // Constructor
        public SeatSelection(String seatRow, String seatNumber) {
            this.seatRow = seatRow;
            this.seatNumber = seatNumber;
        }
        
        // Getters
        public String getSeatRow() {
            return seatRow;
        }
        
        public String getSeatNumber() {
            return seatNumber;
        }
        
        // Setters
        public void setSeatRow(String seatRow) {
            this.seatRow = seatRow;
        }
        
        public void setSeatNumber(String seatNumber) {
            this.seatNumber = seatNumber;
        }
    }
    
    // Default constructor
    public ReserveSeatsRequest() {}
    
    // Constructor
    public ReserveSeatsRequest(Long showId, List<SeatSelection> seats) {
        this.showId = showId;
        this.seats = seats;
    }
    
    // Getters
    public Long getShowId() {
        return showId;
    }
    
    public List<SeatSelection> getSeats() {
        return seats;
    }
    
    // Setters
    public void setShowId(Long showId) {
        this.showId = showId;
    }
    
    public void setSeats(List<SeatSelection> seats) {
        this.seats = seats;
    }
}

