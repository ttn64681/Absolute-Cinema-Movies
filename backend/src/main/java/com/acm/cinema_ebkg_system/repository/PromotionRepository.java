package com.acm.cinema_ebkg_system.repository;

import org.springframework.stereotype.Repository;

import com.acm.cinema_ebkg_system.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

/**
 * Payment Card Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    // Used as reference for PromotionService methods
    // @Query("SELECT * FROM promotion")
    // List<Promotion> findByUserIdOrderByIsDefaultDesc(@Param("userId") Long userId);
    
    // @Query("SELECT p FROM Promotion p LEFT JOIN FETCH p.user WHERE p.user.id = :userId AND p.isDefault = :isDefault")
    // Optional<Promotion> findByUserIdAndIsDefault(@Param("userId") Long userId, @Param("isDefault") Boolean isDefault);
}