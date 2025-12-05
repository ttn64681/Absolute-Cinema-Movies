package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.BookingFee;
import com.acm.cinema_ebkg_system.repository.BookingFeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Booking Fee Service
 */
@Service
public class BookingFeeService {
    
    @Autowired
    private BookingFeeRepository bookingFeeRepository;
    
    /**
     * Get all booking fees
     * @return List<BookingFee>: All fees
     */
    public List<BookingFee> getAllBookingFees() {
        return bookingFeeRepository.findAll();
    }
    
    /**
     * Get booking fee by name
     * @param name - String: "Online Fee" or "Sales Tax"
     * @return Optional<BookingFee>: Fee if found, empty if not
     */
    public Optional<BookingFee> getBookingFeeByName(String name) {
        return bookingFeeRepository.findByName(name);
    }
    
    /**
     * Get online fee per ticket
     * @return BigDecimal: Online fee amount (e.g., 2.50)
     */
    public java.math.BigDecimal getOnlineFee() {
        return bookingFeeRepository.findByName("Online Fee")
            .map(BookingFee::getPrice)
            .orElse(new java.math.BigDecimal("2.50")); // Default fallback
    }
    
    /**
     * Get sales tax rate
     * @return BigDecimal: Tax rate as decimal (e.g., 0.08 for 8%)
     */
    public java.math.BigDecimal getSalesTaxRate() {
        return bookingFeeRepository.findByName("Sales Tax")
            .map(BookingFee::getPrice)
            .orElse(new java.math.BigDecimal("0.08")); // Default fallback
    }
    
    /**
     * Update booking fee pricing (admin only)
     * @param bookingFee - BookingFee: Fee object with ID and updated price
     * @return BookingFee: Updated fee
     */
    public BookingFee updateBookingFee(BookingFee bookingFee) {
        return bookingFeeRepository.save(bookingFee);
    }
}


