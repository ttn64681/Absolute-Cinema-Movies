package com.acm.cinema_ebkg_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
            
            System.out.println("Verification email sent successfully to: " + toEmail);
            System.out.println("Verification URL: " + verificationUrl); // For development/testing
            System.out.println("Note: account_status will be updated to 'active' upon email verification");
            
        } catch (Exception e) {
            System.err.println("=== EMAIL SENDING ERROR ===");
            System.err.println("Failed to send verification email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("===========================");
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
            
            System.out.println("Password reset email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Failed to send password reset email to: " + toEmail);
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
            
            System.out.println("Confirmation email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email to: " + toEmail);
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
            
            System.out.println("Confirmation email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email to: " + toEmail);
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
            
            System.out.println("Promotion enrollment email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send promotion enrollment email to: " + toEmail);
            // Don't throw exception - promotion enrollment failure shouldn't block user registration/profile update
            System.err.println("Error: " + e.getMessage());
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

            System.out.println("Promotion enrollment email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Failed to send promotion enrollment email to: " + toEmail);            
            System.err.println("Error: " + e.getMessage());
        }
    }
}

