package com.labourtracker.service;

import com.labourtracker.dto.request.WorkDayRequest;
import com.labourtracker.dto.response.DailyWorkerResponse;
import com.labourtracker.dto.response.WorkDayResponse;
import com.labourtracker.entity.Work;
import com.labourtracker.entity.WorkDay;
import com.labourtracker.exception.DuplicateResourceException;
import com.labourtracker.exception.ResourceNotFoundException;
import com.labourtracker.repository.WorkDayRepository;
import com.labourtracker.repository.WorkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkDayService {

    private final WorkDayRepository workDayRepository;
    private final WorkRepository workRepository;

    public WorkDayResponse addWorkDay(Long workId, WorkDayRequest request) {
        Work work = workRepository.findById(workId)
                .orElseThrow(() -> new ResourceNotFoundException("Work", "id", workId));

        // Prevent duplicate dates for the same work
        if (workDayRepository.existsByWorkIdAndWorkDate(workId, request.getWorkDate())) {
            throw new DuplicateResourceException(
                    "A working day already exists for date: " + request.getWorkDate() +
                            " in work: " + work.getWorkName());
        }

        int nextDayNumber = workDayRepository.findMaxDayNumberByWorkId(workId) + 1;

        WorkDay workDay = WorkDay.builder()
                .work(work)
                .dayNumber(nextDayNumber)
                .workDate(request.getWorkDate())
                .notes(request.getNotes())
                .build();

        workDay = workDayRepository.save(workDay);
        return mapToWorkDayResponse(workDay);
    }

    @Transactional(readOnly = true)
    public List<WorkDayResponse> getWorkDaysByWork(Long workId) {
        if (!workRepository.existsById(workId)) {
            throw new ResourceNotFoundException("Work", "id", workId);
        }
        return workDayRepository.findByWorkIdOrderByWorkDateAsc(workId)
                .stream().map(this::mapToWorkDayResponse).toList();
    }

    @Transactional(readOnly = true)
    public WorkDayResponse getWorkDayById(Long id) {
        WorkDay workDay = workDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkDay", "id", id));
        return mapToWorkDayResponse(workDay);
    }

    public WorkDayResponse updateWorkDay(Long id, WorkDayRequest request) {
        WorkDay workDay = workDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkDay", "id", id));

        // Check for date conflict if date is being changed
        if (!workDay.getWorkDate().equals(request.getWorkDate())) {
            if (workDayRepository.existsByWorkIdAndWorkDate(workDay.getWork().getId(), request.getWorkDate())) {
                throw new DuplicateResourceException(
                        "A working day already exists for date: " + request.getWorkDate());
            }
            workDay.setWorkDate(request.getWorkDate());
        }
        workDay.setNotes(request.getNotes());

        workDay = workDayRepository.save(workDay);
        return mapToWorkDayResponse(workDay);
    }

    public void deleteWorkDay(Long id) {
        WorkDay workDay = workDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkDay", "id", id));
        workDayRepository.delete(workDay);
    }

    WorkDayResponse mapToWorkDayResponse(WorkDay workDay) {
        List<DailyWorkerResponse> workers = workDay.getDailyWorkers().stream()
                .map(dw -> DailyWorkerResponse.builder()
                        .id(dw.getId())
                        .workDayId(workDay.getId())
                        .workDate(workDay.getWorkDate())
                        .dayNumber(workDay.getDayNumber())
                        .workId(workDay.getWork().getId())
                        .workName(workDay.getWork().getWorkName())
                        .workerId(dw.getWorker().getId())
                        .workerName(dw.getWorker().getName())
                        .workerPhone(dw.getWorker().getPhone())
                        .dailyWage(dw.getDailyWage())
                        .totalPaid(dw.getTotalPaid())
                        .remainingAmount(dw.getRemainingAmount())
                        .paymentStatus(dw.getPaymentStatus().name())
                        .createdAt(dw.getCreatedAt())
                        .build()
                ).toList();

        return WorkDayResponse.builder()
                .id(workDay.getId())
                .workId(workDay.getWork().getId())
                .workName(workDay.getWork().getWorkName())
                .dayNumber(workDay.getDayNumber())
                .workDate(workDay.getWorkDate())
                .notes(workDay.getNotes())
                .dailyWorkers(workers)
                .createdAt(workDay.getCreatedAt())
                .build();
    }
}
