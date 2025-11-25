package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * User Repository - Data access layer for User entities
 * 
 * This repository interface extends JpaRepository to provide standard CRUD operations
 * for User entities, plus custom query methods for authentication purposes.
 * 
 * Key Features:
 * - Standard JPA repository methods (save, findById, findAll, delete, etc.)
 * - Custom query methods for email-based operations
 * - Automatic query generation from method names
 * - Integration with Spring Data JPA
 * 
 * Available Methods:
 * - findByEmail(String email) - Find user by email address
 * - existsByEmail(String email) - Check if user exists with given email
 * - Standard JPA methods inherited from JpaRepository
 * 
 * @author ACM Cinema Team
 * @version 1.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find a user by their email address (case-insensitive)
     * 
     * This method is used during login to locate the user account.
     * Returns Optional<User> to handle cases where email doesn't exist.
     * 
     * @param email User's email address
     * @return Optional<User> User if found, empty Optional if not found
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmail(@Param("email") String email);
    
    /**
     * Check if a user exists with the given email address (case-insensitive)
     * 
     * This method is used during registration to prevent duplicate accounts.
     * Returns boolean for quick existence check without loading the full entity.
     * 
     * @param email Email address to check
     * @return boolean true if user exists, false otherwise
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * Find a user by their verification token
     * 
     * This method is used during email verification to locate the user account.
     * Returns Optional<User> to handle cases where token doesn't exist or is invalid.
     * 
     * @param verificationToken Email verification token
     * @return Optional<User> User if found, empty Optional if not found
     */
    Optional<User> findByVerificationToken(String verificationToken);
    
    /**
     * Find a user by their password reset token
     * 
     * This method is used during password reset to locate the user account.
     * Returns Optional<User> to handle cases where token doesn't exist or is invalid.
     * 
     * @param passwordResetToken Password reset token
     * @return Optional<User> User if found, empty Optional if not found
     */
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    
    /**
     * Find a user by ID with addresses eagerly loaded
     * 
     * This method fetches a user along with all their addresses in a single query.
     * Used when user info endpoint needs to return address information.
     * 
     * @param id User ID
     * @return Optional<User> User with addresses loaded if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.addresses WHERE u.id = :id")
    Optional<User> findByIdWithAddresses(@Param("id") Long id);

    /**
     * Get a user by if "enrolled_for_promotion" is TRUE
     * 
     * @return
     */
    @Query("SELECT u FROM User u WHERE u.enrolledForPromotions = TRUE")
    List<User> findAllByEnrolledForPromotionsTrue();
}
