package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.service.PaymentCardService;
import com.acm.cinema_ebkg_system.dto.payment.PaymentCardDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

/**
 * Payment Card Controller
 */
@RestController
@RequestMapping("/api/payment-card")
public class PaymentCardController {
    
    @Autowired // Spring automatically provides service instance (dependency injection)
    private PaymentCardService paymentCardService;
    
    /**
     * GET /api/payment-cards/user/{userId}
     * Input: userId (Long) in URL path
     * Returns: List<PaymentCard> - all payment cards for user (default first)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPaymentCards(@PathVariable Long userId) {
        try {
            List<PaymentCard> cards = paymentCardService.getUserPaymentCardsWithAddresses(userId);
            return ResponseEntity.ok(cards);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching payment cards: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/payment-cards/user/{userId}/default
     * Input: userId (Long) in URL path
     * Returns: 404 Not Found if no default card, otherwise PaymentCard
     */
    @GetMapping("/user/{userId}/default")
    public ResponseEntity<PaymentCard> getUserDefaultCard(@PathVariable Long userId) {
        Optional<PaymentCard> defaultCard = paymentCardService.getUserDefaultCard(userId);
        return defaultCard.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * POST /api/payment-cards
     * Input: PaymentCardDTO JSON body with {userId, cardType, cardNumber, expirationDate, cardholderName, billingStreet, billingCity, billingState, billingZip, billingCountry, isDefault}
     * Returns: PaymentCard - created card with ID and timestamps (auto-sets as default if first card)
     */
    @PostMapping
    public ResponseEntity<?> createPaymentCard(@RequestBody PaymentCardDTO dto) {
        try {
            PaymentCard created = paymentCardService.createPaymentCardFromDto(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating payment card: " + e.getMessage());
        }
    }
    
    /**
     * PUT /api/payment-cards/{paymentCardId}
     * Input: paymentCardId (Long) in URL path, PaymentCard JSON body with updated fields
     * Returns: PaymentCard - updated card
     */
    @PutMapping("/{paymentCardId}")
    public ResponseEntity<?> updatePaymentCard(
            @PathVariable Long paymentCardId, 
            @RequestBody PaymentCardDTO dto) {
        try {
            PaymentCard updated = paymentCardService.updatePaymentCardFromDto(paymentCardId, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * PUT /api/payment-cards/user/{userId}/set-default/{paymentCardId}
     * Input: userId (Long), paymentCardId (Long) in URL path
     * Returns: 200 OK - default card changed (no body)
     */
    @PutMapping("/user/{userId}/set-default/{paymentCardId}")
    public ResponseEntity<Void> setDefaultCard(
            @PathVariable Long userId, 
            @PathVariable Long paymentCardId) {
        paymentCardService.setDefaultCard(userId, paymentCardId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * DELETE /api/payment-cards/{paymentCardId}
     * Input: paymentCardId (Long) in URL path
     * Returns: 200 OK - card deleted (no body)
     */
    @DeleteMapping("/{paymentCardId}")
    public ResponseEntity<Void> deletePaymentCard(@PathVariable Long paymentCardId) {
        paymentCardService.deletePaymentCard(paymentCardId);
        return ResponseEntity.ok().build();
    }
}
