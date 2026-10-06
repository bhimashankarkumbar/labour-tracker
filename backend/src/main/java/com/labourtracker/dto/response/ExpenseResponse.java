package com.labourtracker.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private Long workId;
    private String workName;
    private String category;
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
