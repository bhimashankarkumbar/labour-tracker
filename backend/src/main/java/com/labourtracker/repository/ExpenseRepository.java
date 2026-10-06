package com.labourtracker.repository;

import com.labourtracker.entity.Expense;
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
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByWorkIdOrderByExpenseDateDesc(Long workId);

    Page<Expense> findByWorkId(Long workId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.work.id = :workId")
    BigDecimal sumAmountByWorkId(@Param("workId") Long workId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumAllExpenses();

    List<Expense> findByWorkIdAndCategory(Long workId, Expense.Category category);

    Page<Expense> findByExpenseDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate BETWEEN :from AND :to")
    BigDecimal sumAmountBetweenDates(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
