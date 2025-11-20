package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Booking Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
}

