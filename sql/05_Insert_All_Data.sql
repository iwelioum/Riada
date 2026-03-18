USE riada_db;

INSERT INTO clubs (name, address_street, address_city, address_postal_code, country, is_open_24_7, opened_on, operational_status)
VALUES
('Riada Brussels', 'Rue de la Loi 145', 'Brussels', '1000', 'Belgium', 1, '2021-01-15', 'open'),
('Riada Liege', 'Boulevard d Avroy 28', 'Liege', '4000', 'Belgium', 1, '2021-03-18', 'open'),
('Riada Ghent', 'Korenmarkt 11', 'Ghent', '9000', 'Belgium', 1, '2021-05-10', 'open'),
('Riada Antwerp', 'Meir 77', 'Antwerp', '2000', 'Belgium', 1, '2021-07-02', 'open'),
('Riada Namur', 'Rue de Fer 54', 'Namur', '5000', 'Belgium', 0, '2021-09-20', 'open');

INSERT INTO subscription_plans (plan_name, base_price, commitment_months, enrollment_fee, limited_club_access, duo_pass_allowed)
VALUES
('Basic', 19.99, 12, 19.99, 1, 0),
('Comfort', 24.99, 12, 19.99, 0, 0),
('Premium', 29.99, 12, 29.99, 0, 1);

INSERT INTO service_options (option_name, monthly_price)
VALUES
('Sportswater', 5.99),
('Massages', 9.99),
('Coaching', 49.99);

INSERT INTO subscription_plan_options (plan_id, option_id)
VALUES
(3, 1),
(3, 2),
(3, 3),
(2, 1),
(2, 2);

INSERT INTO courses (course_name, description, difficulty_level, duration_minutes, max_capacity, estimated_calories, activity_type)
VALUES
('Air Bike', 'Cardio routine using abdominals with cyclic leg movement', 'beginner', 40, 24, 320, 'cardio'),
('Alternating Renegade Row', 'Compound rowing movement targeting middle back and core', 'advanced', 50, 18, 360, 'strength'),
('90-90 Hamstring', 'Mobility and stretching routine focused on hamstrings', 'beginner', 35, 22, 120, 'flexibility'),
('Adductor Flow', 'Controlled static sequence to release adductor tension', 'intermediate', 30, 20, 90, 'relaxation'),
('Dance Conditioning', 'Rhythmic full body training sequence', 'all_levels', 45, 30, 290, 'dance'),
('Box Drill', 'Combat conditioning with boxing combinations', 'intermediate', 50, 20, 410, 'combat'),
('All Fours Quad Stretch', 'Stretching sequence for quadriceps and hips', 'beginner', 30, 20, 100, 'flexibility'),
('Alternate Hammer Curl', 'Upper-body resistance session for biceps and forearms', 'beginner', 45, 20, 260, 'strength'),
('Cardio Circuit', 'Alternating cardio and resistance blocks', 'intermediate', 55, 24, 420, 'mixed'),
('Kettlebell Press', 'Compound shoulder and triceps strength training', 'intermediate', 45, 18, 300, 'strength'),
('Mobility Recovery', 'Low intensity session for recovery and stress reduction', 'all_levels', 35, 20, 110, 'relaxation'),
('Kickboxing Flow', 'Combat sequence with kicks and punches', 'advanced', 55, 20, 430, 'combat');

