package com.labourtracker.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class WorkDayResponse {
    private Long id;
    private Long workId;
    private String workName;
    private Integer dayNumber;
    private LocalDate workDate;
    private String notes;
    private List<DailyWorkerResponse> dailyWorkers;
    private LocalDateTime createdAt;
}
