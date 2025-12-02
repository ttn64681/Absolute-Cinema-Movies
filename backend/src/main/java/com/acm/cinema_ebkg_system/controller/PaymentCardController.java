package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.service.PaymentCardService;
import com.acm.cinema_ebkg_system.service.AddressService;
import com.acm.cinema_ebkg_system.service.UserService;
import com.acm.cinema_ebkg_system.dto.payment.PaymentCardRequestDTO;
import com.acm.cinema_ebkg_system.dto.payment.PaymentCardResponseDTO;
import com.acm.cinema_ebkg_system.mapper.PaymentCardMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Payment Card Controller
 */
@RestController
@RequestMapping("/api/payment-card")
public class PaymentCardController {
    
    @Autowired // Spring automatically provides service instance (dependency injection)
    private PaymentCardService paymentCardService;
    
    @Autowired
    private AddressService addressService;
    
    @Autowired
    private UserService userService;
    
    /**
     * GET /api/payment-cards/user/{userId}
     * Input: userId (Long) in URL path, optional query parameter: unmasked (boolean) - if true, returns full card numbers for checkout
     * Returns: List<PaymentCardResponseDTO> - all payment cards for user (default first) with masked or unmasked card numbers
     * 
     * Returns DTOs instead of entities to control exposed data and prevent lazy loading issues
     * Security: By default masks card numbers. Only returns unmasked when explicitly requested (for checkout auto-fill).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPaymentCards(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "false") boolean unmasked) {
        try {
            List<PaymentCard> cards = paymentCardService.getUserPaymentCards(userId);
            // Load billing address for each card
            for (PaymentCard card : cards) {
                if (card.getAddressId() != null) {
                    Optional<Address> address = addressService.getAddressById(card.getAddressId());
                    address.ifPresent(card::setAddress);
                }
            }
            // Convert to response DTOs (masked or unmasked based on query parameter)
            boolean shouldMask = !unmasked;  // Mask if unmasked=false (default)
            List<PaymentCardResponseDTO> responseDTOs = cards.stream()
                .map(card -> PaymentCardMapper.toResponseDTO(card, shouldMask))
                .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching payment cards: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/payment-cards/user/{userId}/default
     * Input: userId (Long) in URL path
     * Returns: 404 Not Found if no default card, otherwise PaymentCardResponseDTO with masked card number
     * 
     * Returns DTOs instead of entities to control exposed data and prevent lazy loading issues
     */
    @GetMapping("/user/{userId}/default")
    public ResponseEntity<PaymentCardResponseDTO> getUserDefaultCard(@PathVariable Long userId) {
        Optional<PaymentCard> defaultCard = paymentCardService.getUserDefaultCard(userId);
        if (defaultCard.isPresent()) {
            PaymentCard card = defaultCard.get();
            // Load billing address if needed
            if (card.getAddressId() != null && card.getAddress() == null) {
                Optional<Address> address = addressService.getAddressById(card.getAddressId());
                address.ifPresent(card::setAddress);
            }
            PaymentCardResponseDTO responseDTO = PaymentCardMapper.toResponseDTO(card);
            return ResponseEntity.ok(responseDTO);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * POST /api/payment-cards
     * Input: PaymentCardRequestDTO JSON body with {userId, cardType, cardNumber, expirationDate, cardholderName, billingStreet, billingCity, billingState, billingZip, billingCountry, isDefault}
     * Returns: PaymentCardResponseDTO - created card with ID and timestamps (auto-sets as default if first card)
     */
    @PostMapping
    public ResponseEntity<?> createPaymentCard(@RequestBody PaymentCardRequestDTO dto) {
        try {
            // Get user
            User user = userService.getUserById(dto.getUserId());
            
            // Create billing address
            Address address = new Address();
            address.setUser(user);
            address.setAddressType(AddressType.billing);
            address.setStreet(dto.getBillingStreet());
            address.setCity(dto.getBillingCity());
            address.setState(dto.getBillingState());
            address.setZip(dto.getBillingZip());
            address.setCountry(dto.getBillingCountry() != null ? dto.getBillingCountry() : "US");
            Address savedAddress = addressService.createAddress(address);
            
            // Create payment card
            PaymentCard paymentCard = new PaymentCard();
            paymentCard.setUser(user);
            paymentCard.setAddress(savedAddress);
            paymentCard.setCardNumber(dto.getCardNumber());
            paymentCard.setCardholderName(dto.getCardholderName());
            paymentCard.setPaymentCardType(dto.getCardType());
            paymentCard.setExpirationDate(dto.getExpirationDate());
            paymentCard.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);
            
            PaymentCard created = paymentCardService.createPaymentCard(paymentCard);
            // Load address for response (address is already set from savedAddress above)
            PaymentCardResponseDTO responseDTO = PaymentCardMapper.toResponseDTO(created);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating payment card: " + e.getMessage());
        }
    }
    
    /**
     * PUT /api/payment-cards/{paymentCardId}
     * Input: paymentCardId (Long) in URL path, PaymentCardRequestDTO JSON body with updated fields
     * Returns: PaymentCardResponseDTO - updated card
     */
    @PutMapping("/{paymentCardId}")
    public ResponseEntity<?> updatePaymentCard(
            @PathVariable Long paymentCardId, 
            @RequestBody PaymentCardRequestDTO dto) {
        try {
            // Get existing payment card
            PaymentCard existingCard = paymentCardService.getPaymentCardById(paymentCardId)
                .orElseThrow(() -> new RuntimeException("Payment card not found"));
            
            // Update card fields
            existingCard.setPaymentCardType(dto.getCardType());
            existingCard.setCardNumber(dto.getCardNumber());
            existingCard.setCardholderName(dto.getCardholderName());
            existingCard.setExpirationDate(dto.getExpirationDate());
            existingCard.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);
            
            // Update billing address
            if (existingCard.getAddress() != null) {
                Address address = existingCard.getAddress();
                address.setStreet(dto.getBillingStreet());
                address.setCity(dto.getBillingCity());
                address.setState(dto.getBillingState());
                address.setZip(dto.getBillingZip());
                address.setCountry(dto.getBillingCountry() != null ? dto.getBillingCountry() : "US");
                addressService.updateAddress(address);
            }
            
            PaymentCard updated = paymentCardService.updatePaymentCard(existingCard);
            // Load address for response
            if (updated.getAddressId() != null) {
                Optional<Address> address = addressService.getAddressById(updated.getAddressId());
                address.ifPresent(updated::setAddress);
            }
            PaymentCardResponseDTO responseDTO = PaymentCardMapper.toResponseDTO(updated);
            return ResponseEntity.ok(responseDTO);
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