INSERT INTO employees (last_name, first_name, email, club_id, role, monthly_salary, qualifications, hired_on)
VALUES
('Freeman', 'Edward', 'edward.freeman@riada.be', 1, 'instructor', 2350.00, 'CPT Level 3', '2021-01-20'),
('Johansen', 'Mads', 'mads.johansen@riada.be', 1, 'instructor', 2325.00, 'Group Fitness', '2021-02-11'),
('Petersen', 'Simon', 'simon.petersen@riada.be', 2, 'instructor', 2280.00, 'Strength Coach', '2021-03-09'),
('Ryan', 'Randall', 'randall.ryan@riada.be', 2, 'instructor', 2260.00, 'Combat Instructor', '2021-03-26'),
('Kumar', 'Henry', 'henry.kumar@riada.be', 3, 'instructor', 2290.00, 'Cardio Specialist', '2021-05-14'),
('King', 'Molly', 'molly.king@riada.be', 3, 'instructor', 2275.00, 'Dance Fitness', '2021-06-01'),
('Olson', 'Krin', 'krin.olson@riada.be', 4, 'instructor', 2310.00, 'Mobility Specialist', '2021-07-19'),
('Mills', 'Terri', 'terri.mills@riada.be', 5, 'instructor', 2250.00, 'HIIT Coach', '2021-09-27'),
('Lambert', 'Aline', 'aline.lambert@riada.be', 1, 'manager', 3650.00, 'Club Management', '2021-01-10'),
('Dupuis', 'Noah', 'noah.dupuis@riada.be', 2, 'manager', 3620.00, 'Operations Management', '2021-03-01'),
('Vanacker', 'Lena', 'lena.vanacker@riada.be', 3, 'manager', 3640.00, 'Operations Management', '2021-05-01'),
('De Smet', 'Arthur', 'arthur.desmet@riada.be', 4, 'manager', 3660.00, 'Club Management', '2021-07-01'),
('Martin', 'Clara', 'clara.martin@riada.be', 5, 'manager', 3600.00, 'Operations Management', '2021-09-01'),
('Nowak', 'Lucas', 'lucas.nowak@riada.be', 1, 'technician', 2450.00, 'Equipment Maintenance', '2021-04-12'),
('Leroy', 'Emma', 'emma.leroy@riada.be', 2, 'technician', 2475.00, 'Electrical Systems', '2021-05-15'),
('Benoit', 'Jules', 'jules.benoit@riada.be', 3, 'technician', 2430.00, 'Equipment Maintenance', '2021-06-20'),
('Germain', 'Lea', 'lea.germain@riada.be', 4, 'receptionist', 1980.00, 'Customer Care', '2021-07-10'),
('Rousseau', 'Milan', 'milan.rousseau@riada.be', 5, 'receptionist', 1960.00, 'Front Desk', '2021-10-05'),
('Vandenberg', 'Nora', 'nora.vandenberg@riada.be', 1, 'receptionist', 1990.00, 'Bilingual Support', '2021-02-18'),
('Aydin', 'Elif', 'elif.aydin@riada.be', 2, 'intern', 980.00, 'Sports Management Student', '2025-09-01');

INSERT INTO members (
    last_name,
    first_name,
    email,
    gender,
    date_of_birth,
    nationality,
    mobile_phone,
    address_street,
    address_city,
    address_postal_code,
    status,
    primary_goal,
    acquisition_source,
    medical_certificate_provided,
    gdpr_consent_at,
    marketing_consent
)
WITH RECURSIVE seq(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 120
)
SELECT
    CONCAT('Last', LPAD(n, 3, '0')),
    CONCAT('First', LPAD(n, 3, '0')),
    CONCAT('member', LPAD(n, 3, '0'), '@riada.be'),
    CASE
        WHEN MOD(n, 11) = 0 THEN 'unspecified'
        WHEN MOD(n, 2) = 0 THEN 'female'
        ELSE 'male'
    END,
    DATE_SUB(CURDATE(), INTERVAL (18 + MOD(n, 45)) YEAR),
    CASE MOD(n, 3)
        WHEN 0 THEN 'Belgian'
        WHEN 1 THEN 'French'
        ELSE 'Dutch'
    END,
    CONCAT('+324', LPAD(1000000 + n * 73, 7, '0')),
    CONCAT('Street ', n, ' ', CHAR(64 + (MOD(n, 26) + 1))),
    CASE MOD(n, 5)
        WHEN 0 THEN 'Brussels'
        WHEN 1 THEN 'Liege'
        WHEN 2 THEN 'Ghent'
        WHEN 3 THEN 'Antwerp'
        ELSE 'Namur'
    END,
    CASE MOD(n, 5)
        WHEN 0 THEN '1000'
        WHEN 1 THEN '4000'
        WHEN 2 THEN '9000'
        WHEN 3 THEN '2000'
        ELSE '5000'
    END,
    CASE
        WHEN n BETWEEN 109 AND 116 THEN 'suspended'
        ELSE 'active'
    END,
    CASE MOD(n, 5)
        WHEN 0 THEN 'weight_loss'
        WHEN 1 THEN 'muscle_gain'
        WHEN 2 THEN 'fitness'
        WHEN 3 THEN 'maintenance'
        ELSE 'other'
    END,
    CASE MOD(n, 4)
        WHEN 0 THEN 'web_advertising'
        WHEN 1 THEN 'social_media'
        WHEN 2 THEN 'word_of_mouth'
        ELSE 'other'
    END,
    CASE WHEN MOD(n, 3) = 0 THEN 1 ELSE 0 END,
    DATE_SUB(NOW(3), INTERVAL MOD(n, 240) DAY),
    CASE WHEN MOD(n, 2) = 0 THEN 1 ELSE 0 END
