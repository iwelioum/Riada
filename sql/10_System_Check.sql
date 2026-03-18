USE riada_db;

DROP TEMPORARY TABLE IF EXISTS tmp_system_checks;
CREATE TEMPORARY TABLE tmp_system_checks (
    check_id    VARCHAR(10)  NOT NULL,
    check_name  VARCHAR(180) NOT NULL,
    status      ENUM('OK','FAIL') NOT NULL,
    details     VARCHAR(255) NOT NULL,
    PRIMARY KEY (check_id)
) ENGINE=MEMORY;

SET @c_table_count := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
);
INSERT INTO tmp_system_checks VALUES ('C01', 'base table count', IF(@c_table_count = 22, 'OK', 'FAIL'), CONCAT('tables=', @c_table_count));

SET @c_trigger_count := (
    SELECT COUNT(*)
    FROM information_schema.triggers
    WHERE trigger_schema = DATABASE()
);
INSERT INTO tmp_system_checks VALUES ('C02', 'trigger count', IF(@c_trigger_count = 28, 'OK', 'FAIL'), CONCAT('triggers=', @c_trigger_count));

SET @c_procedure_count := (
    SELECT COUNT(*)
    FROM information_schema.routines
    WHERE routine_schema = DATABASE()
      AND routine_type = 'PROCEDURE'
);
INSERT INTO tmp_system_checks VALUES ('C03', 'stored procedure count', IF(@c_procedure_count = 8, 'OK', 'FAIL'), CONCAT('procedures=', @c_procedure_count));

SET @c_fk_count := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND constraint_type = 'FOREIGN KEY'
);
INSERT INTO tmp_system_checks VALUES ('C04', 'foreign key count', IF(@c_fk_count = 29, 'OK', 'FAIL'), CONCAT('fks=', @c_fk_count));

SET @c_role_count := (
    SELECT COUNT(DISTINCT FROM_USER)
    FROM mysql.role_edges
    WHERE FROM_USER IN ('role_gate_access', 'role_billing_ops', 'role_data_protection')
      AND TO_USER IN ('portique_user', 'billing_user', 'dpo_user')
);
SET @c_default_role_count := (
    SELECT COUNT(*)
    FROM mysql.default_roles
    WHERE user IN ('portique_user', 'billing_user', 'dpo_user')
);
INSERT INTO tmp_system_checks
VALUES (
    'C05',
    'security roles and default mappings',
    IF(@c_role_count = 3 AND @c_default_role_count = 3, 'OK', 'FAIL'),
    CONCAT('roles=', @c_role_count, ',default_mappings=', @c_default_role_count)
);

SET @c_members := (SELECT COUNT(*) FROM members);
SET @c_employees := (SELECT COUNT(*) FROM employees);
SET @c_contracts := (SELECT COUNT(*) FROM contracts);
SET @c_invoices := (SELECT COUNT(*) FROM invoices);
SET @c_payments := (SELECT COUNT(*) FROM payments);
INSERT INTO tmp_system_checks
VALUES (
    'C06',
    'seed data key volumes',
    IF(@c_members = 120 AND @c_employees = 20 AND @c_contracts = 120 AND @c_invoices = 182 AND @c_payments = 150, 'OK', 'FAIL'),
    CONCAT('m=', @c_members, ',e=', @c_employees, ',c=', @c_contracts, ',i=', @c_invoices, ',p=', @c_payments)
);

SET @c_bad_suspended := (
    SELECT COUNT(*)
    FROM contracts
    WHERE status = 'suspended'
      AND freeze_start_date IS NULL
);
INSERT INTO tmp_system_checks
VALUES ('C07', 'suspended contract freeze integrity', IF(@c_bad_suspended = 0, 'OK', 'FAIL'), CONCAT('bad_rows=', @c_bad_suspended));

SET @c_bad_denied_member := (
    SELECT COUNT(*)
    FROM access_log
    WHERE access_status = 'denied'
      AND (denial_reason IS NULL OR TRIM(denial_reason) = '')
);
SET @c_bad_denied_guest := (
    SELECT COUNT(*)
    FROM guest_access_log
    WHERE access_status = 'denied'
      AND (denial_reason IS NULL OR TRIM(denial_reason) = '')
);
INSERT INTO tmp_system_checks
VALUES (
    'C08',
    'denied access reason integrity',
    IF(@c_bad_denied_member = 0 AND @c_bad_denied_guest = 0, 'OK', 'FAIL'),
    CONCAT('member_bad=', @c_bad_denied_member, ',guest_bad=', @c_bad_denied_guest)
);

SET @c_failed_without_error := (
    SELECT COUNT(*)
    FROM payments
    WHERE status = 'failed'
      AND (error_code IS NULL OR TRIM(error_code) = '')
);
INSERT INTO tmp_system_checks
VALUES ('C09', 'failed payment error code integrity', IF(@c_failed_without_error = 0, 'OK', 'FAIL'), CONCAT('bad_rows=', @c_failed_without_error));

