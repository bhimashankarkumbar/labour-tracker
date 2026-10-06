package com.labourtracker.dto.request;

import com.labourtracker.entity.Work;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkRequest {

    @NotBlank(message = "Work name is required")
    @Size(max = 200, message = "Work name must not exceed 200 characters")
    private String workName;

    @Size(max = 150)
    private String clientName;

    @Size(max = 300)
    private String location;

    private LocalDate startDate;

    private LocalDate endDate;

    private Work.Status status;

    private String description;
}
