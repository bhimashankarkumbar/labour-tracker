package com.labourtracker.controller;

import com.labourtracker.dto.request.ExpenseRequest;
import com.labourtracker.dto.response.ExpenseResponse;
import com.labourtracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/api/works/{workId}/expenses")
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long workId,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(workId, request, userDetails.getUsername()));
    }

    @GetMapping("/api/works/{workId}/expenses")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(@PathVariable Long workId) {
        return ResponseEntity.ok(expenseService.getExpensesByWork(workId));
    }

    @PutMapping("/api/expenses/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/api/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
