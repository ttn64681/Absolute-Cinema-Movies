package com.acm.cinema_ebkg_system.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.acm.cinema_ebkg_system.dto.promotion.PromotionDTO;
import com.acm.cinema_ebkg_system.model.Promotion;
import com.acm.cinema_ebkg_system.service.PromotionService;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/promotion")
@Slf4j
public class PromotionController {

    @Autowired
    private PromotionService promotionService;    

    @GetMapping("/")
    public ResponseEntity<?> getAllPromotions() {
        try {
            List<Promotion> promotions = promotionService.getAllPromotions();
            // Convert entities to DTOs for consistent JSON serialization
            List<PromotionDTO> promotionDTOs = promotions.stream().map(p -> {
                PromotionDTO dto = new PromotionDTO();
                dto.setId(p.getId());
                dto.setPromoCode(p.getPromoCode());
                dto.setTitle(p.getTitle());
                dto.setDescription(p.getDescription());
                dto.setImageLink(p.getImageLink());
                dto.setDiscountValue(p.getDiscountValue());
                dto.setDiscountType(p.getDiscountType());
                dto.setStatus(p.getStatus());
                dto.setExpirationDate(p.getExpirationDate());
                return dto;
            }).collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(promotionDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching promotions: " + e.getMessage());
        }
    }

    @GetMapping("/{promotionId}")
    public ResponseEntity<?> getPromotionById(@PathVariable Long promotionId) {
        try {
            Optional<Promotion> promotion = promotionService.getPromotionById(promotionId);
            if (promotion.isPresent()) {
                return ResponseEntity.ok(promotion.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching promotions: " + e.getMessage());
        }
    }

    @PostMapping("/")
    public ResponseEntity<?> createPromotion(@RequestBody PromotionDTO promotion) {
        log.debug("Create promotion");
        try {
            Promotion createdPromotion = promotionService.createPromotion(promotion);
            return ResponseEntity.ok(createdPromotion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating promotion: " + e.getMessage());
        }
    }

    @PutMapping("/{promotionId}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long promotionId, @RequestBody PromotionDTO updatedPromotion) {
        try {
            Promotion updated = promotionService.updatePromotion(promotionId, updatedPromotion);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating promotion: " + e.getMessage());
        }
    }

    @DeleteMapping("/{promotionId}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long promotionId) {
        try {
            promotionService.deletePromotion(promotionId);
            return ResponseEntity.ok("Promotion deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting promotion: " + e.getMessage());
        }
    }

    /**
     * Validate promo code for checkout
     * GET /api/promotion/validate?promoCode=CODE
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validatePromoCode(@RequestParam String promoCode) {
        try {
            java.util.Map<String, Object> result = promotionService.validatePromoCode(promoCode);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error validating promo code: " + e.getMessage());
        }
    }
}
