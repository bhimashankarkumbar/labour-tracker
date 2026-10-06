package com.labourtracker.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WorkerResponse {
    private Long id;
    private String name;
    private String phone;
    private String workerType;
    private BigDecimal defaultWage;
    private String address;
    private String status;
    private String notes;
    private Long totalDaysWorked;
    private BigDecimal totalEarned;
    private BigDecimal totalPaid;
    private BigDecimal totalUnpaid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
