package com.labourtracker.service;

import com.labourtracker.dto.request.PaymentRequest;
import com.labourtracker.dto.response.PaymentResponse;
import com.labourtracker.entity.DailyWorker;
import com.labourtracker.entity.Payment;
import com.labourtracker.exception.InvalidPaymentException;
import com.labourtracker.exception.ResourceNotFoundException;
import com.labourtracker.repository.DailyWorkerRepository;
import com.labourtracker.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final DailyWorkerRepository dailyWorkerRepository;

    /**
     * Records a payment for a DailyWorker assignment.
     *
     * Business rules:
     * 1. Amount must be > 0 (enforced by @Positive in DTO)
     * 2. Total paid cannot exceed daily wage
     * 3. Payment history is immutable — no updates allowed
     */
    public PaymentResponse recordPayment(Long dailyWorkerId, PaymentRequest request) {
        DailyWorker dailyWorker = dailyWorkerRepository.findById(dailyWorkerId)
                .orElseThrow(() -> new ResourceNotFoundException("DailyWorker", "id", dailyWorkerId));

        BigDecimal remaining = dailyWorker.getRemainingAmount();

        if (request.getAmount().compareTo(remaining) > 0) {
            throw new InvalidPaymentException(
                    String.format("Payment of ₹%.2f exceeds outstanding amount of ₹%.2f. " +
                                    "Paid so far: ₹%.2f, Daily wage: ₹%.2f.",
                            request.getAmount(), remaining,
                            dailyWorker.getTotalPaid(), dailyWorker.getDailyWage())
            );
        }

        Payment payment = Payment.builder()
                .dailyWorker(dailyWorker)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate())
                .paymentMethod(request.getPaymentMethod() != null ?
                        request.getPaymentMethod() : Payment.PaymentMethod.CASH)
                .transactionReference(request.getTransactionReference())
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsForDailyWorker(Long dailyWorkerId) {
        if (!dailyWorkerRepository.existsById(dailyWorkerId)) {
            throw new ResourceNotFoundException("DailyWorker", "id", dailyWorkerId);
        }
        return paymentRepository.findByDailyWorkerIdOrderByPaymentDateDesc(dailyWorkerId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getRecentPayments(int limit) {
        return paymentRepository.findAllWithDetails(PageRequest.of(0, limit))
                .stream().map(this::mapToResponse).toList();
    }

    private PaymentResponse mapToResponse(Payment p) {
        DailyWorker dw = p.getDailyWorker();
        return PaymentResponse.builder()
                .id(p.getId())
                .dailyWorkerId(dw.getId())
                .workerId(dw.getWorker().getId())
                .workerName(dw.getWorker().getName())
                .workId(dw.getWorkDay().getWork().getId())
                .workName(dw.getWorkDay().getWork().getWorkName())
                .workDate(dw.getWorkDay().getWorkDate())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .paymentMethod(p.getPaymentMethod().name())
                .transactionReference(p.getTransactionReference())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
