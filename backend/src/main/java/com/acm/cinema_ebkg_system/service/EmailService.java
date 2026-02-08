package com.acm.cinema_ebkg_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import com.acm.cinema_ebkg_system.model.Promotion;

/**
 * Email Service - Handles sending emails for various system operations
 * 
 * This service manages email operations including sending verification emails,
 * password reset emails, and other notifications.
 * 
 * Key Features:
 * - Email verification link generation and sending
 * - Password reset email support
 * - Configurable email templates
 * - Error handling for email failures
 * 
 * Configuration:
 * Requires email settings in application.properties:
 * - spring.mail.host
 * - spring.mail.port
 * - spring.mail.username
 * - spring.mail.password
 * - app.base.url (for verification links)
 * 
 * @author Vishal
 * @version 1.0
 */
@Service
@Slf4j
public class EmailService {

    // ========== DEPENDENCY INJECTION ==========
    
    @Autowired
    private JavaMailSender mailSender;

    // ========== CONFIGURATION PROPERTIES ==========
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // ========== EMAIL SENDING METHODS ==========
    
    /**
     * Send verification email to user with a unique token
     * 
     * This method sends an email containing a verification link that the user
     * must click to activate their account.
     * 
     * Process Flow:
     * 1. Create email message with recipient details
     * 2. Generate verification URL with token
     * 3. Set email subject and body with verification instructions
     * 4. Send the email
     * 
     * @param toEmail Recipient's email address
     * @param verificationToken Unique token for email verification
     * @throws RuntimeException if email sending fails
     */
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            // Step 1: Create email message
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            
            // Step 2: Set email subject
            message.setSubject("Cinema Booking System - Email Verification");
            
            // Step 3: Generate verification URL
            String verificationUrl = frontendUrl + "/auth/verify-email?token=" + verificationToken;
            
            // Step 4: Set email body with instructions
            String emailBody = "Welcome to Cinema Booking System!\n\n"
                    + "Thank you for registering with us. To complete your registration and activate your account, "
                    + "please click the link below:\n\n"
                    + verificationUrl + "\n\n"
                    + "This link will expire in 24 hours.\n\n"
                    + "If you did not create an account, please ignore this email.\n\n"
                    + "Best regards,\n"
                    + "Cinema Booking System Team";
            
            message.setText(emailBody);
            
            // Step 5: Send the email
            mailSender.send(message);
            
