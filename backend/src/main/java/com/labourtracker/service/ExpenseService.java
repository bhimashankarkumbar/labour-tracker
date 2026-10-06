package com.labourtracker.service;

import com.labourtracker.dto.request.ExpenseRequest;
import com.labourtracker.dto.response.ExpenseResponse;
import com.labourtracker.entity.Expense;
import com.labourtracker.entity.User;
import com.labourtracker.entity.Work;
import com.labourtracker.exception.ResourceNotFoundException;
import com.labourtracker.repository.ExpenseRepository;
import com.labourtracker.repository.UserRepository;
import com.labourtracker.repository.WorkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final WorkRepository workRepository;
    private final UserRepository userRepository;

    public ExpenseResponse createExpense(Long workId, ExpenseRequest request, String creatorEmail) {
        Work work = workRepository.findById(workId)
                .orElseThrow(() -> new ResourceNotFoundException("Work", "id", workId));
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", creatorEmail));

        Expense expense = Expense.builder()
                .work(work)
                .category(request.getCategory())
                .description(request.getDescription())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .createdBy(creator)
                .build();

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByWork(Long workId) {
        if (!workRepository.existsById(workId)) {
            throw new ResourceNotFoundException("Work", "id", workId);
        }
        return expenseRepository.findByWorkIdOrderByExpenseDateDesc(workId)
                .stream().map(this::mapToResponse).toList();
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, String userEmail) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense", "id", id);
        }
        expenseRepository.deleteById(id);
    }

    private ExpenseResponse mapToResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .workId(e.getWork().getId())
                .workName(e.getWork().getWorkName())
                .category(e.getCategory().name())
                .description(e.getDescription())
                .amount(e.getAmount())
                .expenseDate(e.getExpenseDate())
                .createdByName(e.getCreatedBy() != null ? e.getCreatedBy().getName() : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
