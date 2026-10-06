package com.labourtracker.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long dailyWorkerId;
    private Long workerId;
    private String workerName;
    private Long workId;
    private String workName;
    private LocalDate workDate;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String transactionReference;
    private String notes;
    private LocalDateTime createdAt;
}
