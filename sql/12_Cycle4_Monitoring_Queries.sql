USE riada_db;

-- ============================================================================
-- Cycle 4 Monitoring Queries (idempotent/read-only)
-- Purpose:
--   - detect trigger integrity drift
--   - surface slow-risk operational patterns
--   - review practical index usage
-- ============================================================================

SET @monitor_window_hours := 24;
SET @retry_alert_threshold := 3;
SET @denied_access_alert_threshold := 75;
SET @booking_velocity_alert_threshold := 40;

-- 1) Trigger health scoreboard (integrity checks)
SELECT
    check_name,
    issue_count,
    CASE
        WHEN issue_count = 0 THEN 'ok'
        ELSE 'alert'
    END AS status
FROM (
    SELECT
        'guest_duo_pass_violations' AS check_name,
        COUNT(*) AS issue_count
    FROM (
        SELECT sponsor_member_id
        FROM guests
        WHERE status = 'active'
        GROUP BY sponsor_member_id
        HAVING sponsor_member_id IS NOT NULL AND COUNT(*) > 1
    ) v

    UNION ALL

    SELECT
        'class_session_enrollment_drift' AS check_name,
        COUNT(*) AS issue_count
    FROM (
        SELECT cs.id
        FROM class_sessions cs
        LEFT JOIN bookings b
          ON b.session_id = cs.id
         AND b.status = 'confirmed'
        GROUP BY cs.id, cs.enrolled_count
        HAVING cs.enrolled_count <> COUNT(b.member_id)
    ) v

    UNION ALL

    SELECT
        'invoice_paid_status_mismatch' AS check_name,
        COUNT(*) AS issue_count
    FROM invoices
    WHERE status = 'paid'
      AND balance_due > 0.01

    UNION ALL

    SELECT
        'invoice_partial_status_mismatch' AS check_name,
        COUNT(*) AS issue_count
    FROM invoices
    WHERE status = 'partially_paid'
      AND (amount_paid <= 0.01 OR balance_due <= 0.01)

    UNION ALL

    SELECT
        'failed_payment_without_error_code' AS check_name,
        COUNT(*) AS issue_count
    FROM payments
    WHERE status = 'failed'
      AND (error_code IS NULL OR TRIM(error_code) = '')
) checks
ORDER BY check_name;

-- 2) Slow-risk payment patterns (high retry invoices in monitoring window)
SELECT
    p.invoice_id,
    COUNT(*) AS payment_attempts,
    SUM(CASE WHEN p.status = 'failed' THEN 1 ELSE 0 END) AS failed_attempts,
    ROUND(SUM(CASE WHEN p.status = 'failed' THEN p.amount ELSE 0 END), 2) AS failed_amount_total
FROM payments p
WHERE p.created_at >= NOW(3) - INTERVAL @monitor_window_hours HOUR
GROUP BY p.invoice_id
HAVING COUNT(*) > @retry_alert_threshold
ORDER BY payment_attempts DESC, failed_attempts DESC, p.invoice_id;

-- 3) Access denial spikes (monitoring window)
SELECT
    a.club_id,
    COUNT(*) AS denied_attempts,
    SUM(CASE WHEN denial_reason IS NULL OR TRIM(denial_reason) = '' THEN 1 ELSE 0 END) AS missing_reason_count
FROM (
    SELECT club_id, denial_reason
    FROM access_log
    WHERE access_status = 'denied'
      AND accessed_at >= NOW(3) - INTERVAL @monitor_window_hours HOUR

    UNION ALL

    SELECT club_id, denial_reason
    FROM guest_access_log
    WHERE access_status = 'denied'
      AND accessed_at >= NOW(3) - INTERVAL @monitor_window_hours HOUR
) a
GROUP BY a.club_id
HAVING COUNT(*) > @denied_access_alert_threshold
ORDER BY denied_attempts DESC, a.club_id;

