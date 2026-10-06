package com.labourtracker.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class DailyWorkerResponse {
    private Long id;
    private Long workDayId;
    private LocalDate workDate;
    private Integer dayNumber;
    private Long workId;
    private String workName;
    private Long workerId;
    private String workerName;
    private String workerPhone;
    private BigDecimal dailyWage;
    private BigDecimal totalPaid;
    private BigDecimal remainingAmount;
    private String paymentStatus;
    private LocalDateTime createdAt;
}
