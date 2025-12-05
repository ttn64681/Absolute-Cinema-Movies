package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.BookingFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Booking Fee Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface BookingFeeRepository extends JpaRepository<BookingFee, Long> {
    
    Optional<BookingFee> findByName(String name);
}


