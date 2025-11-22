package com.acm.cinema_ebkg_system.dto.booking;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for Seat information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatDTO {
    private Long id;
    private String seatRow;
    private String seatNumber;
    private String seatType;
    private Boolean isAvailable;
    private Boolean isTaken; // true if seat is taken (linked to ticket or is_available = false)
}

