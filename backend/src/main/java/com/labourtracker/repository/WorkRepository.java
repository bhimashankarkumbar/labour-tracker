package com.labourtracker.repository;

import com.labourtracker.entity.Work;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkRepository extends JpaRepository<Work, Long> {

    Page<Work> findByStatus(Work.Status status, Pageable pageable);

    Page<Work> findByWorkNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Work> findByStatusAndWorkNameContainingIgnoreCase(Work.Status status, String name, Pageable pageable);

    long countByStatus(Work.Status status);

    @Query("SELECT COUNT(DISTINCT dw.worker.id) FROM DailyWorker dw WHERE dw.workDay.work.id = :workId")
    long countDistinctWorkersByWorkId(@Param("workId") Long workId);
}
