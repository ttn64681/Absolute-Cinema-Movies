package com.acm.cinema_ebkg_system.mapper;

import com.acm.cinema_ebkg_system.dto.payment.PaymentCardResponseDTO;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.util.PaymentEncryptionUtil;

/**
 * Payment Card Mapper - Converts PaymentCard entities to Response DTOs
 * 
 * Mapper classes located in mapper/ package for centralized conversion logic
 * Security: Masks card numbers in responses (shows only last 4 digits)
 * 
 * Static methods allow direct class-level access without instantiation (utility pattern)
 */
public class PaymentCardMapper {
    
    /**
     * Convert PaymentCard entity to PaymentCardResponseDTO with masked card number
     * @param paymentCard - PaymentCard entity (may have encrypted or decrypted card number)
     * @return PaymentCardResponseDTO with masked card number
     */
    public static PaymentCardResponseDTO toResponseDTO(PaymentCard paymentCard) {
        PaymentCardResponseDTO dto = new PaymentCardResponseDTO();
        
        dto.setId(paymentCard.getId());
        // Enum serializes to string (visa, mastercard, amex, discover)
        dto.setPaymentCardType(paymentCard.getPaymentCardType().name());
        dto.setExpirationDate(paymentCard.getExpirationDate());
        dto.setCardholderName(paymentCard.getCardholderName());
        dto.setIsDefault(paymentCard.getIsDefault());
        
        // Mask card number - show only last 4 digits
        String cardNumber = paymentCard.getCardNumber();
        String maskedCardNumber = maskCardNumber(cardNumber);
        dto.setCardNumber(maskedCardNumber);  // Set masked value in cardNumber field for frontend compatibility
        
        // Set billing address fields from associated Address entity
        if (paymentCard.getAddress() != null) {
            dto.setBillingStreet(paymentCard.getBillingStreet());
            dto.setBillingCity(paymentCard.getBillingCity());
            dto.setBillingState(paymentCard.getBillingState());
            dto.setBillingZip(paymentCard.getBillingZip());
            dto.setBillingCountry(paymentCard.getBillingCountry());
        }
        
        return dto;
    }
    
    /**
     * Mask card number to show only last 4 digits
     * Handles both encrypted and decrypted card numbers
     * @param cardNumber - Card number (may be encrypted, decrypted, or null)
     * @return Masked card number (e.g., "**** **** **** 1234")
     */
    private static String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "**** **** **** ****";
        }
        
        // Try to decrypt if encrypted
        String decrypted = cardNumber;
        try {
            decrypted = PaymentEncryptionUtil.decryptCardNumber(cardNumber);
        } catch (Exception e) {
            // Already decrypted or invalid format - use as is
            decrypted = cardNumber;
        }
        
        // Remove spaces and extract last 4 digits
        String cleaned = decrypted.replaceAll("\\s+", "");
        if (cleaned.length() >= 4) {
            String lastFour = cleaned.substring(cleaned.length() - 4);
            return "**** **** **** " + lastFour;
        }
        
        return "**** **** **** ****";
    }
}

