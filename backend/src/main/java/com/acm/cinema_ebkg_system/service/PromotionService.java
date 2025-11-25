package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.repository.PromotionRepository;
import com.acm.cinema_ebkg_system.model.Promotion;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.enums.DiscountType;
import com.acm.cinema_ebkg_system.enums.PromotionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.acm.cinema_ebkg_system.dto.promotion.PromotionDTO;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    public List<Promotion> getAllPromotions() {
        List<Promotion> promotions = promotionRepository.findAll();
        for (Promotion promotion : promotions) {
            updatePromotionStatus(promotion);
        }
        return promotionRepository.findAll();
    }

    public Optional<Promotion> getPromotionById(Long id) {
        Optional<Promotion> promotion = promotionRepository.findById(id);
        if (promotion.isPresent()) {
            updatePromotionStatus(promotion.get());
        }
        return promotion;
    }

    public Promotion createPromotion(PromotionDTO promotionDTO) {
        Promotion promotion = new Promotion();

        // Map DTO fields to entity fields
        promotion.setPromoCode(promotionDTO.getPromoCode());
        promotion.setTitle(promotionDTO.getTitle());
        promotion.setDescription(promotionDTO.getDescription());
        promotion.setImageLink(promotionDTO.getImageLink());
        promotion.setDiscountValue(promotionDTO.getDiscountValue());
        promotion.setDiscountType(promotionDTO.getDiscountType());
        promotion.setCreatedAt(LocalDateTime.now());
        promotion.setUpdatedAt(LocalDateTime.now());
        promotion.setStatus(PromotionStatus.inactive);
        promotion.setExpirationDate(promotionDTO.getExpirationDate());

        return promotionRepository.save(promotion);
    }

    public Promotion updatePromotion(Long id, PromotionDTO updatedPromotionDTO) {
        Optional<Promotion> existingPromotion = getPromotionById(id);
        if (existingPromotion.isPresent()) {

            if (existingPromotion.get().getStatus() == PromotionStatus.active) {
                throw new RuntimeException("Cannot update an active promotion");
            }
            
            Promotion promotion = existingPromotion.get();
        
            // Gets all fields from DTO
            String promoCode = updatedPromotionDTO.getPromoCode();
            String title = updatedPromotionDTO.getTitle();
            String description = updatedPromotionDTO.getDescription();
            String imageLink = updatedPromotionDTO.getImageLink();
            java.math.BigDecimal discountValue = updatedPromotionDTO.getDiscountValue();
            DiscountType discountType = updatedPromotionDTO.getDiscountType();
            LocalDateTime expirationDate = updatedPromotionDTO.getExpirationDate();
            PromotionStatus status = updatedPromotionDTO.getStatus();
            
            // Update only non-null fields
            if (promoCode != null) promotion.setPromoCode(promoCode);
            if (title != null) promotion.setTitle(title);
            if (description != null) promotion.setDescription(description);
            if (imageLink != null) promotion.setImageLink(imageLink);
            if (discountValue != null) promotion.setDiscountValue(discountValue);
            if (discountType != null) promotion.setDiscountType(discountType);
            if (expirationDate != null) promotion.setExpirationDate(expirationDate);            
            if (status != null) { 
                promotion.setStatus(status);
                if (status == PromotionStatus.active) {
                    List<User> enrolledUsers = userService.getAllUsersEnrolledForPromotions();
                    System.out.println("Found users: " + enrolledUsers.size());
                    for (User user : enrolledUsers) {
                        try {
                            emailService.sendPromotionToEnrolledUsers(user.getEmail(), promotion);
                        } catch (Exception e) {
                            System.err.println("Failed to send email to " + user.getEmail() + ": " + e.getMessage());
                        }
                    }
                }
            }

            promotion.setUpdatedAt(LocalDateTime.now());

            return promotionRepository.save(promotion);
        }
        throw new RuntimeException("promotion not found");
    }

    public void deletePromotion(Long id) {
        Optional<Promotion> existingPromotion = getPromotionById(id);
        if (existingPromotion.isPresent()) {
            if (existingPromotion.get().getStatus() == PromotionStatus.active) {
                throw new RuntimeException("Cannot delete an active promotion");
            }
        } else {
            throw new RuntimeException("promotion not found");
        }

        promotionRepository.deleteById(id);
    }

    private void updatePromotionStatus(Promotion promotion) {
        if (promotion.getExpirationDate().isBefore(LocalDateTime.now())) {
            promotion.setStatus(PromotionStatus.inactive);
            promotionRepository.save(promotion);
        }
    }
}
