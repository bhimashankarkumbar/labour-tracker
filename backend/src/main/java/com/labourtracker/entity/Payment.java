package com.labourtracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Records a single payment transaction for a DailyWorker assignment.
 * Payment history is immutable — records are never modified, only created.
 * Multiple payments can be made for a single DailyWorker.
 */
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_daily_worker_id", columnList = "daily_worker_id"),
        @Index(name = "idx_payments_payment_date", columnList = "payment_date")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_worker_id", nullable = false)
    private DailyWorker dailyWorker;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum PaymentMethod {
        CASH, UPI, BANK_TRANSFER, OTHER
    }
}