FROM seq;

INSERT INTO contracts (
    member_id,
    plan_id,
    home_club_id,
    start_date,
    end_date,
    contract_type,
    status,
    cancelled_on,
    cancellation_reason,
    freeze_start_date,
    freeze_end_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 120
),
base AS (
    SELECT
        n,
        CASE
            WHEN n <= 84 THEN 'active'
            WHEN n <= 96 THEN 'suspended'
            WHEN n <= 114 THEN 'expired'
            ELSE 'cancelled'
        END AS contract_status,
        CASE
            WHEN MOD(n, 6) = 0 AND n <= 84 THEN 'open_ended'
            ELSE 'fixed_term'
        END AS contract_type_value,
        CASE
            WHEN n <= 96 THEN DATE_SUB(CURDATE(), INTERVAL (60 + MOD(n, 240)) DAY)
            ELSE DATE_SUB(CURDATE(), INTERVAL (500 + MOD(n, 180)) DAY)
        END AS start_date_value
    FROM seq
)
SELECT
    b.n,
    CASE
        WHEN MOD(b.n, 10) IN (1, 2, 3) THEN 3
        WHEN MOD(b.n, 10) IN (4, 5, 6, 7) THEN 2
        ELSE 1
    END,
    MOD(b.n - 1, 5) + 1,
    b.start_date_value,
    CASE
        WHEN b.contract_type_value = 'open_ended' THEN NULL
        WHEN b.contract_status = 'active' THEN DATE_ADD(b.start_date_value, INTERVAL 365 DAY)
        WHEN b.contract_status = 'suspended' THEN DATE_ADD(b.start_date_value, INTERVAL 395 DAY)
        WHEN b.contract_status = 'expired' THEN DATE_SUB(CURDATE(), INTERVAL (10 + MOD(b.n, 90)) DAY)
        ELSE DATE_ADD(b.start_date_value, INTERVAL 365 DAY)
    END,
    b.contract_type_value,
    b.contract_status,
    CASE
        WHEN b.contract_status = 'cancelled' THEN DATE_ADD(b.start_date_value, INTERVAL 300 DAY)
        ELSE NULL
    END,
    CASE
        WHEN b.contract_status = 'cancelled' THEN 'Member requested cancellation'
        ELSE NULL
    END,
    CASE
        WHEN b.contract_status = 'suspended' AND b.n = 85 THEN CURDATE()
        WHEN b.contract_status = 'suspended' THEN DATE_SUB(CURDATE(), INTERVAL MOD(b.n, 20) DAY)
        ELSE NULL
    END,
    CASE
        WHEN b.contract_status = 'suspended' AND b.n = 85 THEN DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        WHEN b.contract_status = 'suspended' THEN DATE_ADD(DATE_SUB(CURDATE(), INTERVAL MOD(b.n, 20) DAY), INTERVAL (20 + MOD(b.n, 15)) DAY)
        ELSE NULL
    END
FROM base b;

INSERT INTO contract_options (contract_id, option_id, added_on, removed_on)
WITH RECURSIVE seq(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 20
)
SELECT
    n,
    CASE MOD(n, 3)
        WHEN 1 THEN 1
        WHEN 2 THEN 2
        ELSE 3
    END,
    DATE_ADD((SELECT c.start_date FROM contracts c WHERE c.id = n), INTERVAL 10 DAY),
    CASE
        WHEN MOD(n, 5) = 0 THEN DATE_SUB(CURDATE(), INTERVAL 20 DAY)
        ELSE NULL
    END
