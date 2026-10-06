package com.labourtracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkerRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 20)
    private String phone;

    @Size(max = 50)
    private String workerType;

    @Positive(message = "Default wage must be greater than zero")
    private BigDecimal defaultWage;

    @Size(max = 300)
    private String address;

    private String notes;
}