WITH sponsor_latest AS (
    SELECT
        c.member_id,
        c.plan_id,
        ROW_NUMBER() OVER (PARTITION BY c.member_id ORDER BY c.start_date DESC, c.id DESC) AS rn
    FROM contracts c
    WHERE c.status = 'active'
),
active_guest_sponsors AS (
    SELECT
        g.sponsor_member_id,
        COUNT(*) AS active_guest_count
    FROM guests g
    WHERE g.status = 'active'
    GROUP BY g.sponsor_member_id
),
violations AS (
    SELECT
        ags.sponsor_member_id,
        ags.active_guest_count,
        sp.duo_pass_allowed
    FROM active_guest_sponsors ags
    LEFT JOIN sponsor_latest sl
           ON sl.member_id = ags.sponsor_member_id
          AND sl.rn = 1
    LEFT JOIN subscription_plans sp
           ON sp.id = sl.plan_id
    WHERE ags.active_guest_count > 1
       OR COALESCE(sp.duo_pass_allowed, 0) = 0
)
SELECT COUNT(*) INTO @c_guest_policy_violations FROM violations;
INSERT INTO tmp_system_checks
VALUES ('C10', 'active guest policy integrity', IF(@c_guest_policy_violations = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_guest_policy_violations));

SET @c_blank_invoice_number := (
    SELECT COUNT(*)
    FROM invoices
    WHERE invoice_number IS NULL OR invoice_number = ''
);
INSERT INTO tmp_system_checks
VALUES ('C11', 'invoice number generation integrity', IF(@c_blank_invoice_number = 0, 'OK', 'FAIL'), CONCAT('blank_numbers=', @c_blank_invoice_number));

SET @c_future_sessions := (
    SELECT COUNT(*)
    FROM class_sessions
    WHERE starts_at >= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      AND starts_at <  DATE_ADD(CURDATE(), INTERVAL 15 DAY)
);
INSERT INTO tmp_system_checks
VALUES ('C12', 'future class session coverage', IF(@c_future_sessions = 20, 'OK', 'FAIL'), CONCAT('sessions_14d=', @c_future_sessions));

SET @c_booking_mismatch := (
    SELECT COUNT(*)
    FROM bookings b
    JOIN class_sessions cs ON cs.id = b.session_id
    LEFT JOIN contracts c
           ON c.member_id = b.member_id
          AND c.status = 'active'
          AND (c.end_date IS NULL OR c.end_date >= CURDATE())
    LEFT JOIN subscription_plans sp
           ON sp.id = c.plan_id
    WHERE b.status = 'confirmed'
      AND (
          c.id IS NULL
          OR (sp.limited_club_access = 1 AND c.home_club_id <> cs.club_id)
      )
);
INSERT INTO tmp_system_checks
VALUES ('C13', 'confirmed booking club coherence', IF(@c_booking_mismatch = 0, 'OK', 'FAIL'), CONCAT('mismatches=', @c_booking_mismatch));

SET @c_custom_index_count := (
    SELECT COUNT(DISTINCT index_name)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND index_name IN (
          'idx_clubs_city_status',
          'idx_members_city_status',
          'idx_members_goal_source',
          'idx_contracts_status_end_date',
          'idx_contracts_member_status_start',
          'idx_contract_options_contract_dates',
          'idx_contract_options_contract_removed',
          'idx_invoices_status_due_date',
          'idx_invoices_contract_period_status',
          'idx_payments_status_paid_at',
          'idx_access_log_club_status_at',
          'idx_guest_access_log_club_status_at',
          'idx_class_sessions_club_start',
          'idx_maintenance_status_priority_reported'
      )
);
INSERT INTO tmp_system_checks
VALUES ('C14', 'custom index deployment', IF(@c_custom_index_count = 14, 'OK', 'FAIL'), CONCAT('indexes=', @c_custom_index_count));

SET @c_invalid_session_instructors := (
    SELECT COUNT(*)
    FROM class_sessions cs
    JOIN employees e ON e.id = cs.instructor_id
    WHERE e.role NOT IN ('instructor', 'intern')
       OR e.club_id <> cs.club_id
);
INSERT INTO tmp_system_checks
VALUES ('C15', 'session instructor role and club integrity', IF(@c_invalid_session_instructors = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_invalid_session_instructors));

SET @c_booking_policy_violations := (
    SELECT COUNT(*)
    FROM bookings b
    JOIN class_sessions cs ON cs.id = b.session_id
    JOIN clubs cl ON cl.id = cs.club_id
    JOIN members m ON m.id = b.member_id
    LEFT JOIN contracts c
           ON c.member_id = b.member_id
          AND c.status = 'active'
          AND (c.end_date IS NULL OR c.end_date >= DATE(cs.starts_at))
    LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
    WHERE b.status IN ('confirmed', 'waitlisted')
      AND (
          cl.operational_status <> 'open'
          OR m.status <> 'active'
          OR c.id IS NULL
          OR (sp.limited_club_access = 1 AND c.home_club_id <> cs.club_id)
          OR cs.starts_at <= b.booked_at
      )
);
INSERT INTO tmp_system_checks
VALUES ('C16', 'booking policy integrity', IF(@c_booking_policy_violations = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_booking_policy_violations));

