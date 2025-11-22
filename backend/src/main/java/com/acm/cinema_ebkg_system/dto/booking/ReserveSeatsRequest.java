package com.acm.cinema_ebkg_system.dto.booking;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * Request DTO for reserving seats
 * Uses seat_row and seat_number instead of seat IDs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReserveSeatsRequest {
    private Long showId;
    private List<SeatSelection> seats; // List of seats identified by row and number
    
    // Inner class for seat selection
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatSelection {
        private String seatRow;
        private String seatNumber;
    }
}

