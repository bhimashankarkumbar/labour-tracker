-- ============================================================
-- Labour Tracker Seed Data (Development / Demo)
-- ⚠ This is DEMO DATA for development only.
-- Do NOT run in production.
-- ============================================================

USE labour_tracker;

-- ---- Users ----
-- Password for all demo users is: password123 (BCrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@labourtracker.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'ADMIN'),
('Ramakrishna Manager', 'manager@labourtracker.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'MANAGER');

-- ---- Workers ----
INSERT INTO workers (name, phone, worker_type, default_wage, address, status) VALUES
('Ramesh Kumar', '9876543210', 'Mason', 800.00, 'Bengaluru', 'ACTIVE'),
('Suresh Reddy', '9876543211', 'Helper', 700.00, 'Bengaluru', 'ACTIVE'),
('Kumar Swamy', '9876543212', 'Carpenter', 900.00, 'Mysuru', 'ACTIVE'),
('Ravi Naik', '9876543213', 'Helper', 750.00, 'Bengaluru', 'ACTIVE'),
('Mahesh Gowda', '9876543214', 'Mason', 800.00, 'Tumkur', 'ACTIVE'),
('Shankar B', '9876543215', 'Electrician', 1000.00, 'Bengaluru', 'ACTIVE');

-- ---- Works ----
INSERT INTO works (work_name, client_name, location, start_date, status, description, created_by) VALUES
('House Construction', 'Venkatesh Reddy', 'Whitefield, Bengaluru', '2026-10-01', 'ONGOING', 'G+1 residential house construction', 1),
('Road Repair Work', 'BBMP', 'Indiranagar, Bengaluru', '2026-09-15', 'ONGOING', 'Pothole repair and road resurfacing', 1),
('Office Renovation', 'TechCorp Pvt Ltd', 'Koramangala, Bengaluru', '2026-08-01', 'COMPLETED', 'Office interior renovation project', 2);

-- ---- Work Days for Work 1 (House Construction) ----
INSERT INTO work_days (work_id, day_number, work_date, notes) VALUES
(1, 1, '2026-10-01', 'Foundation work started'),
(1, 2, '2026-10-02', 'Foundation continued'),
(1, 3, '2026-10-05', 'Column work'),
(1, 4, '2026-10-06', 'Column work continued');

-- ---- Work Days for Work 2 (Road Repair) ----
INSERT INTO work_days (work_id, day_number, work_date, notes) VALUES
(2, 1, '2026-09-15', 'Initial survey and marking'),
(2, 2, '2026-09-16', 'Material laying');

-- ---- Daily Workers for Work 1, Day 1 ----
INSERT INTO daily_workers (work_day_id, worker_id, daily_wage) VALUES
(1, 1, 800.00),   -- Ramesh
(1, 2, 700.00),   -- Suresh
(1, 3, 900.00);   -- Kumar

-- ---- Daily Workers for Work 1, Day 2 ----
INSERT INTO daily_workers (work_day_id, worker_id, daily_wage) VALUES
(2, 1, 800.00),   -- Ramesh
(2, 4, 750.00);   -- Ravi

-- ---- Daily Workers for Work 1, Day 3 ----
INSERT INTO daily_workers (work_day_id, worker_id, daily_wage) VALUES
(3, 3, 900.00),   -- Kumar
(3, 5, 800.00),   -- Mahesh
(3, 4, 750.00);   -- Ravi

-- ---- Daily Workers for Work 1, Day 4 ----
INSERT INTO daily_workers (work_day_id, worker_id, daily_wage) VALUES
(4, 1, 850.00),   -- Ramesh (wage increased for this day)
(4, 3, 900.00);   -- Kumar

-- ---- Daily Workers for Work 2 ----
INSERT INTO daily_workers (work_day_id, worker_id, daily_wage) VALUES
(5, 1, 800.00),   -- Ramesh
(5, 2, 700.00),   -- Suresh
(6, 4, 750.00),   -- Ravi
(6, 5, 800.00);   -- Mahesh

-- ---- Payments ----
-- Ramesh Day 1: ₹800 owed, ₹500 paid
INSERT INTO payments (daily_worker_id, amount, payment_date, payment_method, notes) VALUES
(1, 500.00, '2026-10-03', 'CASH', 'Advance payment');

-- Kumar Day 1: ₹900 owed, ₹900 paid (fully paid)
INSERT INTO payments (daily_worker_id, amount, payment_date, payment_method, notes) VALUES
(3, 900.00, '2026-10-03', 'UPI', 'Full payment via UPI');

-- ---- Expenses for Work 1 ----
INSERT INTO expenses (work_id, category, description, amount, expense_date, created_by) VALUES
(1, 'MATERIALS', 'Cement - 50 bags', 4500.00, '2026-10-01', 1),
(1, 'MATERIALS', 'Sand - 2 truckloads', 3000.00, '2026-10-02', 1),
(1, 'TRANSPORT', 'Material transport charges', 500.00, '2026-10-01', 1),
(1, 'FOOD', 'Lunch for workers', 300.00, '2026-10-02', 2);

-- ---- Expenses for Work 2 ----
INSERT INTO expenses (work_id, category, description, amount, expense_date, created_by) VALUES
(2, 'MATERIALS', 'Asphalt material', 8000.00, '2026-09-15', 1),
(2, 'EQUIPMENT', 'Road roller rental', 2000.00, '2026-09-16', 1);
