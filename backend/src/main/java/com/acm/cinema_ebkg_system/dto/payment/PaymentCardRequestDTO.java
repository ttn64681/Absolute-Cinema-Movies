package com.acm.cinema_ebkg_system.dto.payment;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.acm.cinema_ebkg_system.enums.PaymentCardType;

/**
 * Payment Card Request DTO - Used for creating and updating payment cards
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCardRequestDTO {
    private Long userId;
    private PaymentCardType cardType;
    private String cardNumber;
    private String expirationDate;
    private String cardholderName;
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZip;
    private String billingCountry;
    private Boolean isDefault;
}



