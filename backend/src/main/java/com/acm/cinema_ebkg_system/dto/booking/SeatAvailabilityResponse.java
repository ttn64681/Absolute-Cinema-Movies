package com.acm.cinema_ebkg_system.dto.booking;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * Response DTO for seat availability information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatAvailabilityResponse {
    private Long showId;
    private List<SeatDTO> seats;
    private Long totalSeats;
    private Long availableSeats;
    private Long reservedSeats;
}

