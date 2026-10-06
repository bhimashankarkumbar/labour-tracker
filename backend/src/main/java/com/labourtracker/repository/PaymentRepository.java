package com.labourtracker.repository;

import com.labourtracker.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByDailyWorkerIdOrderByPaymentDateDesc(Long dailyWorkerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.dailyWorker.id = :dailyWorkerId")
    BigDecimal sumAmountByDailyWorkerId(@Param("dailyWorkerId") Long dailyWorkerId);

    Page<Payment> findByPaymentDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDate BETWEEN :from AND :to")
    BigDecimal sumAmountBetweenDates(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.dailyWorker dw
            JOIN FETCH dw.worker w
            JOIN FETCH dw.workDay wd
            JOIN FETCH wd.work
            ORDER BY p.paymentDate DESC
            """)
    List<Payment> findAllWithDetails(Pageable pageable);
}
