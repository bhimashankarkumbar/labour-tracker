package com.labourtracker.service;

import com.labourtracker.dto.request.DailyWorkerRequest;
import com.labourtracker.dto.response.DailyWorkerResponse;
import com.labourtracker.entity.DailyWorker;
import com.labourtracker.entity.WorkDay;
import com.labourtracker.entity.Worker;
import com.labourtracker.exception.DuplicateResourceException;
import com.labourtracker.exception.ResourceNotFoundException;
import com.labourtracker.repository.DailyWorkerRepository;
import com.labourtracker.repository.WorkDayRepository;
import com.labourtracker.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyWorkerService {

    private final DailyWorkerRepository dailyWorkerRepository;
    private final WorkDayRepository workDayRepository;
    private final WorkerRepository workerRepository;

    public DailyWorkerResponse assignWorker(Long workDayId, DailyWorkerRequest request) {
        WorkDay workDay = workDayRepository.findById(workDayId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkDay", "id", workDayId));

        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker", "id", request.getWorkerId()));

        // Enforce unique assignment: same worker, same work day
        if (dailyWorkerRepository.existsByWorkDayIdAndWorkerId(workDayId, request.getWorkerId())) {
            throw new DuplicateResourceException(
                    "Worker '" + worker.getName() + "' is already assigned to this working day.");
        }

        DailyWorker dailyWorker = DailyWorker.builder()
                .workDay(workDay)
                .worker(worker)
                .dailyWage(request.getDailyWage())
                .build();

        dailyWorker = dailyWorkerRepository.save(dailyWorker);
        return mapToResponse(dailyWorker);
    }

    @Transactional(readOnly = true)
    public List<DailyWorkerResponse> getDailyWorkersByWorkDay(Long workDayId) {
        return dailyWorkerRepository.findByWorkDayId(workDayId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public DailyWorkerResponse getDailyWorkerById(Long id) {
        DailyWorker dw = dailyWorkerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DailyWorker", "id", id));
        return mapToResponse(dw);
    }

    public DailyWorkerResponse updateDailyWorker(Long id, DailyWorkerRequest request) {
        DailyWorker dw = dailyWorkerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DailyWorker", "id", id));
        // Allow updating wage — this changes the historical record intentionally if user corrects an error
        dw.setDailyWage(request.getDailyWage());
        dw = dailyWorkerRepository.save(dw);
        return mapToResponse(dw);
    }

    public void removeDailyWorker(Long id) {
        DailyWorker dw = dailyWorkerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DailyWorker", "id", id));
        dailyWorkerRepository.delete(dw);
    }

    @Transactional(readOnly = true)
    public List<DailyWorkerResponse> getDailyWorkersByWorker(Long workerId) {
        return dailyWorkerRepository.findByWorkerIdWithDetails(workerId)
                .stream().map(this::mapToResponse).toList();
    }

    DailyWorkerResponse mapToResponse(DailyWorker dw) {
        return DailyWorkerResponse.builder()
                .id(dw.getId())
                .workDayId(dw.getWorkDay().getId())
                .workDate(dw.getWorkDay().getWorkDate())
                .dayNumber(dw.getWorkDay().getDayNumber())
                .workId(dw.getWorkDay().getWork().getId())
                .workName(dw.getWorkDay().getWork().getWorkName())
                .workerId(dw.getWorker().getId())
                .workerName(dw.getWorker().getName())
                .workerPhone(dw.getWorker().getPhone())
                .dailyWage(dw.getDailyWage())
                .totalPaid(dw.getTotalPaid())
                .remainingAmount(dw.getRemainingAmount())
                .paymentStatus(dw.getPaymentStatus().name())
                .createdAt(dw.getCreatedAt())
                .build();
    }
}
