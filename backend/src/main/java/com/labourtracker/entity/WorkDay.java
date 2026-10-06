package com.labourtracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single working day for a work/project.
 * Dates are NOT consecutive — the user decides when work happens.
 * A unique constraint prevents duplicate dates for the same work.
 */
@Entity
@Table(name = "work_days",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_work_day_date", columnNames = {"work_id", "work_date"})
        },
        indexes = {
                @Index(name = "idx_work_days_work_id", columnList = "work_id"),
                @Index(name = "idx_work_days_work_date", columnList = "work_date")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkDay extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_id", nullable = false)
    private Work work;

    /**
     * Sequential day number within the work (e.g., Day 1, Day 2, Day 3...).
     * Calculated on insertion.
     */
    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "workDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DailyWorker> dailyWorkers = new ArrayList<>();
}
