package com.labourtracker.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class WorkResponse {
    private Long id;
    private String workName;
    private String clientName;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String description;
    private String createdByName;
    private Long totalWorkingDays;
    private Long totalWorkersInvolved;
    private BigDecimal totalLabourCost;
    private BigDecimal totalOtherExpenses;
    private BigDecimal totalExpense;
    private BigDecimal totalPaid;
    private BigDecimal totalUnpaid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
