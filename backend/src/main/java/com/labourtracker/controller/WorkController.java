package com.labourtracker.controller;

import com.labourtracker.dto.request.WorkRequest;
import com.labourtracker.dto.response.PageResponse;
import com.labourtracker.dto.response.WorkResponse;
import com.labourtracker.service.WorkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/works")
@RequiredArgsConstructor
public class WorkController {

    private final WorkService workService;

    @PostMapping
    public ResponseEntity<WorkResponse> createWork(
            @Valid @RequestBody WorkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workService.createWork(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<PageResponse<WorkResponse>> getAllWorks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(workService.getAllWorks(status, search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkResponse> getWorkById(@PathVariable Long id) {
        return ResponseEntity.ok(workService.getWorkById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkResponse> updateWork(
            @PathVariable Long id,
            @Valid @RequestBody WorkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(workService.updateWork(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWork(@PathVariable Long id) {
        workService.deleteWork(id);
        return ResponseEntity.noContent().build();
    }
}
