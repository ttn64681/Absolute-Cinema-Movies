package com.acm.cinema_ebkg_system.repository;

import org.springframework.stereotype.Repository;

import com.acm.cinema_ebkg_system.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Payment Card Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    // Find promotion by promo code (case-insensitive)
    java.util.Optional<Promotion> findByPromoCodeIgnoreCase(String promoCode);
}