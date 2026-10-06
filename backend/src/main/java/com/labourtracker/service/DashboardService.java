package com.labourtracker.service;

import com.labourtracker.dto.response.DashboardResponse;
import com.labourtracker.entity.Worker;
import com.labourtracker.entity.Work;
import com.labourtracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final WorkRepository workRepository;
    private final WorkerRepository workerRepository;
    private final DailyWorkerRepository dailyWorkerRepository;
    private final ExpenseRepository expenseRepository;

    /**
     * All values are calculated from actual database data.
     * Never hardcoded or estimated.
     */
    public DashboardResponse getDashboard() {
        // Work counts
        long activeWorks = workRepository.countByStatus(Work.Status.ONGOING);
        long completedWorks = workRepository.countByStatus(Work.Status.COMPLETED);

        // Worker counts
        long totalWorkers = workerRepository.count();
        long activeWorkers = workerRepository.countByStatus(Worker.Status.ACTIVE);

        // Financial totals
        BigDecimal totalLabourCost = dailyWorkerRepository.sumAllDailyWages();
        BigDecimal totalPaid = dailyWorkerRepository.sumAllPayments();
        BigDecimal totalOtherExpenses = expenseRepository.sumAllExpenses();
        BigDecimal totalExpense = totalLabourCost.add(totalOtherExpenses);
        BigDecimal totalUnpaid = totalLabourCost.subtract(totalPaid);
        if (totalUnpaid.compareTo(BigDecimal.ZERO) < 0) totalUnpaid = BigDecimal.ZERO;

        // Monthly/yearly expense breakdown
        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate yearStart = now.withDayOfYear(1);

        BigDecimal currentMonthLabour = BigDecimal.ZERO; // can add daily worker query by date range if needed
        BigDecimal currentMonthExpense = expenseRepository.sumAmountBetweenDates(monthStart, now);
        BigDecimal currentYearExpense = expenseRepository.sumAmountBetweenDates(yearStart, now);

        // Pending payments (DailyWorkers with remaining amount > 0)
        // This is a simplified count — use a proper query for production
        long pendingPaymentsCount = dailyWorkerRepository.findAll().stream()
                .filter(dw -> dw.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .count();

        return DashboardResponse.builder()
                .activeWorks(activeWorks)
                .completedWorks(completedWorks)
                .totalWorkers(totalWorkers)
                .activeWorkers(activeWorkers)
                .totalLabourCost(totalLabourCost)
                .totalOtherExpenses(totalOtherExpenses)
                .totalExpense(totalExpense)
                .totalPaid(totalPaid)
                .totalUnpaid(totalUnpaid)
                .currentMonthExpense(currentMonthExpense)
                .currentYearExpense(currentYearExpense)
                .pendingPaymentsCount(pendingPaymentsCount)
                .build();
    }
}
