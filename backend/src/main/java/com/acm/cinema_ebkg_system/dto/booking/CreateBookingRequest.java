package com.acm.cinema_ebkg_system.dto.booking;

import java.util.List;
import java.util.Map;

/**
 * DTO for creating a booking with tickets
 * Uses showId and seat row/number instead of seat IDs
 */
public class CreateBookingRequest {
    private Long showId;
    private List<SeatSelection> seats; // Seat row and number instead of IDs
    private Map<String, Integer> ticketTypes; // e.g., {"adult": 2, "child": 1, "senior": 0}

    // Inner class for seat selection
    public static class SeatSelection {
        private String seatRow;
        private String seatNumber;

        public SeatSelection() {}

        public SeatSelection(String seatRow, String seatNumber) {
            this.seatRow = seatRow;
            this.seatNumber = seatNumber;
        }

        public String getSeatRow() {
            return seatRow;
        }

        public void setSeatRow(String seatRow) {
            this.seatRow = seatRow;
        }

        public String getSeatNumber() {
            return seatNumber;
        }

        public void setSeatNumber(String seatNumber) {
            this.seatNumber = seatNumber;
        }
    }

    // Default constructor
    public CreateBookingRequest() {}

    // Constructor
    public CreateBookingRequest(Long showId, List<SeatSelection> seats, Map<String, Integer> ticketTypes) {
        this.showId = showId;
        this.seats = seats;
        this.ticketTypes = ticketTypes;
    }

    // Getters
    public Long getShowId() {
        return showId;
    }

    public List<SeatSelection> getSeats() {
        return seats;
    }

    public Map<String, Integer> getTicketTypes() {
        return ticketTypes;
    }

    // Setters
    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public void setSeats(List<SeatSelection> seats) {
        this.seats = seats;
    }

    public void setTicketTypes(Map<String, Integer> ticketTypes) {
        this.ticketTypes = ticketTypes;
    }
}

