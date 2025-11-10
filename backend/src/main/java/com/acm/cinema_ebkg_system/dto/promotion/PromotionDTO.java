package com.acm.cinema_ebkg_system.dto.promotion;

import com.acm.cinema_ebkg_system.enums.DiscountType;
import com.acm.cinema_ebkg_system.enums.PromotionStatus;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {

    private Long id;    
    private String promoCode;
    private String title;
    private String description;
    private String image_link;
    private java.math.BigDecimal discountValue;
    private DiscountType discountType;
    private PromotionStatus status;
    
}