SET @c_contract_policy_violations := (
    SELECT COUNT(*)
    FROM contracts c
    WHERE (
            c.status = 'suspended'
            AND (c.freeze_start_date IS NULL OR c.freeze_end_date IS NULL)
          )
       OR (
            c.status = 'cancelled'
            AND (
                c.cancelled_on IS NULL
                OR c.cancellation_reason IS NULL
                OR TRIM(c.cancellation_reason) = ''
            )
          )
       OR (
            c.status = 'active'
            AND (
                c.freeze_start_date IS NOT NULL
                OR c.freeze_end_date IS NOT NULL
                OR c.cancelled_on IS NOT NULL
            )
          )
);
INSERT INTO tmp_system_checks
VALUES ('C17', 'contract status metadata integrity', IF(@c_contract_policy_violations = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_contract_policy_violations));

SET @c_active_guest_policy_violations := (
    SELECT COUNT(*)
    FROM guests g
    LEFT JOIN members m ON m.id = g.sponsor_member_id
    LEFT JOIN (
        SELECT DISTINCT c.member_id
        FROM contracts c
        JOIN subscription_plans sp ON sp.id = c.plan_id
        WHERE c.status = 'active'
          AND (c.end_date IS NULL OR c.end_date >= CURDATE())
          AND sp.duo_pass_allowed = 1
    ) dq ON dq.member_id = g.sponsor_member_id
    WHERE g.status = 'active'
      AND (
          g.sponsor_member_id IS NULL
          OR m.status <> 'active'
          OR dq.member_id IS NULL
      )
);
INSERT INTO tmp_system_checks
VALUES ('C18', 'active guest sponsor duo-pass integrity', IF(@c_active_guest_policy_violations = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_active_guest_policy_violations));

SET @c_maintenance_policy_violations := (
    SELECT COUNT(*)
    FROM maintenance_tickets mt
    LEFT JOIN employees e ON e.id = mt.technician_id
    WHERE (
            mt.status = 'resolved'
            AND mt.resolved_at IS NULL
          )
       OR (
            mt.status <> 'resolved'
            AND mt.resolved_at IS NOT NULL
          )
       OR (
            mt.status IN ('assigned', 'in_progress', 'resolved')
            AND mt.technician_id IS NULL
          )
       OR (
            mt.technician_id IS NOT NULL
            AND (e.id IS NULL OR e.role NOT IN ('technician', 'manager', 'management'))
          )
);
INSERT INTO tmp_system_checks
VALUES ('C19', 'maintenance lifecycle and technician integrity', IF(@c_maintenance_policy_violations = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_maintenance_policy_violations));

SET @c_session_policy_violations := (
    SELECT COUNT(*)
    FROM class_sessions cs
    JOIN courses c ON c.id = cs.course_id
    WHERE cs.starts_at <= NOW(3)
       OR cs.starts_at > NOW(3) + INTERVAL 180 DAY
       OR cs.duration_minutes <> c.duration_minutes
       OR cs.enrolled_count > c.max_capacity
);
INSERT INTO tmp_system_checks
VALUES ('C20', 'class session timing/capacity integrity', IF(@c_session_policy_violations = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_session_policy_violations));

SET @c_payment_policy_violations := (
    SELECT COUNT(*)
    FROM payments p
    JOIN invoices i ON i.id = p.invoice_id
    WHERE (
            p.status = 'failed'
            AND (p.error_code IS NULL OR TRIM(p.error_code) = '')
          )
       OR (
            p.status <> 'failed'
            AND p.error_code IS NOT NULL
            AND TRIM(p.error_code) <> ''
          )
       OR (
            p.status IN ('succeeded', 'refunded')
            AND (p.transaction_reference IS NULL OR TRIM(p.transaction_reference) = '')
          )
       OR (
            p.status = 'succeeded'
            AND i.status = 'cancelled'
          )
       OR (
            p.paid_at > NOW(3) + INTERVAL 1 DAY
          )
);
INSERT INTO tmp_system_checks
VALUES ('C21', 'payment status/reference/date integrity', IF(@c_payment_policy_violations = 0, 'OK', 'FAIL'), CONCAT('violations=', @c_payment_policy_violations));

SELECT * FROM tmp_system_checks ORDER BY check_id;

SELECT
    COUNT(*) AS total_checks,
    SUM(CASE WHEN status = 'OK' THEN 1 ELSE 0 END) AS passed_checks,
    SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) AS failed_checks,
    ROUND(100 * SUM(CASE WHEN status = 'OK' THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate_pct
FROM tmp_system_checks;
