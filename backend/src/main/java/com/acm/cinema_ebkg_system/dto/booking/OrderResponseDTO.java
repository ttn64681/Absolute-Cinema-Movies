package com.acm.cinema_ebkg_system.dto.booking;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Order Response DTO - Returns order/booking information for order history
 * 
 * Used for displaying user's order history with all relevant details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long bookingId;
    private String movieTitle;
    private String moviePosterUrl;
    private LocalDateTime showDateTime;
    private String showDate; // Formatted date string (e.g., "9/9/25")
    private String showTime; // Formatted time string (e.g., "9:00PM")
    private List<String> seats; // List of seat identifiers (e.g., ["A1", "A2", "B3"])
    private Integer numTickets;
    private TicketCounts ticketCounts; // Adult, child, senior counts
    private BigDecimal totalAmount;
    private String paymentMethod; // Masked card info (e.g., "Visa **** **** **** 1234")
    private LocalDateTime orderDate; // When booking was created
    private String promotionName; // Promotion title if applied (null if none)
    
    /**
     * Ticket counts for different ticket types
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketCounts {
        private Integer adult;
        private Integer child;
        private Integer senior;
    }
}

