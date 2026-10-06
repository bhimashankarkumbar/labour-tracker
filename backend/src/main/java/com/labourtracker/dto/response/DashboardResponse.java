package com.labourtracker.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponse {
    private long activeWorks;
    private long completedWorks;
    private long totalWorkers;
    private long activeWorkers;
    private BigDecimal totalLabourCost;
    private BigDecimal totalOtherExpenses;
    private BigDecimal totalExpense;
    private BigDecimal totalPaid;
    private BigDecimal totalUnpaid;
    private BigDecimal currentMonthExpense;
    private BigDecimal currentYearExpense;
    private long pendingPaymentsCount;
}
