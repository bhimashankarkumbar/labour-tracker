package com.labourtracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Non-labour expenses for a work (materials, transport, food, etc.)
 */
@Entity
@Table(name = "expenses", indexes = {
        @Index(name = "idx_expenses_work_id", columnList = "work_id"),
        @Index(name = "idx_expenses_expense_date", columnList = "expense_date"),
        @Index(name = "idx_expenses_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_id", nullable = false)
    private Work work;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Category category;

    @Column(length = 300)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    public enum Category {
        MATERIALS, TRANSPORT, FOOD, EQUIPMENT, FUEL, ELECTRICITY, OTHER
    }
}