            log.debug("Verification email sent successfully to: {}", toEmail);
            log.debug("Verification URL: {}", verificationUrl);
            log.debug("Note: account_status will be updated to 'active' upon email verification");

        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }

    /**
     * Send password reset email to user
     * 
     * This method sends an email containing a password reset link.
     * Can be implemented in the future when password reset functionality is needed.
     * 
     * @param toEmail Recipient's email address
     * @param resetToken Unique token for password reset
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Cinema Booking System - Password Reset");
            
            String resetUrl = frontendUrl + "/auth/reset-password?token=" + resetToken;
            
            String emailBody = "Hello,\n\n"
                    + "We received a request to reset your password. "
                    + "Click the link below to reset your password:\n\n"
                    + resetUrl + "\n\n"
                    + "This link will expire in 1 hour.\n\n"
                    + "If you did not request a password reset, please ignore this email.\n\n"
                    + "Best regards,\n"
                    + "Cinema Booking System Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.debug("Password reset email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage());
        }
    }

    public void sendEditProfileConfirmationEmail(String toEmail, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ACM Cinemas - User Profile Updated");

            String emailBody = "Hello " + name + ", \n\n"
                + "Your profile settings have been successfully updated.\n"
                + "Best regards,\n"
                + "ACM Cinema Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.debug("Confirmation email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send confirmation email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send confirmation email: " + e.getMessage());
        }
    }

    public void sendChangePasswordConfirmationEmail(String toEmail, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ACM Cinemas - Password Change Notification");

            String emailBody = "Hello " + name + ", \n\n"
                + "You are receiving this email to confirm that your password has been changed successfully.\n"
                + "If you did not change your password, please reach out to us immediately so we can secure your account.\n"
                + "Best regards,\n"
                + "ACM Cinema Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.debug("Confirmation email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send confirmation email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send confirmation email: " + e.getMessage());
        }
    }

    /**
     * Send promotion enrollment email to user
     * 
     * This method sends an email notifying users about promotions they've enrolled for.
     * It includes information about current promotions and special offers.
     * 
     * @param toEmail Recipient's email address
     * @param name Recipient's first name
     */
    public void sendPromotionEnrollmentEmail(String toEmail, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ACM Cinemas - Welcome to Promotions!");

            String emailBody = "Hello " + name + ", \n\n"
                + "Thank you for enrolling in our promotional notifications!\n\n"
                + "As a valued subscriber, you will receive:\n"
                + "• Exclusive movie ticket discounts\n"
                + "• Special promotions and offers\n"
                + "• Early access to new releases\n"
                + "• Birthday specials and rewards\n\n"
                + "Stay tuned for our latest offers and watch amazing movies at great prices!\n\n"
                + "If you have any questions or concerns, please don't hesitate to contact us.\n\n"
                + "Best regards,\n"
                + "ACM Cinema Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.debug("Promotion enrollment email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send promotion enrollment email to: {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendPromotionToEnrolledUsers(String toEmail, Promotion promotion) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(promotion.getTitle());
            message.setText(promotion.getDescription());

            mailSender.send(message);

            log.debug("Promotion enrollment email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send promotion enrollment email to: {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendPaymentCardEmail(String toEmail, String name, String crud) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ACM Cinemas - PaymentCard Updated");

            String emailBody = "Hello " + name + ", \n\n"
                + "Your payment card has been successfully " + crud +  ".\n"
                + "Best regards,\n"
                + "ACM Cinema Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.debug("Confirmation email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send confirmation email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send confirmation email: " + e.getMessage());
        }
    }

    /**
     * Send order confirmation email to user after successful payment
     * 
     * @param toEmail Recipient's email address
     * @param userName User's first name
     * @param bookingId Booking ID
     * @param movieTitle Movie title
     * @param showDateTime Show date and time
     * @param seats List of seat identifiers (e.g., "A1, A2, B3")
     * @param numTickets Number of tickets
     * @param totalAmount Total amount paid
     * @param promotionName Promotion name if applied (null if no promotion)
     */
    public void sendOrderConfirmationEmail(String toEmail, String userName, Long bookingId, 
            String movieTitle, String showDateTime, String seats, Integer numTickets, 
            java.math.BigDecimal totalAmount, String promotionName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ACM Cinemas - Order Confirmation #" + bookingId);

            StringBuilder emailBody = new StringBuilder();
            emailBody.append("Hello ").append(userName).append(",\n\n");
            emailBody.append("Thank you for your purchase! Your order has been confirmed.\n\n");
            emailBody.append("ORDER DETAILS:\n");
            emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            emailBody.append("Booking ID: #").append(bookingId).append("\n");
            emailBody.append("Movie: ").append(movieTitle).append("\n");
            emailBody.append("Show Date & Time: ").append(showDateTime).append("\n");
            emailBody.append("Seats: ").append(seats).append("\n");
            emailBody.append("Number of Tickets: ").append(numTickets).append("\n");
            if (promotionName != null && !promotionName.isEmpty()) {
                emailBody.append("Promotion Applied: ").append(promotionName).append("\n");
            }
            emailBody.append("Total Amount: $").append(totalAmount).append("\n");
            emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
            emailBody.append("Please arrive at least 15 minutes before the show time.\n");
            emailBody.append("Present this confirmation email or your booking ID at the theater.\n\n");
            emailBody.append("We look forward to seeing you at the movies!\n\n");
            emailBody.append("Best regards,\n");
            emailBody.append("ACM Cinema Team");

            message.setText(emailBody.toString());
            mailSender.send(message);

            log.debug("Order confirmation email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email to: {}", toEmail, e);
            // Don't throw exception - email failure shouldn't block payment completion
        }
    }
}

