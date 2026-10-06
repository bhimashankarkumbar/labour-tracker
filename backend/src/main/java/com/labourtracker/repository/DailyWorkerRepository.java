package com.labourtracker.repository;

import com.labourtracker.entity.DailyWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyWorkerRepository extends JpaRepository<DailyWorker, Long> {

    List<DailyWorker> findByWorkDayId(Long workDayId);

    List<DailyWorker> findByWorkerId(Long workerId);

    boolean existsByWorkDayIdAndWorkerId(Long workDayId, Long workerId);

    @Query("SELECT COALESCE(SUM(dw.dailyWage), 0) FROM DailyWorker dw WHERE dw.workDay.work.id = :workId")
    BigDecimal sumDailyWageByWorkId(@Param("workId") Long workId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.dailyWorker.workDay.work.id = :workId")
    BigDecimal sumPaymentsByWorkId(@Param("workId") Long workId);

    @Query("SELECT COALESCE(SUM(dw.dailyWage), 0) FROM DailyWorker dw")
    BigDecimal sumAllDailyWages();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p")
    BigDecimal sumAllPayments();

    @Query("SELECT dw FROM DailyWorker dw JOIN FETCH dw.worker JOIN FETCH dw.workDay wd WHERE dw.worker.id = :workerId")
    List<DailyWorker> findByWorkerIdWithDetails(@Param("workerId") Long workerId);

    @Query("SELECT COALESCE(SUM(dw.dailyWage), 0) FROM DailyWorker dw WHERE dw.worker.id = :workerId")
    BigDecimal sumDailyWageByWorkerId(@Param("workerId") Long workerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.dailyWorker.worker.id = :workerId")
    BigDecimal sumPaymentsByWorkerId(@Param("workerId") Long workerId);
}