FROM seq;

INSERT INTO invoice_sequences (year, last_number)
VALUES
(2022, 0),
(2023, 0),
(2024, 0),
(2025, 0),
(2026, 0);

INSERT INTO invoices (
    contract_id,
    invoice_number,
    issued_on,
    due_date,
    billing_period_start,
    billing_period_end,
    amount_excl_tax,
    vat_rate,
    status,
    amount_paid
)
WITH RECURSIVE seq(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 180
),
base AS (
    SELECT
        n,
        CASE
            WHEN n <= 120 THEN n
            ELSE n - 120
        END AS contract_id,
        CASE
            WHEN MOD(n, 10) = 0 THEN DATE_SUB(CURDATE(), INTERVAL (45 + MOD(n, 20)) DAY)
            WHEN MOD(n, 10) IN (7, 8, 9) THEN DATE_SUB(CURDATE(), INTERVAL (20 + MOD(n, 25)) DAY)
            ELSE DATE_SUB(CURDATE(), INTERVAL MOD(n, 10) DAY)
        END AS issued_on_value,
        CASE
            WHEN MOD(n, 10) IN (1, 2, 3, 4, 5, 6) THEN 'issued'
            WHEN MOD(n, 10) IN (7, 8) THEN 'paid'
            WHEN MOD(n, 10) = 9 THEN 'partially_paid'
            ELSE 'overdue'
        END AS invoice_status
    FROM seq
),
options_total AS (
    SELECT
        co.contract_id,
        ROUND(SUM(so.monthly_price), 2) AS total_options
    FROM contract_options co
    JOIN service_options so ON so.id = co.option_id
    WHERE co.removed_on IS NULL
    GROUP BY co.contract_id
)
SELECT
    b.contract_id,
    '',
    b.issued_on_value,
    DATE_ADD(b.issued_on_value, INTERVAL 15 DAY),
    DATE_FORMAT(b.issued_on_value, '%Y-%m-01'),
    LAST_DAY(b.issued_on_value),
    ROUND(sp.base_price + COALESCE(ot.total_options, 0.00), 2),
    0.2100,
    b.invoice_status,
    CASE
        WHEN b.invoice_status = 'paid' THEN ROUND((sp.base_price + COALESCE(ot.total_options, 0.00)) * 1.21, 2)
        WHEN b.invoice_status = 'partially_paid' THEN ROUND((sp.base_price + COALESCE(ot.total_options, 0.00)) * 0.60, 2)
        ELSE 0.00
    END
FROM base b
JOIN contracts c ON c.id = b.contract_id
JOIN subscription_plans sp ON sp.id = c.plan_id
LEFT JOIN options_total ot ON ot.contract_id = b.contract_id;

INSERT INTO invoice_lines (invoice_id, description, line_type, plan_id, quantity, unit_price_excl_tax, vat_rate)
SELECT
    i.id,
    CONCAT('Monthly subscription ', sp.plan_name),
    'subscription',
    c.plan_id,
    1,
    sp.base_price,
    0.2100
FROM invoices i
JOIN contracts c ON c.id = i.contract_id
JOIN subscription_plans sp ON sp.id = c.plan_id;

INSERT INTO invoice_lines (invoice_id, description, line_type, option_id, quantity, unit_price_excl_tax, vat_rate)
SELECT
    x.invoice_id,
    CONCAT('Option ', x.option_name),
    'option',
    x.option_id,
    1,
    x.monthly_price,
    0.2100
FROM (
    SELECT
        i.id AS invoice_id,
        so.id AS option_id,
        so.option_name,
        so.monthly_price,
        ROW_NUMBER() OVER (ORDER BY i.id, so.id) AS rn
    FROM invoices i
    JOIN contract_options co ON co.contract_id = i.contract_id
    JOIN service_options so ON so.id = co.option_id
    WHERE co.removed_on IS NULL
) x
WHERE x.rn <= 40;

DROP TEMPORARY TABLE IF EXISTS tmp_payment_candidates;

