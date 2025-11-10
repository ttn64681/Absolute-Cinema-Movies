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
import org.springframework.web.bind.annotation.RestController;

import com.acm.cinema_ebkg_system.dto.promotion.PromotionDTO;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.model.Promotion;
import com.acm.cinema_ebkg_system.service.PromotionService;

@RestController
@RequestMapping("/api/promotion")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;    

    @GetMapping("/")
    public ResponseEntity<?> getAllPromotions() {
        try {
            List<Promotion> promotions = promotionService.getAllPromotions();
            return ResponseEntity.ok(promotions);
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
        System.out.println("Create");
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
}
