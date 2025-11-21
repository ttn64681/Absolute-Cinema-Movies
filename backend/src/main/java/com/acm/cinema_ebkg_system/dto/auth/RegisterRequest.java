package com.acm.cinema_ebkg_system.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

import com.acm.cinema_ebkg_system.dto.payment.PaymentCardRequestDTO;

/**
 * Registration Request DTO
 * 
 * Used by:
 * - AuthController.register() → Request
 * 
 * Contains user account info, optional home address, and optional payment cards (up to 3)
 * Response: AuthResponse with JWT tokens and user info
 * 
 * Note: paymentCards is a List<PaymentCardRequestDTO>, max 3 cards allowed
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    // User Info
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean enrolledForPromotions;
    
    // Optional Home Address fields
    private String homeAddress;
    private String homeCity;
    private String homeState;
    private String homeZip;
    private String homeCountry;
    
    // Optional Payment Card(s)
    private List<PaymentCardRequestDTO> paymentCards; // Up to 3 payment cards
}
