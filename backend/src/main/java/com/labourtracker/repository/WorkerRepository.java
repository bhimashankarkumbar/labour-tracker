package com.labourtracker.repository;

import com.labourtracker.entity.Worker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {

    Page<Worker> findByStatus(Worker.Status status, Pageable pageable);

    Page<Worker> findByNameContainingIgnoreCaseOrPhoneContaining(String name, String phone, Pageable pageable);

    Page<Worker> findByStatusAndNameContainingIgnoreCase(Worker.Status status, String name, Pageable pageable);

    long countByStatus(Worker.Status status);

    List<Worker> findByStatus(Worker.Status status);

    boolean existsByPhone(String phone);
}
