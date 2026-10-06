-- ============================================================
-- Labour Tracker Database Schema
-- MySQL 8.0+
-- Run this script to create the database and tables.
-- ============================================================

CREATE DATABASE IF NOT EXISTS labour_tracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE labour_tracker;

-- ---- Users ----
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL,
    password    VARCHAR(255)    NOT NULL,
    role        ENUM('ADMIN','MANAGER') NOT NULL DEFAULT 'MANAGER',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Works ----
CREATE TABLE IF NOT EXISTS works (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    work_name   VARCHAR(200)    NOT NULL,
    client_name VARCHAR(150),
    location    VARCHAR(300),
    start_date  DATE,
    end_date    DATE,
    status      ENUM('ONGOING','COMPLETED') NOT NULL DEFAULT 'ONGOING',
    description TEXT,
    created_by  BIGINT          NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_works_status (status),
    INDEX idx_works_start_date (start_date),
    INDEX idx_works_created_by (created_by),
    FOREIGN KEY fk_works_user (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Workers ----
CREATE TABLE IF NOT EXISTS workers (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)    NOT NULL,
    phone         VARCHAR(20),
    worker_type   VARCHAR(50),
    default_wage  DECIMAL(10,2),
    address       VARCHAR(300),
    status        ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    notes         TEXT,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_workers_status (status),
    INDEX idx_workers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Work Days ----
CREATE TABLE IF NOT EXISTS work_days (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    work_id     BIGINT      NOT NULL,
    day_number  INT         NOT NULL,
    work_date   DATE        NOT NULL,
    notes       TEXT,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_work_day_date (work_id, work_date),
    INDEX idx_work_days_work_id (work_id),
    INDEX idx_work_days_work_date (work_date),
    FOREIGN KEY fk_work_days_work (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Daily Workers ----
CREATE TABLE IF NOT EXISTS daily_workers (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    work_day_id   BIGINT          NOT NULL,
    worker_id     BIGINT          NOT NULL,
    daily_wage    DECIMAL(10,2)   NOT NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_daily_worker (work_day_id, worker_id),
    INDEX idx_daily_workers_work_day_id (work_day_id),
    INDEX idx_daily_workers_worker_id (worker_id),
    FOREIGN KEY fk_daily_workers_work_day (work_day_id) REFERENCES work_days(id) ON DELETE CASCADE,
    FOREIGN KEY fk_daily_workers_worker (worker_id) REFERENCES workers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Payments ----
CREATE TABLE IF NOT EXISTS payments (
    id                    BIGINT          NOT NULL AUTO_INCREMENT,
    daily_worker_id       BIGINT          NOT NULL,
    amount                DECIMAL(10,2)   NOT NULL,
    payment_date          DATE            NOT NULL,
    payment_method        ENUM('CASH','UPI','BANK_TRANSFER','OTHER') NOT NULL DEFAULT 'CASH',
    transaction_reference VARCHAR(100),
    notes                 TEXT,
    created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_payments_daily_worker_id (daily_worker_id),
    INDEX idx_payments_payment_date (payment_date),
    FOREIGN KEY fk_payments_daily_worker (daily_worker_id) REFERENCES daily_workers(id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Expenses ----
CREATE TABLE IF NOT EXISTS expenses (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    work_id       BIGINT          NOT NULL,
    category      ENUM('MATERIALS','TRANSPORT','FOOD','EQUIPMENT','FUEL','ELECTRICITY','OTHER') NOT NULL,
    description   VARCHAR(300),
    amount        DECIMAL(10,2)   NOT NULL,
    expense_date  DATE            NOT NULL,
    created_by    BIGINT,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_expenses_work_id (work_id),
    INDEX idx_expenses_expense_date (expense_date),
    INDEX idx_expenses_category (category),
    FOREIGN KEY fk_expenses_work (work_id) REFERENCES works(id) ON DELETE CASCADE,
    FOREIGN KEY fk_expenses_user (created_by) REFERENCES users(id),
    CONSTRAINT chk_expense_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