-- 4) Booking velocity and capacity pressure (monitoring window)
SELECT
    b.session_id,
    cs.club_id,
    cs.starts_at,
    COUNT(*) AS booking_events_24h,
    cs.enrolled_count,
    c.max_capacity,
    ROUND((cs.enrolled_count / NULLIF(c.max_capacity, 0)) * 100, 1) AS fill_pct
FROM bookings b
JOIN class_sessions cs ON cs.id = b.session_id
JOIN courses c ON c.id = cs.course_id
WHERE b.booked_at >= NOW(3) - INTERVAL @monitor_window_hours HOUR
GROUP BY b.session_id, cs.club_id, cs.starts_at, cs.enrolled_count, c.max_capacity
HAVING COUNT(*) > @booking_velocity_alert_threshold OR fill_pct >= 95
ORDER BY fill_pct DESC, booking_events_24h DESC, b.session_id;

-- 5) Index usage checks on trigger-heavy tables (startup-reset metric)
SELECT
    OBJECT_NAME AS table_name,
    INDEX_NAME AS index_name,
    COUNT_READ AS read_ops,
    COUNT_WRITE AS write_ops,
    CASE
        WHEN COUNT_READ = 0 AND COUNT_WRITE > 0 THEN 'investigate_unused'
        ELSE 'ok'
    END AS usage_status
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = DATABASE()
  AND INDEX_NAME IS NOT NULL
  AND OBJECT_NAME IN (
      'access_log',
      'bookings',
      'class_sessions',
      'contracts',
      'guests',
      'invoices',
      'payments'
  )
ORDER BY usage_status DESC, write_ops DESC, read_ops ASC, table_name, index_name;

-- 6) Statement digest latency focused on trigger-heavy DML
SELECT
    DIGEST,
    LEFT(DIGEST_TEXT, 180) AS digest_sample,
    COUNT_STAR AS exec_count,
    ROUND(SUM_TIMER_WAIT / 1000000000000, 3) AS total_seconds,
    ROUND((SUM_TIMER_WAIT / NULLIF(COUNT_STAR, 0)) / 1000000000, 3) AS avg_ms,
    SUM_LOCK_TIME
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = DATABASE()
  AND (
      LOWER(DIGEST_TEXT) LIKE 'insert into `payments`%'
      OR LOWER(DIGEST_TEXT) LIKE 'insert into `bookings`%'
      OR LOWER(DIGEST_TEXT) LIKE 'update `bookings`%'
      OR LOWER(DIGEST_TEXT) LIKE 'update `class_sessions`%'
      OR LOWER(DIGEST_TEXT) LIKE 'insert into `guests`%'
      OR LOWER(DIGEST_TEXT) LIKE 'update `guests`%'
  )
ORDER BY avg_ms DESC, exec_count DESC
LIMIT 25;

-- 7) Current lock wait snapshot for trigger-managed tables
SELECT
    wl.OBJECT_SCHEMA AS schema_name,
    wl.OBJECT_NAME AS table_name,
    wl.INDEX_NAME AS waiting_index,
    bl.INDEX_NAME AS blocking_index,
    w.REQUESTING_ENGINE_TRANSACTION_ID AS waiting_trx_id,
    w.BLOCKING_ENGINE_TRANSACTION_ID AS blocking_trx_id
FROM performance_schema.data_lock_waits w
JOIN performance_schema.data_locks wl
  ON wl.ENGINE_LOCK_ID = w.REQUESTING_ENGINE_LOCK_ID
JOIN performance_schema.data_locks bl
  ON bl.ENGINE_LOCK_ID = w.BLOCKING_ENGINE_LOCK_ID
WHERE wl.OBJECT_SCHEMA = DATABASE()
  AND wl.OBJECT_NAME IN ('bookings', 'class_sessions', 'guests', 'invoices', 'payments')
ORDER BY wl.OBJECT_NAME, waiting_trx_id;
