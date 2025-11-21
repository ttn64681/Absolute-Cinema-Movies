package com.acm.cinema_ebkg_system.dto.promotion;

import java.time.LocalDateTime;

import com.acm.cinema_ebkg_system.enums.DiscountType;
import com.acm.cinema_ebkg_system.enums.PromotionStatus;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Promotion DTO - Used for both request and response
 * 
 * Used by:
 * - PromotionController.getAllPromotions() -> Response
 * - PromotionController.getPromotionById() -> Response
 * - PromotionController.createPromotion() -> Request
 * - PromotionController.updatePromotion() -> Request
 * 
 * Represents a promotional offer with discount code and expiration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {

    private Long id;    
    private String promoCode;
    private String title;
    private String description;
    private String imageLink;
    private java.math.BigDecimal discountValue;
    private DiscountType discountType;
    private PromotionStatus status;
    private LocalDateTime expirationDate;
    
}