CREATE TEMPORARY TABLE tmp_payment_candidates (
    rn               INT UNSIGNED   NOT NULL,
    invoice_id       INT UNSIGNED   NOT NULL,
    invoice_status   VARCHAR(20)    NOT NULL,
    issued_on_value  DATE           NOT NULL,
    amount_incl_tax  DECIMAL(10,2)  NOT NULL,
    balance_due      DECIMAL(10,2)  NOT NULL,
    PRIMARY KEY (rn)
) ENGINE=MEMORY;

INSERT INTO tmp_payment_candidates (rn, invoice_id, invoice_status, issued_on_value, amount_incl_tax, balance_due)
SELECT
    ROW_NUMBER() OVER (ORDER BY i.id) AS rn,
    i.id,
    i.status,
    i.issued_on,
    i.amount_incl_tax,
    i.balance_due
FROM invoices i
WHERE i.status IN ('issued', 'partially_paid', 'overdue', 'paid');

INSERT INTO payments (
    invoice_id,
    paid_at,
    amount,
    status,
    payment_method,
    transaction_reference,
    error_code,
    attempt_count
)
SELECT
    c.invoice_id,
    LEAST(NOW(3), DATE_ADD(c.issued_on_value, INTERVAL (1 + MOD(c.rn, 20)) DAY)),
    CASE
        WHEN c.invoice_status = 'paid' THEN 3.00
        WHEN MOD(c.rn, 5) = 0 THEN LEAST(5.00, c.balance_due)
        ELSE ROUND(LEAST(c.balance_due, GREATEST(1.00, c.balance_due * 0.50)), 2)
    END,
    CASE
        WHEN c.invoice_status = 'paid' THEN 'failed'
        WHEN MOD(c.rn, 5) = 0 THEN 'failed'
        ELSE 'succeeded'
    END,
    CASE MOD(c.rn, 4)
        WHEN 0 THEN 'sepa_direct_debit'
        WHEN 1 THEN 'credit_card'
        WHEN 2 THEN 'cash'
        ELSE 'bank_transfer'
    END,
    CONCAT('PAY-', LPAD(c.rn, 5, '0')),
    CASE
        WHEN c.invoice_status = 'paid' OR MOD(c.rn, 5) = 0 THEN
            CASE MOD(c.rn, 3)
                WHEN 0 THEN 'INSUFFICIENT_FUNDS'
                WHEN 1 THEN 'CARD_DECLINED'
                ELSE 'NETWORK_TIMEOUT'
            END
        ELSE NULL
    END,
    1 + MOD(c.rn, 3)
FROM tmp_payment_candidates c
WHERE c.rn <= 150;

DROP TEMPORARY TABLE IF EXISTS tmp_payment_candidates;

INSERT INTO access_log (member_id, club_id, accessed_at, access_status, denial_reason)
WITH RECURSIVE seq(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 400
)
SELECT
    MOD(n - 1, 120) + 1,
    MOD(n - 1, 5) + 1,
    DATE_SUB(DATE_SUB(NOW(3), INTERVAL MOD(n, 90) DAY), INTERVAL MOD(n, 24) HOUR),
    CASE
        WHEN MOD(n, 20) IN (0, 1, 2) THEN 'denied'
        ELSE 'granted'
    END,
    CASE
        WHEN MOD(n, 20) IN (0, 1, 2) THEN
            CASE MOD(n, 3)
                WHEN 0 THEN 'No active contract'
                WHEN 1 THEN 'Outstanding overdue invoice(s)'
                ELSE 'Access restricted to home club'
            END
        ELSE NULL
    END
FROM seq;

INSERT INTO class_sessions (course_id, instructor_id, club_id, starts_at, duration_minutes, enrolled_count)
WITH RECURSIVE seq(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 20
)
SELECT
    s.course_id,
    CASE s.club_id
        WHEN 1 THEN 1
        WHEN 2 THEN 3
        WHEN 3 THEN 5
        WHEN 4 THEN 7
        ELSE 8
    END,
    s.club_id,
    TIMESTAMP(
        DATE_ADD(CURDATE(), INTERVAL (MOD(s.n - 1, 14) + 1) DAY),
        MAKETIME(6 + MOD(s.n, 12), 0, 0)
    ),
    c.duration_minutes,
    0
