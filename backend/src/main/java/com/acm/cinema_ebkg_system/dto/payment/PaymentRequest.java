package com.acm.cinema_ebkg_system.dto.payment;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LEGACY - Payment Request DTO for old PaymentInfo system
 * 
 * @deprecated This DTO is for the legacy PaymentInfo system (PaymentController).
 * Use PaymentCardRequestDTO and PaymentCardController for new payment card functionality.
 * 
 * Status: Still used by PaymentController/PaymentService but NOT used by frontend.
 * Consider migrating to PaymentCard system before removing.
 */
@Deprecated
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    
    private String cardholder_name;
    private String card_number;
    private String billing_address;
    private LocalDate expiration_date;
}
