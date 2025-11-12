package com.acm.cinema_ebkg_system.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.acm.cinema_ebkg_system.enums.DiscountType;
import com.acm.cinema_ebkg_system.enums.PromotionStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.annotations.JdbcType;
//import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import org.hibernate.annotations.Type;


import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;



/**
 * Promotion Entity - Represents promotional offers and discounts
 * 
 * TODO: Uncomment when fully implementing the promotion system
 * This entity maps to the 'promotions' table in the database and contains
 * promotional information including codes, discounts, and validity periods.
 * 
 * Key Features:
 * - Tracks promotional codes and discounts
 * - Can be applied to bookings
 * - Tracks expiration dates and usage limits
 */
@Data
//@NoArgsConstructor
//@AllArgsConstructor
@Entity
@Table(name = "promotion")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
// TODO: Uncomment entire class when implementing the promotion system
public class Promotion {
    // TODO: Uncomment all fields when implementing the promotion system
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    // Promotional code (e.g., "FIRST-TIME-20")
    @NotBlank
    @Column(name = "promo_code", nullable = false, unique = true)
    private String promoCode;

    @NotBlank
    @Column(name = "image_link", nullable = false)
    private String imageLink;

    // Discount percentage or fixed amount
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal discountValue;

    // Discount type: 'percentage' or 'fixed'
    //@JdbcType(org.hibernate.type.descriptor.jdbc.EnumJdbcType.class)
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, columnDefinition = "discount_type")
    private DiscountType discountType;

    // Promotional title/description
    @Column(name = "title", nullable = false)
    private String title;

    // Description of the promotion
    @Column(name = "description", length = 500, nullable = false)
    private String description;

    // End date of promotion validity
    @Column(name = "expiration_date", nullable = false)    
    private LocalDateTime expirationDate;    

    // Timestamp when record was created
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Timestamp when record was last updated
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PromotionStatus status;
    
    // @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    // @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
