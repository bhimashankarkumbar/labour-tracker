package com.labourtracker.service;

import com.labourtracker.dto.request.WorkRequest;
import com.labourtracker.dto.response.PageResponse;
import com.labourtracker.dto.response.WorkResponse;
import com.labourtracker.entity.User;
import com.labourtracker.entity.Work;
import com.labourtracker.exception.ResourceNotFoundException;
import com.labourtracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkService {

    private final WorkRepository workRepository;
    private final UserRepository userRepository;
    private final WorkDayRepository workDayRepository;
    private final DailyWorkerRepository dailyWorkerRepository;
    private final ExpenseRepository expenseRepository;

    public WorkResponse createWork(WorkRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", creatorEmail));

        Work work = Work.builder()
                .workName(request.getWorkName())
                .clientName(request.getClientName())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : Work.Status.ONGOING)
                .description(request.getDescription())
                .createdBy(creator)
                .build();

        work = workRepository.save(work);
        return mapToWorkResponse(work);
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkResponse> getAllWorks(String status, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Work> workPage;

        boolean hasStatus = status != null && !status.isBlank();
        boolean hasSearch = search != null && !search.isBlank();

        if (hasStatus && hasSearch) {
            workPage = workRepository.findByStatusAndWorkNameContainingIgnoreCase(
                    Work.Status.valueOf(status.toUpperCase()), search, pageable);
        } else if (hasStatus) {
            workPage = workRepository.findByStatus(Work.Status.valueOf(status.toUpperCase()), pageable);
        } else if (hasSearch) {
            workPage = workRepository.findByWorkNameContainingIgnoreCase(search, pageable);
        } else {
            workPage = workRepository.findAll(pageable);
        }

        return PageResponse.<WorkResponse>builder()
                .content(workPage.getContent().stream().map(this::mapToWorkResponse).toList())
                .pageNumber(workPage.getNumber())
                .pageSize(workPage.getSize())
                .totalElements(workPage.getTotalElements())
                .totalPages(workPage.getTotalPages())
                .last(workPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public WorkResponse getWorkById(Long id) {
        Work work = workRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work", "id", id));
        return mapToWorkResponse(work);
    }

    public WorkResponse updateWork(Long id, WorkRequest request, String userEmail) {
        Work work = workRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work", "id", id));

        work.setWorkName(request.getWorkName());
        work.setClientName(request.getClientName());
        work.setLocation(request.getLocation());
        work.setStartDate(request.getStartDate());
        work.setEndDate(request.getEndDate());
        if (request.getStatus() != null) work.setStatus(request.getStatus());
        work.setDescription(request.getDescription());

        work = workRepository.save(work);
        return mapToWorkResponse(work);
    }

    public void deleteWork(Long id) {
        if (!workRepository.existsById(id)) {
            throw new ResourceNotFoundException("Work", "id", id);
        }
        // Note: Cascade deletes WorkDays -> DailyWorkers -> Payments
        // Consider business rules: if payments exist, prefer deactivation
        workRepository.deleteById(id);
    }

    private WorkResponse mapToWorkResponse(Work work) {
        BigDecimal labourCost = dailyWorkerRepository.sumDailyWageByWorkId(work.getId());
        BigDecimal totalPaid = dailyWorkerRepository.sumPaymentsByWorkId(work.getId());
        BigDecimal otherExpenses = expenseRepository.sumAmountByWorkId(work.getId());
        BigDecimal totalExpense = labourCost.add(otherExpenses);
        BigDecimal totalUnpaid = labourCost.subtract(totalPaid);
        if (totalUnpaid.compareTo(BigDecimal.ZERO) < 0) totalUnpaid = BigDecimal.ZERO;

        return WorkResponse.builder()
                .id(work.getId())
                .workName(work.getWorkName())
                .clientName(work.getClientName())
                .location(work.getLocation())
                .startDate(work.getStartDate())
                .endDate(work.getEndDate())
                .status(work.getStatus().name())
                .description(work.getDescription())
                .createdByName(work.getCreatedBy() != null ? work.getCreatedBy().getName() : null)
                .totalWorkingDays(workDayRepository.countByWorkId(work.getId()))
                .totalWorkersInvolved(workRepository.countDistinctWorkersByWorkId(work.getId()))
                .totalLabourCost(labourCost)
                .totalOtherExpenses(otherExpenses)
                .totalExpense(totalExpense)
                .totalPaid(totalPaid)
                .totalUnpaid(totalUnpaid)
                .createdAt(work.getCreatedAt())
                .updatedAt(work.getUpdatedAt())
                .build();
    }
}