FROM (
    SELECT
        n,
        MOD(n - 1, 10) + 1 AS course_id,
        MOD(MOD(n - 1, 10), 5) + 1 AS club_id
    FROM seq
) s
JOIN courses c ON c.id = s.course_id;

DROP TEMPORARY TABLE IF EXISTS tmp_booking_candidates;

CREATE TEMPORARY TABLE tmp_booking_candidates (
    member_id   INT UNSIGNED  NOT NULL,
    session_id  INT UNSIGNED  NOT NULL,
    booked_at   DATETIME(3)   NOT NULL,
    status      VARCHAR(20)   NOT NULL
) ENGINE=MEMORY;

INSERT INTO tmp_booking_candidates (member_id, session_id, booked_at, status)
SELECT
    x.member_id,
    x.session_id,
    DATE_SUB(NOW(3), INTERVAL x.rn DAY),
    CASE
        WHEN x.rn = 2 AND x.session_id IN (5, 10, 15, 20) THEN 'waitlisted'
        ELSE 'confirmed'
    END
FROM (
    SELECT
        cs.id AS session_id,
        c.member_id,
        ROW_NUMBER() OVER (PARTITION BY cs.id ORDER BY c.member_id) AS rn
    FROM class_sessions cs
    JOIN contracts c
      ON c.home_club_id = cs.club_id
     AND c.status = 'active'
) x
WHERE x.rn <= 2
ORDER BY x.session_id, x.rn
LIMIT 40;

INSERT INTO bookings (member_id, session_id, booked_at, status)
SELECT
    member_id,
    session_id,
    booked_at,
    status
FROM tmp_booking_candidates;

DROP TEMPORARY TABLE IF EXISTS tmp_booking_candidates;

INSERT INTO equipment (
    name,
    equipment_type,
    club_id,
    brand,
    model,
    acquisition_year,
    status,
    purchase_cost,
    usage_hours
)
WITH RECURSIVE seq(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 60
),
base AS (
    SELECT
        n,
        FLOOR((n - 1) / 20) + 1 AS club_id,
        MOD(n - 1, 10) + 1 AS type_idx,
        CASE
            WHEN MOD(n - 1, 20) < 10 THEN 1
            ELSE 2
        END AS unit_no
    FROM seq
)
SELECT
    CONCAT(
        CASE b.type_idx
            WHEN 1 THEN 'Treadmill'
            WHEN 2 THEN 'Bike'
            WHEN 3 THEN 'Rower'
            WHEN 4 THEN 'Elliptical'
            WHEN 5 THEN 'BenchPress'
            WHEN 6 THEN 'CableMachine'
            WHEN 7 THEN 'LegPress'
            WHEN 8 THEN 'PullUpStation'
            WHEN 9 THEN 'DumbbellRack'
            ELSE 'YogaSet'
        END,
        '-',
        b.club_id,
        '-',
        b.unit_no
    ),
    CASE b.type_idx
        WHEN 1 THEN 'cardio'
        WHEN 2 THEN 'cardio'
        WHEN 3 THEN 'cardio'
        WHEN 4 THEN 'cardio'
        WHEN 5 THEN 'strength'
        WHEN 6 THEN 'strength'
        WHEN 7 THEN 'strength'
        WHEN 8 THEN 'strength'
        WHEN 9 THEN 'strength'
        ELSE 'flexibility'
    END,
    b.club_id,
    CASE MOD(b.n, 3)
        WHEN 0 THEN 'Technogym'
        WHEN 1 THEN 'LifeFitness'
        ELSE 'Precor'
    END,
    CONCAT('M', 1000 + b.n),
    2018 + MOD(b.n, 7),
    CASE
        WHEN MOD(b.n, 10) = 0 THEN 'broken'
        WHEN MOD(b.n, 4) = 0 THEN 'under_maintenance'
        WHEN MOD(b.n, 29) = 0 THEN 'retired'
        ELSE 'in_service'
    END,
    ROUND(1800 + b.n * 27.5, 2),
    350 + b.n * 11
FROM base b;

