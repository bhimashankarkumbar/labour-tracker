package com.labourtracker.controller;

import com.labourtracker.dto.request.DailyWorkerRequest;
import com.labourtracker.dto.request.WorkDayRequest;
import com.labourtracker.dto.response.DailyWorkerResponse;
import com.labourtracker.dto.response.WorkDayResponse;
import com.labourtracker.service.DailyWorkerService;
import com.labourtracker.service.WorkDayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WorkDayController {

    private final WorkDayService workDayService;
    private final DailyWorkerService dailyWorkerService;

    // ---- Work Day endpoints ----

    @PostMapping("/api/works/{workId}/days")
    public ResponseEntity<WorkDayResponse> addWorkDay(
            @PathVariable Long workId, @Valid @RequestBody WorkDayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workDayService.addWorkDay(workId, request));
    }

    @GetMapping("/api/works/{workId}/days")
    public ResponseEntity<List<WorkDayResponse>> getWorkDays(@PathVariable Long workId) {
        return ResponseEntity.ok(workDayService.getWorkDaysByWork(workId));
    }

    @GetMapping("/api/work-days/{id}")
    public ResponseEntity<WorkDayResponse> getWorkDayById(@PathVariable Long id) {
        return ResponseEntity.ok(workDayService.getWorkDayById(id));
    }

    @PutMapping("/api/work-days/{id}")
    public ResponseEntity<WorkDayResponse> updateWorkDay(
            @PathVariable Long id, @Valid @RequestBody WorkDayRequest request) {
        return ResponseEntity.ok(workDayService.updateWorkDay(id, request));
    }

    @DeleteMapping("/api/work-days/{id}")
    public ResponseEntity<Void> deleteWorkDay(@PathVariable Long id) {
        workDayService.deleteWorkDay(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Daily Worker endpoints ----

    @PostMapping("/api/work-days/{dayId}/workers")
    public ResponseEntity<DailyWorkerResponse> assignWorker(
            @PathVariable Long dayId, @Valid @RequestBody DailyWorkerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dailyWorkerService.assignWorker(dayId, request));
    }

    @GetMapping("/api/work-days/{dayId}/workers")
    public ResponseEntity<List<DailyWorkerResponse>> getDailyWorkers(@PathVariable Long dayId) {
        return ResponseEntity.ok(dailyWorkerService.getDailyWorkersByWorkDay(dayId));
    }

    @GetMapping("/api/daily-workers/{id}")
    public ResponseEntity<DailyWorkerResponse> getDailyWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(dailyWorkerService.getDailyWorkerById(id));
    }

    @PutMapping("/api/daily-workers/{id}")
    public ResponseEntity<DailyWorkerResponse> updateDailyWorker(
            @PathVariable Long id, @Valid @RequestBody DailyWorkerRequest request) {
        return ResponseEntity.ok(dailyWorkerService.updateDailyWorker(id, request));
    }

    @DeleteMapping("/api/daily-workers/{id}")
    public ResponseEntity<Void> removeDailyWorker(@PathVariable Long id) {
        dailyWorkerService.removeDailyWorker(id);
        return ResponseEntity.noContent().build();
    }
}
