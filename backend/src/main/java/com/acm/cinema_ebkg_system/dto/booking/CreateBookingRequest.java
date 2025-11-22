package com.acm.cinema_ebkg_system.dto.booking;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * DTO for creating a booking with tickets
 * Uses showId and seat row/number instead of seat IDs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    private Long showId;
    private List<SeatSelection> seats; // Seat row and number instead of IDs
    private Map<String, Integer> ticketTypes; // e.g., {"adult": 2, "child": 1, "senior": 0}

    // Inner class for seat selection
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatSelection {
        private String seatRow;
        private String seatNumber;
    }
}