INSERT INTO maintenance_tickets (
    equipment_id,
    technician_id,
    maintenance_type,
    status,
    priority,
    reported_at,
    resolved_at,
    problem_description,
    repair_cost
)
SELECT
    e.id,
    CASE MOD(e.rn, 3)
        WHEN 1 THEN 14
        WHEN 2 THEN 15
        ELSE 16
    END,
    CASE MOD(e.rn, 3)
        WHEN 1 THEN 'breakdown'
        WHEN 2 THEN 'preventive'
        ELSE 'installation'
    END,
    CASE MOD(e.rn, 4)
        WHEN 1 THEN 'reported'
        WHEN 2 THEN 'assigned'
        WHEN 3 THEN 'in_progress'
        ELSE 'resolved'
    END,
    CASE MOD(e.rn, 4)
        WHEN 1 THEN 'low'
        WHEN 2 THEN 'medium'
        WHEN 3 THEN 'high'
        ELSE 'critical'
    END,
    DATE_SUB(NOW(3), INTERVAL e.rn * 2 DAY),
    CASE
        WHEN MOD(e.rn, 4) = 0 THEN DATE_SUB(NOW(3), INTERVAL (e.rn * 2 - 1) DAY)
        ELSE NULL
    END,
    CONCAT('Maintenance ticket ', e.rn),
    ROUND(40 + e.rn * 9.5, 2)
FROM (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM equipment
    WHERE status IN ('broken', 'under_maintenance')
) e
WHERE e.rn <= 15;

INSERT INTO guests (sponsor_member_id, last_name, first_name, date_of_birth, email, status)
VALUES
(1, 'GuestLast001', 'GuestFirst001', DATE_SUB(CURDATE(), INTERVAL 26 YEAR), 'guest001@riada.be', 'active'),
(2, 'GuestLast002', 'GuestFirst002', DATE_SUB(CURDATE(), INTERVAL 31 YEAR), 'guest002@riada.be', 'active'),
(3, 'GuestLast003', 'GuestFirst003', DATE_SUB(CURDATE(), INTERVAL 24 YEAR), 'guest003@riada.be', 'active'),
(4, 'GuestLast004', 'GuestFirst004', DATE_SUB(CURDATE(), INTERVAL 29 YEAR), 'guest004@riada.be', 'banned'),
(11, 'GuestLast005', 'GuestFirst005', DATE_SUB(CURDATE(), INTERVAL 27 YEAR), 'guest005@riada.be', 'active');

INSERT INTO guest_access_log (guest_id, companion_member_id, club_id, accessed_at, access_status, denial_reason)
VALUES
(1, 1, 1, DATE_SUB(NOW(3), INTERVAL 8 DAY), 'granted', NULL),
(2, 2, 2, DATE_SUB(NOW(3), INTERVAL 7 DAY), 'granted', NULL),
(3, 3, 3, DATE_SUB(NOW(3), INTERVAL 6 DAY), 'granted', NULL),
(5, 11, 1, DATE_SUB(NOW(3), INTERVAL 5 DAY), 'granted', NULL),
(1, 1, 1, DATE_SUB(NOW(3), INTERVAL 4 DAY), 'granted', NULL),
(2, 2, 2, DATE_SUB(NOW(3), INTERVAL 3 DAY), 'denied', 'Companion member not present'),
(3, 3, 3, DATE_SUB(NOW(3), INTERVAL 2 DAY), 'granted', NULL),
(5, 11, 1, DATE_SUB(NOW(3), INTERVAL 1 DAY), 'granted', NULL),
(1, 1, 1, DATE_SUB(NOW(3), INTERVAL 12 HOUR), 'granted', NULL);

INSERT INTO invoices (
    contract_id,
    invoice_number,
    issued_on,
    due_date,
    billing_period_start,
    billing_period_end,
    amount_excl_tax,
    vat_rate,
    status,
    amount_paid
)
SELECT
    c.id,
    '',
    DATE_SUB(CURDATE(), INTERVAL 45 DAY),
    DATE_SUB(CURDATE(), INTERVAL 30 DAY),
    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 45 DAY), '%Y-%m-01'),
    LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 45 DAY)),
    sp.base_price,
    0.2100,
    'overdue',
    0.00
