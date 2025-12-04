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
     * Convert PaymentCard entity to PaymentCardResponseDTO with masked or unmasked card number
     * @param paymentCard - PaymentCard entity (may have encrypted or decrypted card number)
     * @param maskCardNumber - If true, mask card number (show only last 4 digits). If false, return full decrypted number.
     * @return PaymentCardResponseDTO with masked or unmasked card number
     */
    public static PaymentCardResponseDTO toResponseDTO(PaymentCard paymentCard, boolean maskCardNumber) {
        PaymentCardResponseDTO dto = new PaymentCardResponseDTO();
        
        dto.setId(paymentCard.getId());
        // Enum serializes to string (visa, mastercard, amex, discover)
        dto.setPaymentCardType(paymentCard.getPaymentCardType().name());
        dto.setExpirationDate(paymentCard.getExpirationDate());
        dto.setCardholderName(paymentCard.getCardholderName());
        dto.setIsDefault(paymentCard.getIsDefault());
        
        // Set card number (masked or unmasked based on parameter)
        String cardNumber = paymentCard.getCardNumber();
        if (maskCardNumber) {
            String masked = maskCardNumberValue(cardNumber);
            dto.setCardNumber(masked);  // Set masked value in cardNumber field for frontend compatibility
        } else {
            // Return full decrypted card number (for checkout auto-fill)
            String decrypted = cardNumber;
            try {
                decrypted = PaymentEncryptionUtil.decryptCardNumber(cardNumber);
            } catch (Exception e) {
                // Already decrypted or invalid format - use as is
                decrypted = cardNumber;
            }
            // Remove spaces for consistency
            dto.setCardNumber(decrypted.replaceAll("\\s+", ""));
        }
        
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
     * Convert PaymentCard entity to PaymentCardResponseDTO with masked card number (default behavior)
     * @param paymentCard - PaymentCard entity (may have encrypted or decrypted card number)
     * @return PaymentCardResponseDTO with masked card number
     */
    public static PaymentCardResponseDTO toResponseDTO(PaymentCard paymentCard) {
        return toResponseDTO(paymentCard, true);  // Default to masked for security
    }
    
    /**
     * Mask card number to show only last 4 digits
     * Handles both encrypted and decrypted card numbers
     * @param cardNumber - Card number (may be encrypted, decrypted, or null)
     * @return Masked card number (e.g., "**** **** **** 1234")
     */
    private static String maskCardNumberValue(String cardNumber) {
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

