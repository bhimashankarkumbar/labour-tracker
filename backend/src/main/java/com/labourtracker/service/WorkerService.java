package com.labourtracker.service;

import com.labourtracker.dto.request.WorkerRequest;
import com.labourtracker.dto.response.PageResponse;
import com.labourtracker.dto.response.WorkerResponse;
import com.labourtracker.entity.Worker;
import com.labourtracker.exception.ResourceNotFoundException;
import com.labourtracker.repository.DailyWorkerRepository;
import com.labourtracker.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final DailyWorkerRepository dailyWorkerRepository;

    public WorkerResponse createWorker(WorkerRequest request) {
        Worker worker = Worker.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .workerType(request.getWorkerType())
                .defaultWage(request.getDefaultWage())
                .address(request.getAddress())
                .notes(request.getNotes())
                .status(Worker.Status.ACTIVE)
                .build();
        worker = workerRepository.save(worker);
        return mapToWorkerResponse(worker);
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkerResponse> getAllWorkers(String status, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Worker> workerPage;

        boolean hasStatus = status != null && !status.isBlank();
        boolean hasSearch = search != null && !search.isBlank();

        if (hasStatus && hasSearch) {
            workerPage = workerRepository.findByStatusAndNameContainingIgnoreCase(
                    Worker.Status.valueOf(status.toUpperCase()), search, pageable);
        } else if (hasStatus) {
            workerPage = workerRepository.findByStatus(Worker.Status.valueOf(status.toUpperCase()), pageable);
        } else if (hasSearch) {
            workerPage = workerRepository.findByNameContainingIgnoreCaseOrPhoneContaining(
                    search, search, pageable);
        } else {
            workerPage = workerRepository.findAll(pageable);
        }

        return PageResponse.<WorkerResponse>builder()
                .content(workerPage.getContent().stream().map(this::mapToWorkerResponse).toList())
                .pageNumber(workerPage.getNumber())
                .pageSize(workerPage.getSize())
                .totalElements(workerPage.getTotalElements())
                .totalPages(workerPage.getTotalPages())
                .last(workerPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<WorkerResponse> getActiveWorkers() {
        return workerRepository.findByStatus(Worker.Status.ACTIVE)
                .stream().map(this::mapToWorkerResponse).toList();
    }

    @Transactional(readOnly = true)
    public WorkerResponse getWorkerById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker", "id", id));
        return mapToWorkerResponse(worker);
    }

    public WorkerResponse updateWorker(Long id, WorkerRequest request) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker", "id", id));

        // Note: Changing defaultWage here does NOT affect any historical DailyWorker records.
        // Historical wages are stored in DailyWorker.dailyWage and are immutable.
        worker.setName(request.getName());
        worker.setPhone(request.getPhone());
        worker.setWorkerType(request.getWorkerType());
        worker.setDefaultWage(request.getDefaultWage());
        worker.setAddress(request.getAddress());
        worker.setNotes(request.getNotes());

        worker = workerRepository.save(worker);
        return mapToWorkerResponse(worker);
    }

    public WorkerResponse deactivateWorker(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker", "id", id));
        worker.setStatus(Worker.Status.INACTIVE);
        worker = workerRepository.save(worker);
        return mapToWorkerResponse(worker);
    }

    public WorkerResponse activateWorker(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker", "id", id));
        worker.setStatus(Worker.Status.ACTIVE);
        worker = workerRepository.save(worker);
        return mapToWorkerResponse(worker);
    }

    private WorkerResponse mapToWorkerResponse(Worker worker) {
        BigDecimal totalEarned = dailyWorkerRepository.sumDailyWageByWorkerId(worker.getId());
        BigDecimal totalPaid = dailyWorkerRepository.sumPaymentsByWorkerId(worker.getId());
        BigDecimal totalUnpaid = totalEarned.subtract(totalPaid);
        if (totalUnpaid.compareTo(BigDecimal.ZERO) < 0) totalUnpaid = BigDecimal.ZERO;
        long daysWorked = dailyWorkerRepository.findByWorkerId(worker.getId()).size();

        return WorkerResponse.builder()
                .id(worker.getId())
                .name(worker.getName())
                .phone(worker.getPhone())
                .workerType(worker.getWorkerType())
                .defaultWage(worker.getDefaultWage())
                .address(worker.getAddress())
                .status(worker.getStatus().name())
                .notes(worker.getNotes())
                .totalDaysWorked(daysWorked)
                .totalEarned(totalEarned)
                .totalPaid(totalPaid)
                .totalUnpaid(totalUnpaid)
                .createdAt(worker.getCreatedAt())
                .updatedAt(worker.getUpdatedAt())
                .build();
    }
}