FROM contracts c
JOIN subscription_plans sp ON sp.id = c.plan_id
WHERE c.member_id = 1
  AND c.status = 'active'
  AND c.plan_id = 3
LIMIT 1;

SET @edge_overdue_invoice_id := LAST_INSERT_ID();

INSERT INTO invoice_lines (invoice_id, description, line_type, plan_id, quantity, unit_price_excl_tax, vat_rate)
SELECT
    @edge_overdue_invoice_id,
    'Premium monthly subscription overdue case',
    'subscription',
    3,
    1,
    base_price,
    0.2100
FROM subscription_plans
WHERE id = 3;

INSERT INTO invoices (
    contract_id,
    invoice_number,
    issued_on,
    due_date,
    billing_period_start,
    billing_period_end,
    amount_excl_tax,
    vat_rate,
    status,
    amount_paid
)
SELECT
    c.id,
    '',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 15 DAY),
    DATE_FORMAT(CURDATE(), '%Y-%m-01'),
    LAST_DAY(CURDATE()),
    sp.base_price,
    0.2100,
    'issued',
    0.00
FROM contracts c
JOIN subscription_plans sp ON sp.id = c.plan_id
WHERE c.member_id = 2
  AND c.status = 'active'
LIMIT 1;

SET @edge_issued_invoice_id := LAST_INSERT_ID();

INSERT INTO invoice_lines (invoice_id, description, line_type, plan_id, quantity, unit_price_excl_tax, vat_rate)
SELECT
    @edge_issued_invoice_id,
    'Issued invoice for payment trigger test',
    'subscription',
    c.plan_id,
    1,
    sp.base_price,
    0.2100
FROM contracts c
JOIN subscription_plans sp ON sp.id = c.plan_id
WHERE c.id = (SELECT contract_id FROM invoices WHERE id = @edge_issued_invoice_id);

INSERT INTO shifts (employee_id, club_id, date, start_time, end_time, shift_type)
VALUES
(1, 1, DATE_ADD(CURDATE(), INTERVAL -1 DAY), '08:00:00', '16:00:00', 'morning'),
(2, 1, DATE_ADD(CURDATE(), INTERVAL -1 DAY), '14:00:00', '22:00:00', 'evening'),
(1, 1, CURDATE(), '08:00:00', '16:00:00', 'morning'),
(2, 1, CURDATE(), '14:00:00', '22:00:00', 'evening'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '16:00:00', 'morning'),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '22:00:00', 'evening'),
(3, 2, CURDATE(), '09:00:00', '17:00:00', 'morning'),
(4, 2, CURDATE(), '13:00:00', '21:00:00', 'afternoon');

UPDATE contracts
SET
    status = 'suspended',
    freeze_start_date = CURDATE(),
    freeze_end_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
WHERE id = 85;

INSERT INTO guest_access_log (guest_id, companion_member_id, club_id, accessed_at, access_status, denial_reason)
VALUES
(4, 4, 2, NOW(3), 'denied', 'Guest is banned');

SELECT 'clubs' AS table_name, COUNT(*) AS row_count FROM clubs
UNION ALL SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL SELECT 'service_options', COUNT(*) FROM service_options
UNION ALL SELECT 'subscription_plan_options', COUNT(*) FROM subscription_plan_options
UNION ALL SELECT 'courses', COUNT(*) FROM courses
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'members', COUNT(*) FROM members
UNION ALL SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL SELECT 'contract_options', COUNT(*) FROM contract_options
UNION ALL SELECT 'invoice_sequences', COUNT(*) FROM invoice_sequences
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_lines', COUNT(*) FROM invoice_lines
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'access_log', COUNT(*) FROM access_log
UNION ALL SELECT 'class_sessions', COUNT(*) FROM class_sessions
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL SELECT 'maintenance_tickets', COUNT(*) FROM maintenance_tickets
UNION ALL SELECT 'guests', COUNT(*) FROM guests
UNION ALL SELECT 'guest_access_log', COUNT(*) FROM guest_access_log
UNION ALL SELECT 'shifts', COUNT(*) FROM shifts
UNION ALL SELECT 'audit_gdpr', COUNT(*) FROM audit_gdpr
ORDER BY table_name;
