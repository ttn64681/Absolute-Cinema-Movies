package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.payment.PaymentCardRequestDTO;
import com.acm.cinema_ebkg_system.dto.payment.PaymentCardResponseDTO;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.repository.PaymentCardRepository;
import com.acm.cinema_ebkg_system.repository.AddressRepository;
import com.acm.cinema_ebkg_system.service.AddressService;
import com.acm.cinema_ebkg_system.service.UserService;
import com.acm.cinema_ebkg_system.util.PaymentEncryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Payment Card Service
 */
@Service
public class PaymentCardService {
    
    @Autowired // Spring automatically provides repository instance (dependency injection)
    private PaymentCardRepository paymentCardRepository;
    
    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private AddressService addressService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Get all payment cards for a user (default first) with decrypted card numbers
     * @param userId - Long: User ID
     * @return List<PaymentCard>: Payment cards ordered by default status with decrypted card numbers
     */
    public List<PaymentCard> getUserPaymentCards(Long userId) {
        List<PaymentCard> cards = paymentCardRepository.findByUserIdOrderByIsDefaultDesc(userId);
        // Decrypt card numbers
        for (PaymentCard card : cards) {
            try {
                if (card.getCardNumber() != null) {
                    String decrypted = PaymentEncryptionUtil.decryptCardNumber(card.getCardNumber());
                    card.setCardNumber(decrypted);
                }
            } catch (Exception e) {
                // Card number might already be decrypted (from old data)
                // Just keep the original value
                System.out.println("Warning: Could not decrypt card number for card " + card.getId() + ", assuming already decrypted");
            }
        }
        return cards;
    }
    
    /**
     * Get user's default payment card with decrypted card number
     * @param userId - Long: User ID
     * @return Optional<PaymentCard>: Default card if exists, empty if not
     */
    public Optional<PaymentCard> getUserDefaultCard(Long userId) {
        Optional<PaymentCard> card = paymentCardRepository.findByUserIdAndIsDefault(userId, true);
        if (card.isPresent()) {
            try {
                if (card.get().getCardNumber() != null) {
                    String decrypted = PaymentEncryptionUtil.decryptCardNumber(card.get().getCardNumber());
                    card.get().setCardNumber(decrypted);
                }
            } catch (Exception e) {
                // Card number might already be decrypted (from old data)
                System.out.println("Warning: Could not decrypt card number for card " + card.get().getId() + ", assuming already decrypted");
            }
        }
        return card;
    }
    
    /**
     * Get payment card by ID with decrypted card number
     * @param cardId - Long: Payment card ID
     * @return Optional<PaymentCard>: Card if exists, empty if not
     */
    public Optional<PaymentCard> getPaymentCardById(Long cardId) {
        Optional<PaymentCard> card = paymentCardRepository.findById(cardId);
        if (card.isPresent()) {
            try {
                if (card.get().getCardNumber() != null) {
                    String decrypted = PaymentEncryptionUtil.decryptCardNumber(card.get().getCardNumber());
                    card.get().setCardNumber(decrypted);
                }
            } catch (Exception e) {
                // Card number might already be decrypted (from old data)
                System.out.println("Warning: Could not decrypt card number for card " + cardId + ", assuming already decrypted");
            }
        }
        return card;
    }
    
