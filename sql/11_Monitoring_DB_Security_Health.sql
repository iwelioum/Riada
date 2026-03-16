USE riada_db;

DROP TEMPORARY TABLE IF EXISTS tmp_operability_checks;
CREATE TEMPORARY TABLE tmp_operability_checks (
    check_id             VARCHAR(10) NOT NULL,
    check_name           VARCHAR(180) NOT NULL,
    status               ENUM('OK','WARN','CRITICAL') NOT NULL,
    metric_value         DECIMAL(18,2) NOT NULL,
    warn_threshold       DECIMAL(18,2) NULL,
    critical_threshold   DECIMAL(18,2) NULL,
    details              VARCHAR(255) NOT NULL,
    PRIMARY KEY (check_id)
) ENGINE=MEMORY;

SET @table_count_warn := 21;
SET @table_count_critical := 20;
SET @failed_payments_warn_24h := 10;
SET @failed_payments_critical_24h := 25;
SET @overdue_invoices_warn := 50;
SET @overdue_invoices_critical := 120;
SET @denied_member_access_warn_1h := 30;
SET @denied_member_access_critical_1h := 80;
SET @denied_guest_access_warn_1h := 10;
SET @denied_guest_access_critical_1h := 30;
SET @denied_without_reason_warn_24h := 1;
SET @denied_without_reason_critical_24h := 10;
SET @unresolved_security_ticket_warn_72h := 3;
SET @unresolved_security_ticket_critical_72h := 8;
SET @suspended_contract_metadata_warn := 1;
SET @suspended_contract_metadata_critical := 5;
SET @failed_payment_error_code_warn_24h := 1;
SET @failed_payment_error_code_critical_24h := 5;

SET @table_count := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
);
INSERT INTO tmp_operability_checks
VALUES (
    'D01',
    'Base table coverage',
    CASE
        WHEN @table_count < @table_count_critical THEN 'CRITICAL'
        WHEN @table_count < @table_count_warn THEN 'WARN'
        ELSE 'OK'
    END,
    @table_count,
    @table_count_warn,
    @table_count_critical,
    CONCAT('tables=', @table_count)
);

SET @overdue_invoices := (
    SELECT COUNT(*)
    FROM invoices
    WHERE status = 'overdue'
      AND due_date < CURDATE()
);
INSERT INTO tmp_operability_checks
VALUES (
    'D02',
    'Overdue invoice backlog',
    CASE
        WHEN @overdue_invoices >= @overdue_invoices_critical THEN 'CRITICAL'
        WHEN @overdue_invoices >= @overdue_invoices_warn THEN 'WARN'
        ELSE 'OK'
    END,
    @overdue_invoices,
    @overdue_invoices_warn,
    @overdue_invoices_critical,
    CONCAT('overdue_invoices=', @overdue_invoices)
);

SET @failed_payments_24h := (
    SELECT COUNT(*)
    FROM payments
    WHERE status = 'failed'
      AND paid_at >= NOW() - INTERVAL 24 HOUR
);
INSERT INTO tmp_operability_checks
VALUES (
    'D03',
    'Failed payments in last 24h',
    CASE
        WHEN @failed_payments_24h >= @failed_payments_critical_24h THEN 'CRITICAL'
        WHEN @failed_payments_24h >= @failed_payments_warn_24h THEN 'WARN'
        ELSE 'OK'
    END,
    @failed_payments_24h,
    @failed_payments_warn_24h,
    @failed_payments_critical_24h,
    CONCAT('failed_payments_24h=', @failed_payments_24h)
);

SET @denied_member_access_1h := (
    SELECT COUNT(*)
    FROM access_log
    WHERE access_status = 'denied'
      AND accessed_at >= NOW() - INTERVAL 1 HOUR
);
INSERT INTO tmp_operability_checks
VALUES (
    'S01',
    'Denied member access in last hour',
    CASE
        WHEN @denied_member_access_1h >= @denied_member_access_critical_1h THEN 'CRITICAL'
        WHEN @denied_member_access_1h >= @denied_member_access_warn_1h THEN 'WARN'
        ELSE 'OK'
    END,
    @denied_member_access_1h,
    @denied_member_access_warn_1h,
    @denied_member_access_critical_1h,
    CONCAT('denied_member_access_1h=', @denied_member_access_1h)
);

SET @denied_guest_access_1h := (
    SELECT COUNT(*)
    FROM guest_access_log
    WHERE access_status = 'denied'
      AND accessed_at >= NOW() - INTERVAL 1 HOUR
);
INSERT INTO tmp_operability_checks
VALUES (
    'S02',
    'Denied guest access in last hour',
    CASE
        WHEN @denied_guest_access_1h >= @denied_guest_access_critical_1h THEN 'CRITICAL'
        WHEN @denied_guest_access_1h >= @denied_guest_access_warn_1h THEN 'WARN'
        ELSE 'OK'
    END,
    @denied_guest_access_1h,
    @denied_guest_access_warn_1h,
    @denied_guest_access_critical_1h,
    CONCAT('denied_guest_access_1h=', @denied_guest_access_1h)
);

