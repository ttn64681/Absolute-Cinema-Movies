package com.acm.cinema_ebkg_system.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

import com.acm.cinema_ebkg_system.dto.payment.PaymentCardDTO;
import com.acm.cinema_ebkg_system.enums.*;

/**
 * Registration Request DTO
 * 
 * Design Decision: Uses PaymentCardDTO instead of nested class
 * to follow DRY principle and maintain single source of truth
 * for payment card structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean enrolledForPromotions;
    
    // Home address fields (optional)
    private String homeAddress;
    private String homeCity;
    private String homeState;
    private String homeZip;
    private String homeCountry;
    
    // Use PaymentCardDTO instead of nested class (DRY principle)
    // Note: userId will be set by backend after user creation
    private List<PaymentCardDTO> paymentCards; // Up to 3 payment cards
}