    /**
     * Create a new payment card (auto-sets as default if first card, ensures only one default)
     * @param paymentCard - PaymentCard: Card object with user_id, address_id, card_number, cardholder_name, payment_card_type, expiration_date, cvv
     * @return PaymentCard: Created card with generated ID and timestamps
     */
    @Transactional
    public PaymentCard createPaymentCard(PaymentCard paymentCard) {
        // Encrypt card number before saving
        try {
            if (paymentCard.getCardNumber() != null) {
                String encrypted = PaymentEncryptionUtil.encryptCardNumber(paymentCard.getCardNumber());
                paymentCard.setCardNumber(encrypted);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting card number", e);
        }
        
        List<PaymentCard> existingCards = paymentCardRepository.findByUserIdOrderByIsDefaultDesc(paymentCard.getUser().getId());
        
        // If this is the first card for the user, make it default
        if (existingCards.isEmpty()) {
            paymentCard.setIsDefault(true);
        } else {
            // Ensure only one default card exists
            // If new card is marked as default, unset all other defaults
            if (paymentCard.getIsDefault() != null && paymentCard.getIsDefault()) {
                for (PaymentCard card : existingCards) {
                    card.setIsDefault(false);
                    paymentCardRepository.save(card);
                }
            } else {
                // If not marked as default, explicitly set to false
                paymentCard.setIsDefault(false);
            }
        }
        
        PaymentCard saved = paymentCardRepository.save(paymentCard);
        
        // Decrypt for return
       /* try {
            if (saved.getCardNumber() != null) {
                String decrypted = PaymentEncryptionUtil.decryptCardNumber(saved.getCardNumber());
                saved.setCardNumber(decrypted);
            }
        } catch (Exception e) {
            // Shouldn't happen since we just encrypted it, but handle gracefully
            System.out.println("Warning: Could not decrypt newly saved card number");
        } */
        
        return saved;
    }
    
    /**
     * Update an existing payment card
     * @param paymentCard - PaymentCard: Card object with ID and updated fields
     * @return PaymentCard: Updated card
     */
    public PaymentCard updatePaymentCard(PaymentCard paymentCard) {
        // Encrypt card number before saving
        try {
            if (paymentCard.getCardNumber() != null) {
                String encrypted = PaymentEncryptionUtil.encryptCardNumber(paymentCard.getCardNumber());
                paymentCard.setCardNumber(encrypted);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting card number", e);
        }
        
        PaymentCard saved = paymentCardRepository.save(paymentCard);
        
        // Decrypt for return
        try {
            if (saved.getCardNumber() != null) {
                String decrypted = PaymentEncryptionUtil.decryptCardNumber(saved.getCardNumber());
                saved.setCardNumber(decrypted);
            }
        } catch (Exception e) {
            // Shouldn't happen since we just encrypted it, but handle gracefully
            System.out.println("Warning: Could not decrypt newly saved card number");
        }
        
        return saved;
    }
    
    /**
     * Delete a payment card and its associated billing address
     * @param paymentCardId - Long: Card ID to delete
     */
    @Transactional
    public void deletePaymentCard(Long paymentCardId) {
        // Get the payment card to find its address_id
        PaymentCard paymentCard = paymentCardRepository.findById(paymentCardId)
            .orElseThrow(() -> new RuntimeException("Payment card not found"));
        
        // Get the address ID
        Long addressId = paymentCard.getAddressId();
        
        // Delete the payment card
        paymentCardRepository.deleteById(paymentCardId);
        
        // Delete the associated billing address
        if (addressId != null) {
            addressRepository.deleteById(addressId);
        }
    }
    
    /**
     * Set a payment card as default (removes default from others)
     * @param userId - Long: User ID
     * @param paymentCardId - Long: Card ID to set as default
     */
    @Transactional // Ensures all card updates succeed or fail together (atomicity)
    public void setDefaultCard(Long userId, Long paymentCardId) {
        // Remove default from all cards
        List<PaymentCard> userCards = getUserPaymentCards(userId);
        for (PaymentCard card : userCards) {
            card.setIsDefault(false);
            paymentCardRepository.save(card);
        }
        
        // Set new default
        Optional<PaymentCard> newDefaultCard = paymentCardRepository.findById(paymentCardId);
        if (newDefaultCard.isPresent()) {
            newDefaultCard.get().setIsDefault(true);
            paymentCardRepository.save(newDefaultCard.get());
        }
    }

    /**
     * Get all payment cards for a user with billing addresses loaded
     * 
     * @param userId User ID
     * @return List of payment cards with addresses loaded
     */
    public List<PaymentCard> getUserPaymentCardsWithAddresses(Long userId) {
        List<PaymentCard> cards = getUserPaymentCards(userId);
        // Load billing address for each card
        for (PaymentCard card : cards) {
            if (card.getAddressId() != null) {
                Optional<Address> address = addressService.getAddressById(card.getAddressId());
                address.ifPresent(card::setAddress);
            }
        }
        return cards;
    }

    /**
     * Create payment card from DTO (includes address creation)
     * 
     * @param dto PaymentCardDTO containing card and billing address information
     * @return Created PaymentCard
     */
    @Transactional
    public PaymentCard createPaymentCardFromDto(PaymentCardRequestDTO dto) {
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
        
        return createPaymentCard(paymentCard);
    }

    /**
     * Update payment card from DTO (includes address update)
     * 
     * @param paymentCardId Payment card ID to update
     * @param dto PaymentCardDTO containing updated card and billing address information
     * @return Updated PaymentCard
     */
    @Transactional
    public PaymentCard updatePaymentCardFromDto(Long paymentCardId, PaymentCardRequestDTO dto) {
        // Get existing payment card
        PaymentCard existingCard = getPaymentCardById(paymentCardId)
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
        
        return updatePaymentCard(existingCard);
    }
}
