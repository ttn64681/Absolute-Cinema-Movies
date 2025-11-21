package com.acm.cinema_ebkg_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.acm.cinema_ebkg_system.dto.payment.PaymentRequest;
import com.acm.cinema_ebkg_system.model.PaymentInfo;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.service.PaymentService;

@RestController
@RequestMapping("/api/users/{userId}/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // GET /api/users/{userId}/payment - Get user's payment information
    @GetMapping("/")
    public List<PaymentInfo> getUserPaymentInfo(@PathVariable Long userId) throws Exception {
        return paymentService.getUserPaymentInfo(userId);
    }

    // POST /api/users/{userId}/payment - Add new payment info for user
    @PostMapping("/")
    public User addPaymentInfo(@PathVariable Long userId, @RequestBody PaymentRequest dtoPayment) throws Exception {
        return paymentService.addPaymentInfo(userId, dtoPayment);
    }

    @PutMapping("/{paymentId}")
    public User updatePaymentInfo(@PathVariable Long userId, @PathVariable Long paymentId, @RequestBody PaymentRequest dtoPayment) throws Exception {
        return paymentService.updatePaymentInfo(userId, paymentId, dtoPayment);
    }

    @DeleteMapping("/{paymentId}")
    public User deletePaymentInfo(@PathVariable Long userId, @PathVariable Long paymentId) {
        return paymentService.deletePaymentInfo(userId, paymentId);        
    }
    
}
