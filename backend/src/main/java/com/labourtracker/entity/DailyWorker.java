package com.labourtracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Assignment of a worker to a specific work day.
 * Stores the ACTUAL wage for that specific day — separate from worker.defaultWage.
 * This ensures historical wages are preserved even if the worker's default changes.
 *
 * Unique constraint prevents assigning the same worker twice to the same work day.
 */
@Entity
@Table(name = "daily_workers",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_daily_worker", columnNames = {"work_day_id", "worker_id"})
        },
        indexes = {
                @Index(name = "idx_daily_workers_work_day_id", columnList = "work_day_id"),
                @Index(name = "idx_daily_workers_worker_id", columnList = "worker_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyWorker extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_day_id", nullable = false)
    private WorkDay workDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    /**
     * Actual wage for this specific day. Historical — never changed retroactively.
     */
    @Column(name = "daily_wage", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyWage;

    @OneToMany(mappedBy = "dailyWorker", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    /**
     * Calculates total amount paid for this daily worker assignment.
     */
    public BigDecimal getTotalPaid() {
        return payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates remaining (unpaid) amount for this daily worker assignment.
     */
    public BigDecimal getRemainingAmount() {
        return dailyWage.subtract(getTotalPaid());
    }

    /**
     * Derives payment status from actual payments vs. wage.
     */
    public PaymentStatus getPaymentStatus() {
        BigDecimal paid = getTotalPaid();
        if (paid.compareTo(BigDecimal.ZERO) == 0) return PaymentStatus.UNPAID;
        if (paid.compareTo(dailyWage) >= 0) return PaymentStatus.PAID;
        return PaymentStatus.PARTIALLY_PAID;
    }

    public enum PaymentStatus {
        UNPAID, PARTIALLY_PAID, PAID
    }
}
