package com.labourtracker.controller;

import com.labourtracker.dto.request.WorkerRequest;
import com.labourtracker.dto.response.DailyWorkerResponse;
import com.labourtracker.dto.response.PageResponse;
import com.labourtracker.dto.response.WorkerResponse;
import com.labourtracker.service.DailyWorkerService;
import com.labourtracker.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;
    private final DailyWorkerService dailyWorkerService;

    @PostMapping
    public ResponseEntity<WorkerResponse> createWorker(@Valid @RequestBody WorkerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workerService.createWorker(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<WorkerResponse>> getAllWorkers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(workerService.getAllWorkers(status, search, page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<List<WorkerResponse>> getActiveWorkers() {
        return ResponseEntity.ok(workerService.getActiveWorkers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerResponse> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerResponse> updateWorker(
            @PathVariable Long id, @Valid @RequestBody WorkerRequest request) {
        return ResponseEntity.ok(workerService.updateWorker(id, request));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<WorkerResponse> deactivateWorker(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.deactivateWorker(id));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<WorkerResponse> activateWorker(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.activateWorker(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<DailyWorkerResponse>> getWorkerHistory(@PathVariable Long id) {
        return ResponseEntity.ok(dailyWorkerService.getDailyWorkersByWorker(id));
    }
}
