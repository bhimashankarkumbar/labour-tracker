package com.labourtracker.service;

import com.labourtracker.dto.request.DailyWorkerRequest;
import com.labourtracker.dto.request.PaymentRequest;
import com.labourtracker.dto.request.RegisterRequest;
import com.labourtracker.dto.request.WorkDayRequest;
import com.labourtracker.dto.request.WorkRequest;
import com.labourtracker.dto.request.WorkerRequest;
import com.labourtracker.dto.response.AuthResponse;
import com.labourtracker.dto.response.DailyWorkerResponse;
import com.labourtracker.dto.response.PaymentResponse;
import com.labourtracker.dto.response.WorkDayResponse;
import com.labourtracker.dto.response.WorkResponse;
import com.labourtracker.dto.response.WorkerResponse;
import com.labourtracker.entity.Payment;
import com.labourtracker.exception.DuplicateResourceException;
import com.labourtracker.exception.InvalidPaymentException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for core business logic.
 * Uses H2 in-memory database via test application.properties.
 *
 * Tests the complete service layer from registration through payment validation.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LabourTrackerBusinessTests {

    @Autowired AuthService authService;
    @Autowired WorkService workService;
    @Autowired WorkerService workerService;
    @Autowired WorkDayService workDayService;
    @Autowired DailyWorkerService dailyWorkerService;
    @Autowired PaymentService paymentService;

    // ========================
    // AUTHENTICATION TESTS
    // ========================

    @Test
    void shouldRegisterUserSuccessfully() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("password123");

        AuthResponse response = authService.register(req);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getName()).isEqualTo("Test User");
    }

    @Test
    void shouldRejectDuplicateEmailRegistration() {
        RegisterRequest req = new RegisterRequest();
        req.setName("User One");
        req.setEmail("duplicate@example.com");
        req.setPassword("password123");

        authService.register(req);

        RegisterRequest req2 = new RegisterRequest();
        req2.setName("User Two");
        req2.setEmail("duplicate@example.com");
        req2.setPassword("password456");

        assertThatThrownBy(() -> authService.register(req2))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void shouldLoginSuccessfully() {
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Login Test");
        reg.setEmail("login@example.com");
        reg.setPassword("securepass");
        authService.register(reg);

        var loginReq = new com.labourtracker.dto.request.LoginRequest();
        loginReq.setEmail("login@example.com");
        loginReq.setPassword("securepass");

        AuthResponse response = authService.login(loginReq);
        assertThat(response.getToken()).isNotBlank();
    }

    // ========================
    // WORK TESTS
    // ========================

    @Test
    void shouldCreateWorkSuccessfully() {
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Manager");
        reg.setEmail("manager@test.com");
        reg.setPassword("password123");
        authService.register(reg);

        WorkRequest workReq = new WorkRequest();
        workReq.setWorkName("House Construction");
        workReq.setLocation("Bengaluru");

        WorkResponse work = workService.createWork(workReq, "manager@test.com");

        assertThat(work.getId()).isNotNull();
        assertThat(work.getWorkName()).isEqualTo("House Construction");
        assertThat(work.getStatus()).isEqualTo("ONGOING");
    }

    // ========================
    // WORKER TESTS
    // ========================

    @Test
    void shouldCreateWorkerSuccessfully() {
        WorkerRequest req = new WorkerRequest();
        req.setName("Ramesh");
        req.setDefaultWage(new BigDecimal("800"));

        WorkerResponse worker = workerService.createWorker(req);

        assertThat(worker.getId()).isNotNull();
        assertThat(worker.getName()).isEqualTo("Ramesh");
        assertThat(worker.getDefaultWage()).isEqualByComparingTo("800");
    }

    // ========================
    // WORK DAY TESTS
    // ========================

    @Test
    void shouldAddWorkDaySuccessfully() throws Exception {
        // Setup
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Mgr");
        reg.setEmail("mgr@test.com");
        reg.setPassword("password123");
        authService.register(reg);

        WorkRequest workReq = new WorkRequest();
        workReq.setWorkName("Road Repair");
        WorkResponse work = workService.createWork(workReq, "mgr@test.com");

        WorkDayRequest dayReq = new WorkDayRequest();
        dayReq.setWorkDate(LocalDate.of(2026, 10, 1));

        WorkDayResponse day = workDayService.addWorkDay(work.getId(), dayReq);

        assertThat(day.getId()).isNotNull();
        assertThat(day.getDayNumber()).isEqualTo(1);
        assertThat(day.getWorkDate()).isEqualTo(LocalDate.of(2026, 10, 1));
    }

    @Test
    void shouldRejectDuplicateWorkDate() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Mgr2");
        reg.setEmail("mgr2@test.com");
        reg.setPassword("password123");
        authService.register(reg);

        WorkRequest workReq = new WorkRequest();
        workReq.setWorkName("Bridge Build");
        WorkResponse work = workService.createWork(workReq, "mgr2@test.com");

        WorkDayRequest dayReq = new WorkDayRequest();
        dayReq.setWorkDate(LocalDate.of(2026, 10, 1));
        workDayService.addWorkDay(work.getId(), dayReq);

        // Same date again — must throw
        assertThatThrownBy(() -> workDayService.addWorkDay(work.getId(), dayReq))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // ========================
    // DUPLICATE ASSIGNMENT TEST
    // ========================

    @Test
    void shouldRejectDuplicateWorkerAssignment() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Mgr3");
        reg.setEmail("mgr3@test.com");
        reg.setPassword("password123");
        authService.register(reg);

        WorkRequest workReq = new WorkRequest();
        workReq.setWorkName("Wall Construction");
        WorkResponse work = workService.createWork(workReq, "mgr3@test.com");

        WorkDayRequest dayReq = new WorkDayRequest();
        dayReq.setWorkDate(LocalDate.of(2026, 10, 5));
        WorkDayResponse day = workDayService.addWorkDay(work.getId(), dayReq);

        WorkerRequest workerReq = new WorkerRequest();
        workerReq.setName("Suresh");
        workerReq.setDefaultWage(new BigDecimal("700"));
        WorkerResponse worker = workerService.createWorker(workerReq);

        DailyWorkerRequest assignReq = new DailyWorkerRequest();
        assignReq.setWorkerId(worker.getId());
        assignReq.setDailyWage(new BigDecimal("700"));
        dailyWorkerService.assignWorker(day.getId(), assignReq);

        // Second assignment of same worker to same day — must fail
        assertThatThrownBy(() -> dailyWorkerService.assignWorker(day.getId(), assignReq))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // ========================
    // PAYMENT TESTS
    // ========================

    @Test
    void shouldRecordPartialPayment() throws Exception {
        DailyWorkerResponse dw = createDailyWorkerWithWage("800");

        PaymentRequest paymentReq = new PaymentRequest();
        paymentReq.setAmount(new BigDecimal("500"));
        paymentReq.setPaymentDate(LocalDate.now());
        paymentReq.setPaymentMethod(Payment.PaymentMethod.CASH);

        PaymentResponse payment = paymentService.recordPayment(dw.getId(), paymentReq);

        assertThat(payment.getAmount()).isEqualByComparingTo("500");

        // Check remaining
        DailyWorkerResponse updated = dailyWorkerService.getDailyWorkerById(dw.getId());
        assertThat(updated.getTotalPaid()).isEqualByComparingTo("500");
        assertThat(updated.getRemainingAmount()).isEqualByComparingTo("300");
        assertThat(updated.getPaymentStatus()).isEqualTo("PARTIALLY_PAID");
    }

    @Test
    void shouldRecordFullPaymentInMultipleTransactions() throws Exception {
        DailyWorkerResponse dw = createDailyWorkerWithWage("800");

        // First payment: ₹300
        PaymentRequest p1 = new PaymentRequest();
        p1.setAmount(new BigDecimal("300"));
        p1.setPaymentDate(LocalDate.now());
        p1.setPaymentMethod(Payment.PaymentMethod.CASH);
        paymentService.recordPayment(dw.getId(), p1);

        // Second payment: ₹200
        PaymentRequest p2 = new PaymentRequest();
        p2.setAmount(new BigDecimal("200"));
        p2.setPaymentDate(LocalDate.now());
        p2.setPaymentMethod(Payment.PaymentMethod.UPI);
        paymentService.recordPayment(dw.getId(), p2);

        // Third payment: ₹300 — total = ₹800 = fully paid
        PaymentRequest p3 = new PaymentRequest();
        p3.setAmount(new BigDecimal("300"));
        p3.setPaymentDate(LocalDate.now());
        p3.setPaymentMethod(Payment.PaymentMethod.CASH);
        paymentService.recordPayment(dw.getId(), p3);

        DailyWorkerResponse updated = dailyWorkerService.getDailyWorkerById(dw.getId());
        assertThat(updated.getTotalPaid()).isEqualByComparingTo("800");
        assertThat(updated.getRemainingAmount()).isEqualByComparingTo("0");
        assertThat(updated.getPaymentStatus()).isEqualTo("PAID");
    }

    @Test
    void shouldRejectPaymentExceedingOutstandingAmount() throws Exception {
        DailyWorkerResponse dw = createDailyWorkerWithWage("800");

        // Pay ₹500
        PaymentRequest p1 = new PaymentRequest();
        p1.setAmount(new BigDecimal("500"));
        p1.setPaymentDate(LocalDate.now());
        p1.setPaymentMethod(Payment.PaymentMethod.CASH);
        paymentService.recordPayment(dw.getId(), p1);

        // Remaining = ₹300. Attempt to pay ₹301 — must be rejected
        PaymentRequest tooMuch = new PaymentRequest();
        tooMuch.setAmount(new BigDecimal("301"));
        tooMuch.setPaymentDate(LocalDate.now());
        tooMuch.setPaymentMethod(Payment.PaymentMethod.CASH);

        assertThatThrownBy(() -> paymentService.recordPayment(dw.getId(), tooMuch))
                .isInstanceOf(InvalidPaymentException.class)
                .hasMessageContaining("exceeds outstanding amount");
    }

    @Test
    void historicalWageShouldNotChangeWhenWorkerDefaultChanges() throws Exception {
        // Create worker with default wage ₹800
        WorkerRequest workerReq = new WorkerRequest();
        workerReq.setName("Historical Test Worker");
        workerReq.setDefaultWage(new BigDecimal("800"));
        WorkerResponse worker = workerService.createWorker(workerReq);

        // Assign to a day with wage ₹800
        RegisterRequest reg = new RegisterRequest();
        reg.setName("HMgr");
        reg.setEmail("hmgr@test.com");
        reg.setPassword("password123");
        authService.register(reg);

        WorkRequest workReq = new WorkRequest();
        workReq.setWorkName("Historical Wage Test Work");
        WorkResponse work = workService.createWork(workReq, "hmgr@test.com");

        WorkDayRequest dayReq = new WorkDayRequest();
        dayReq.setWorkDate(LocalDate.of(2026, 10, 10));
        WorkDayResponse day = workDayService.addWorkDay(work.getId(), dayReq);

        DailyWorkerRequest assignReq = new DailyWorkerRequest();
        assignReq.setWorkerId(worker.getId());
        assignReq.setDailyWage(new BigDecimal("800")); // Historical: ₹800
        DailyWorkerResponse assignment = dailyWorkerService.assignWorker(day.getId(), assignReq);

        // Now change worker's default wage to ₹900
        WorkerRequest updateReq = new WorkerRequest();
        updateReq.setName("Historical Test Worker");
        updateReq.setDefaultWage(new BigDecimal("900")); // New default
        workerService.updateWorker(worker.getId(), updateReq);

        // The daily worker record must still show ₹800 — not ₹900
        DailyWorkerResponse historic = dailyWorkerService.getDailyWorkerById(assignment.getId());
        assertThat(historic.getDailyWage()).isEqualByComparingTo("800");
    }

    // ========================
    // HELPER METHODS
    // ========================

    private DailyWorkerResponse createDailyWorkerWithWage(String wage) throws Exception {
        String email = "helper_" + System.nanoTime() + "@test.com";

        RegisterRequest reg = new RegisterRequest();
        reg.setName("Helper Mgr");
        reg.setEmail(email);
        reg.setPassword("password123");
        authService.register(reg);

        WorkRequest workReq = new WorkRequest();
        workReq.setWorkName("Payment Test Work " + System.nanoTime());
        WorkResponse work = workService.createWork(workReq, email);

        WorkDayRequest dayReq = new WorkDayRequest();
        dayReq.setWorkDate(LocalDate.now().plusDays((long)(Math.random() * 100)));
        WorkDayResponse day = workDayService.addWorkDay(work.getId(), dayReq);

        WorkerRequest workerReq = new WorkerRequest();
        workerReq.setName("Test Worker " + System.nanoTime());
        workerReq.setDefaultWage(new BigDecimal(wage));
        WorkerResponse worker = workerService.createWorker(workerReq);

        DailyWorkerRequest assignReq = new DailyWorkerRequest();
        assignReq.setWorkerId(worker.getId());
        assignReq.setDailyWage(new BigDecimal(wage));
        return dailyWorkerService.assignWorker(day.getId(), assignReq);
    }
}
