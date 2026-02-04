package com.acm.cinema_ebkg_system.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.acm.cinema_ebkg_system.dto.payment.PaymentRequest;
import com.acm.cinema_ebkg_system.model.PaymentInfo;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.repository.UserRepository;
import com.acm.cinema_ebkg_system.util.PaymentEncryptionUtil;


/**
 * Payment Service
 * 
 * Handles CRUD operations for user payment information.
 * 
 * NOT BEING USED (PaymentCardService is being used instead)
 */
@Service
public class PaymentService {

    @Autowired
    private UserRepository userRepository;  // Data access layer for user operations

    /**
     * Retrieve user by unique ID
     * 
     * @param id User's unique identifier
     * @return User User object
     * @throws RuntimeException if user not found
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<PaymentInfo> getUserPaymentInfo(Long userId) throws Exception {
        User user = getUserById(userId);
        List<PaymentInfo> decryptedPayments = user.getPaymentInfos();

        decryptedPayments.forEach(payment -> {
            try {
                String decryptedCard = PaymentEncryptionUtil.decryptCardNumber(payment.getCard_number());
                payment.setCard_number(decryptedCard);
            } catch (Exception e) {
                throw new RuntimeException("Error decrypting card number", e);
            }
        });

        return decryptedPayments;
    }

    public User addPaymentInfo(Long id, PaymentRequest dtoPayment) throws Exception {
        // Get user from database using UserRepository
        User user = getUserById(id);
        
        // Create new PaymentInfo object (the model)
        PaymentInfo paymentInfo = new PaymentInfo();

        String encryptedCardNumber = PaymentEncryptionUtil.encryptCardNumber(dtoPayment.getCard_number());

        // Extract payment data from DTO
        String cardNumber = encryptedCardNumber;
        String billingAddress = dtoPayment.getBilling_address();
        LocalDate expirationDate = dtoPayment.getExpiration_date();
        String cardholderName = dtoPayment.getCardholder_name();

        // Set payment fields using setters
        paymentInfo.setCard_number(cardNumber);
        paymentInfo.setBilling_address(billingAddress);
        paymentInfo.setExpiration_date(expirationDate);
        paymentInfo.setCardholder_name(cardholderName);
        paymentInfo.setUser(user); // Set the JPA relationship

        // Add to user's payment list (JPA relationship)
        if (user.getPaymentInfos().size() < 3) {
            user.getPaymentInfos().add(paymentInfo);
        }
        
        // Save user - JPA automatically saves PaymentInfo too! (cascade = CascadeType.ALL)
        return userRepository.save(user);
    }

    public User updatePaymentInfo(Long userId, Long paymentInfoId, PaymentRequest dtoPayment) throws Exception {

        // Gets user and their associated payment information (0-3)
        User user = getUserById(userId);
        List<PaymentInfo> userPaymentInfos = user.getPaymentInfos();
        PaymentInfo updatedPaymentInfo = null;
        
        // Checks to see if passed in payment info ID matches the user's payment info ID
        int counter = 0;
        int index = -1;
        for (PaymentInfo currentPaymentInfo : userPaymentInfos) {

            // If found a match, sets the currentPaymentInfo to a new "updatedPaymentInfo" object
            if (currentPaymentInfo.getPayment_info_id() == paymentInfoId) {
                updatedPaymentInfo = currentPaymentInfo;
                index = counter;
            }
            counter++;
        }

        // Checks to see if the payment info ID was found
        if (updatedPaymentInfo != null) {

            String encryptedCardNumber = PaymentEncryptionUtil.encryptCardNumber(dtoPayment.getCard_number());

            // "updatedPaymentInfo" object is updated to whatever is passed in through dtoPayment
            String cardNumber = encryptedCardNumber;
            String billingAddress = dtoPayment.getBilling_address();
            LocalDate expirationDate = dtoPayment.getExpiration_date();
            String cardholderName = dtoPayment.getCardholder_name();
            
            if (cardNumber != null) updatedPaymentInfo.setCard_number(cardNumber);
            if (billingAddress != null) updatedPaymentInfo.setBilling_address(billingAddress);
            if (expirationDate != null) updatedPaymentInfo.setExpiration_date(expirationDate);
            if (cardholderName != null) updatedPaymentInfo.setCardholder_name(cardholderName);

            // Replace the "currentPaymentInfo" with "updatedPaymentInfo"
            List<PaymentInfo> updatedPaymentInfos = user.getPaymentInfos();
            updatedPaymentInfos.remove(index);
            updatedPaymentInfos.add(index, updatedPaymentInfo);
            user.setPaymentInfos(updatedPaymentInfos);
        }

        return userRepository.save(user);
    }

    public User deletePaymentInfo(Long userId, Long paymentInfoId) {
        User user = getUserById(userId);
        List<PaymentInfo> userPaymentInfos = user.getPaymentInfos();        
        
        // Checks to see if passed in payment info ID matches the user's payment info ID
        int counter = 0;
        int index = -1;
        for (PaymentInfo currentPaymentInfo : userPaymentInfos) {

            // Removed payment info if match found
            if (currentPaymentInfo.getPayment_info_id() == paymentInfoId) {
                index = counter;
            }
            counter++;
        }

        List<PaymentInfo> newPaymentInfos = user.getPaymentInfos();
        newPaymentInfos.remove(index);
        user.setPaymentInfos(newPaymentInfos);

        return userRepository.save(user);
    }
    
    

}
