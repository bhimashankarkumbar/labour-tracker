package com.labourtracker.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkDayRequest {

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    private String notes;
}
