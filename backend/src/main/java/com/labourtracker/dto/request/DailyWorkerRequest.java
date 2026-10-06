package com.labourtracker.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DailyWorkerRequest {

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotNull(message = "Daily wage is required")
    @Positive(message = "Daily wage must be greater than zero")
    private BigDecimal dailyWage;
}
