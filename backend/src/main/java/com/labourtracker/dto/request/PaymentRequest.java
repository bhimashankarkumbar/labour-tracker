package com.labourtracker.dto.request;

import com.labourtracker.entity.Payment;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    private Payment.PaymentMethod paymentMethod = Payment.PaymentMethod.CASH;

    private String transactionReference;

    private String notes;
}
