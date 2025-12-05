package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.model.BookingFee;
import com.acm.cinema_ebkg_system.service.BookingFeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

/**
 * Booking Fee Controller
 */
@RestController
@RequestMapping("/api/booking-fees")
public class BookingFeeController {
    
    @Autowired
    private BookingFeeService bookingFeeService;
    
    /**
     * GET /api/booking-fees
     * Returns: List<BookingFee> - all fees
     */
    @GetMapping
    public List<BookingFee> getAllBookingFees() {
        return bookingFeeService.getAllBookingFees();
    }
    
    /**
     * GET /api/booking-fees/name/{name}
     * Input: name (String: "Online Fee" or "Sales Tax") in URL path
     * Returns: 404 Not Found if not found, otherwise BookingFee
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<BookingFee> getBookingFeeByName(@PathVariable String name) {
        Optional<BookingFee> bookingFee = bookingFeeService.getBookingFeeByName(name);
        return bookingFee.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * PUT /api/booking-fees/{bookingFeeId} (admin only)
     * Input: bookingFeeId (Long) in URL path, BookingFee JSON body with updated price
     * Returns: BookingFee - updated fee
     */
    @PutMapping("/{bookingFeeId}")
    public BookingFee updateBookingFee(@PathVariable Long bookingFeeId, @RequestBody BookingFee bookingFee) {
        bookingFee.setId(bookingFeeId);
        return bookingFeeService.updateBookingFee(bookingFee);
    }
}


