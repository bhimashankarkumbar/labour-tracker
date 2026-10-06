package com.labourtracker.controller;

import com.labourtracker.dto.request.PaymentRequest;
import com.labourtracker.dto.response.PaymentResponse;
import com.labourtracker.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/daily-workers/{id}/payments")
    public ResponseEntity<PaymentResponse> recordPayment(
            @PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.recordPayment(id, request));
    }

    @GetMapping("/api/daily-workers/{id}/payments")
    public ResponseEntity<List<PaymentResponse>> getPayments(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentsForDailyWorker(id));
    }

    @GetMapping("/api/payments")
    public ResponseEntity<List<PaymentResponse>> getRecentPayments(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(paymentService.getRecentPayments(limit));
    }
}
