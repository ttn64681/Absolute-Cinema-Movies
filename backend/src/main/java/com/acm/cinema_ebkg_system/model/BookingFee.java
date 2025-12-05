package com.acm.cinema_ebkg_system.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Booking Fee Entity - Represents configurable fees for bookings
 * 
 * This entity maps to the 'booking_fee' table and contains fees like
 * online fees (per ticket) and sales tax (as a rate/percentage).
 */
@Entity
@Table(name = "booking_fee")
@Data
@NoArgsConstructor
public class BookingFee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal price;
}