SET @denied_without_reason_24h := (
    SELECT COUNT(*)
    FROM (
        SELECT denial_reason
        FROM access_log
        WHERE access_status = 'denied'
          AND accessed_at >= NOW() - INTERVAL 24 HOUR
        UNION ALL
        SELECT denial_reason
        FROM guest_access_log
        WHERE access_status = 'denied'
          AND accessed_at >= NOW() - INTERVAL 24 HOUR
    ) denied_entries
    WHERE denial_reason IS NULL OR TRIM(denial_reason) = ''
);
INSERT INTO tmp_operability_checks
VALUES (
    'S03',
    'Denied access entries without reason (24h)',
    CASE
        WHEN @denied_without_reason_24h >= @denied_without_reason_critical_24h THEN 'CRITICAL'
        WHEN @denied_without_reason_24h >= @denied_without_reason_warn_24h THEN 'WARN'
        ELSE 'OK'
    END,
    @denied_without_reason_24h,
    @denied_without_reason_warn_24h,
    @denied_without_reason_critical_24h,
    CONCAT('missing_denial_reason_24h=', @denied_without_reason_24h)
);

SET @unresolved_security_ticket_72h := (
    SELECT COUNT(*)
    FROM maintenance_tickets
    WHERE status <> 'resolved'
      AND priority IN ('high', 'critical')
      AND reported_at < NOW() - INTERVAL 72 HOUR
);
INSERT INTO tmp_operability_checks
VALUES (
    'S04',
    'Unresolved high/critical tickets >72h',
    CASE
        WHEN @unresolved_security_ticket_72h >= @unresolved_security_ticket_critical_72h THEN 'CRITICAL'
        WHEN @unresolved_security_ticket_72h >= @unresolved_security_ticket_warn_72h THEN 'WARN'
        ELSE 'OK'
    END,
    @unresolved_security_ticket_72h,
    @unresolved_security_ticket_warn_72h,
    @unresolved_security_ticket_critical_72h,
    CONCAT('tickets_open_72h=', @unresolved_security_ticket_72h)
);

SET @suspended_contract_metadata_issues := (
    SELECT COUNT(*)
    FROM contracts
    WHERE status = 'suspended'
      AND (freeze_start_date IS NULL OR freeze_end_date IS NULL)
);
INSERT INTO tmp_operability_checks
VALUES (
    'S05',
    'Suspended contracts with missing freeze metadata',
    CASE
        WHEN @suspended_contract_metadata_issues >= @suspended_contract_metadata_critical THEN 'CRITICAL'
        WHEN @suspended_contract_metadata_issues >= @suspended_contract_metadata_warn THEN 'WARN'
        ELSE 'OK'
    END,
    @suspended_contract_metadata_issues,
    @suspended_contract_metadata_warn,
    @suspended_contract_metadata_critical,
    CONCAT('suspended_contract_metadata_issues=', @suspended_contract_metadata_issues)
);

SET @failed_payment_error_code_issues_24h := (
    SELECT COUNT(*)
    FROM payments
    WHERE status = 'failed'
      AND paid_at >= NOW() - INTERVAL 24 HOUR
      AND (error_code IS NULL OR TRIM(error_code) = '')
);
INSERT INTO tmp_operability_checks
VALUES (
    'S06',
    'Failed payments without error code (24h)',
    CASE
        WHEN @failed_payment_error_code_issues_24h >= @failed_payment_error_code_critical_24h THEN 'CRITICAL'
        WHEN @failed_payment_error_code_issues_24h >= @failed_payment_error_code_warn_24h THEN 'WARN'
        ELSE 'OK'
    END,
    @failed_payment_error_code_issues_24h,
    @failed_payment_error_code_warn_24h,
    @failed_payment_error_code_critical_24h,
    CONCAT('failed_payment_error_code_issues_24h=', @failed_payment_error_code_issues_24h)
);

SELECT
    check_id,
    check_name,
    status,
    metric_value,
    warn_threshold,
    critical_threshold,
    details
FROM tmp_operability_checks
ORDER BY check_id;

SELECT
    COUNT(*) AS total_checks,
    SUM(CASE WHEN status = 'OK' THEN 1 ELSE 0 END) AS ok_checks,
    SUM(CASE WHEN status = 'WARN' THEN 1 ELSE 0 END) AS warn_checks,
    SUM(CASE WHEN status = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_checks,
    ROUND(100 * SUM(CASE WHEN status = 'OK' THEN 1 ELSE 0 END) / COUNT(*), 2) AS ok_rate_pct
FROM tmp_operability_checks;
