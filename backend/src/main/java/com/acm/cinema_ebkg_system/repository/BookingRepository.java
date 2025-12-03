package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Booking Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    /**
     * Find all bookings for a user
     * Ordered by creation date descending (most recent first)
     * 
     * @param userId User ID
     * @return List of bookings ordered by created_at DESC
     */
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
}

