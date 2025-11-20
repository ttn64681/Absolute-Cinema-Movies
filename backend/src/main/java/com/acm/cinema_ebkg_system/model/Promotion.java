package com.acm.cinema_ebkg_system.model;


import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Entity
@Table(name = "promotions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
// TODO: Uncomment entire class when implementing the promotion system
public class Promotion {
    // TODO: Uncomment all fields when implementing the promotion system
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id")
    private Long promotionId;
    
    // Promotional code (e.g., "FIRST-TIME-20")
    @NotBlank
    @Column(name = "promo_code", nullable = false, unique = true)
    private String promoCode;
    
    // Discount percentage or fixed amount
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal discountValue;
    
    // Discount type: 'percentage' or 'fixed'
    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType;
    
    // Promotional title/description
    @Column(name = "title", nullable = false)
    private String title;
    
    // Description of the promotion
    @Column(name = "description", length = 500)
    private String description;
    
    // Start date of promotion validity
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    // End date of promotion validity
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    // Usage limit (null = unlimited)
    @Column(name = "usage_limit")
    private Integer usageLimit;
    
    // Current usage count
    @Column(name = "current_usage")
    private Integer currentUsage = 0;
    
    // Timestamp when record was created
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Timestamp when record was last updated
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public Promotion() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters
    public Long getPromotionId() {
        return promotionId;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public java.math.BigDecimal getDiscountValue() {
        return discountValue;
    }

    public String getDiscountType() {
        return discountType;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public Integer getCurrentUsage() {
        return currentUsage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters
    public void setPromotionId(Long promotionId) {
        this.promotionId = promotionId;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    public void setDiscountValue(java.math.BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public void setCurrentUsage(Integer currentUsage) {
        this.currentUsage = currentUsage;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
