package com.acm.cinema_ebkg_system.dto.payment;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Payment Card Response DTO - Returns payment card information with masked card numbers
 * 
 * Security: Masks card numbers to show only last 4 digits
 * Never expose entities directly - use DTOs to control what data is returned
 * 
 * Note: Uses 'cardNumber' field name for frontend compatibility, but value is masked
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCardResponseDTO {
    private Long id;
    private String paymentCardType;  // "visa", "mastercard", "amex", "discover" (frontend format)
    private String cardNumber;  // Masked: "**** **** **** 1234" (for frontend compatibility)
    private String expirationDate;
    private String cardholderName;
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZip;
    private String billingCountry;
    private Boolean isDefault;
}

