package com.labourtracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a labourer worker.
 * Workers exist independently from works.
 * defaultWage is just a default — actual daily wage is stored in DailyWorker.
 */
@Entity
@Table(name = "workers", indexes = {
        @Index(name = "idx_workers_status", columnList = "status"),
        @Index(name = "idx_workers_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(name = "worker_type", length = 50)
    private String workerType;

    /**
     * Default wage used as a suggestion when assigning a worker to a work day.
     * Changing this does NOT affect historical daily wages already recorded.
     */
    @Column(name = "default_wage", precision = 10, scale = 2)
    private BigDecimal defaultWage;

    @Column(length = 300)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "worker")
    @Builder.Default
    private List<DailyWorker> dailyWorkers = new ArrayList<>();

    public enum Status {
        ACTIVE, INACTIVE
    }
}
