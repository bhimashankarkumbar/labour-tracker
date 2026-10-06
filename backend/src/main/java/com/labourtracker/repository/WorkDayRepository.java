package com.labourtracker.repository;

import com.labourtracker.entity.WorkDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkDayRepository extends JpaRepository<WorkDay, Long> {

    List<WorkDay> findByWorkIdOrderByWorkDateAsc(Long workId);

    boolean existsByWorkIdAndWorkDate(Long workId, LocalDate workDate);

    @Query("SELECT COALESCE(MAX(wd.dayNumber), 0) FROM WorkDay wd WHERE wd.work.id = :workId")
    int findMaxDayNumberByWorkId(@Param("workId") Long workId);

    long countByWorkId(Long workId);

    @Query("SELECT wd FROM WorkDay wd JOIN FETCH wd.dailyWorkers dw JOIN FETCH dw.worker WHERE wd.work.id = :workId")
    List<WorkDay> findByWorkIdWithWorkers(@Param("workId") Long workId);
}
