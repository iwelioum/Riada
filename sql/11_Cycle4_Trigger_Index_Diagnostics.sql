USE riada_db;

-- ============================================================================
-- Cycle 4 Diagnostics: Trigger and Index Integrity Snapshot (idempotent/read-only)
-- ============================================================================

-- 1) Trigger inventory and baseline count
SELECT
    COUNT(*) AS trigger_count,
    CASE
        WHEN COUNT(*) >= 28 THEN 'ok'
        ELSE 'review'
    END AS baseline_status
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE();

SELECT
    TRIGGER_NAME       AS trigger_name,
    EVENT_OBJECT_TABLE AS table_name,
    ACTION_TIMING      AS timing,
    EVENT_MANIPULATION AS event_type
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
ORDER BY EVENT_OBJECT_TABLE, ACTION_TIMING, EVENT_MANIPULATION, TRIGGER_NAME;

-- 2) Tables with multiple triggers per timing/event (execution-order sensitive)
SELECT
    EVENT_OBJECT_TABLE AS table_name,
    ACTION_TIMING      AS timing,
    EVENT_MANIPULATION AS event_type,
    COUNT(*)           AS trigger_count,
    GROUP_CONCAT(TRIGGER_NAME ORDER BY TRIGGER_NAME SEPARATOR ', ') AS trigger_names
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
GROUP BY EVENT_OBJECT_TABLE, ACTION_TIMING, EVENT_MANIPULATION
HAVING COUNT(*) > 1
ORDER BY EVENT_OBJECT_TABLE, ACTION_TIMING, EVENT_MANIPULATION;

-- 3) Trigger complexity heuristics (helps flag heavy triggers for review)
SELECT
    TRIGGER_NAME AS trigger_name,
    EVENT_OBJECT_TABLE AS table_name,
    ROUND(CHAR_LENGTH(ACTION_STATEMENT) / 1024, 2) AS body_kb,
    (CHAR_LENGTH(UPPER(ACTION_STATEMENT)) - CHAR_LENGTH(REPLACE(UPPER(ACTION_STATEMENT), 'SELECT ', ''))) / 7 AS select_count,
    (CHAR_LENGTH(UPPER(ACTION_STATEMENT)) - CHAR_LENGTH(REPLACE(UPPER(ACTION_STATEMENT), 'FOR UPDATE', ''))) / 10 AS for_update_count,
    (CHAR_LENGTH(UPPER(ACTION_STATEMENT)) - CHAR_LENGTH(REPLACE(UPPER(ACTION_STATEMENT), 'SIGNAL SQLSTATE', ''))) / 15 AS signal_count
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
ORDER BY body_kb DESC, select_count DESC, trigger_name;

-- 4) Index catalog on trigger-touched tables
SELECT
    s.TABLE_NAME AS table_name,
    s.INDEX_NAME AS index_name,
    CASE WHEN s.NON_UNIQUE = 0 THEN 'UNIQUE' ELSE 'NON_UNIQUE' END AS uniqueness,
    GROUP_CONCAT(s.COLUMN_NAME ORDER BY s.SEQ_IN_INDEX SEPARATOR ', ') AS index_columns,
    MAX(s.CARDINALITY) AS cardinality_estimate,
    MAX(t.TABLE_ROWS)  AS approx_table_rows
FROM information_schema.STATISTICS s
JOIN information_schema.TABLES t
  ON t.TABLE_SCHEMA = s.TABLE_SCHEMA
 AND t.TABLE_NAME = s.TABLE_NAME
WHERE s.TABLE_SCHEMA = DATABASE()
  AND s.TABLE_NAME IN (
      'access_log',
      'bookings',
      'class_sessions',
      'contracts',
      'guests',
      'invoices',
      'maintenance_tickets',
      'members',
      'payments'
  )
GROUP BY s.TABLE_NAME, s.INDEX_NAME, s.NON_UNIQUE
ORDER BY s.TABLE_NAME, s.INDEX_NAME;

-- 5) Potential left-prefix duplicate indexes (investigate before cleanup)
WITH idx AS (
    SELECT
        TABLE_NAME,
        INDEX_NAME,
        NON_UNIQUE,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX SEPARATOR ',') AS cols
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND INDEX_NAME <> 'PRIMARY'
      AND TABLE_NAME IN (
          'access_log',
          'bookings',
          'class_sessions',
          'contracts',
          'guests',
          'invoices',
          'maintenance_tickets',
          'members',
          'payments'
      )
    GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
)
SELECT
    a.TABLE_NAME AS table_name,
    a.INDEX_NAME AS narrower_index,
    b.INDEX_NAME AS wider_index,
    a.cols       AS narrower_columns,
    b.cols       AS wider_columns
FROM idx a
JOIN idx b
  ON b.TABLE_NAME = a.TABLE_NAME
 AND b.NON_UNIQUE = a.NON_UNIQUE
 AND b.INDEX_NAME <> a.INDEX_NAME
WHERE b.cols LIKE CONCAT(a.cols, ',%')
ORDER BY a.TABLE_NAME, a.INDEX_NAME, b.INDEX_NAME;

-- 6) Required index presence for trigger-critical predicates
SELECT
    p.probe_name,
    p.table_name,
    p.expected_index,
    CASE WHEN MIN(s.INDEX_NAME) IS NULL THEN 'missing' ELSE 'present' END AS status,
    COALESCE(GROUP_CONCAT(DISTINCT s.COLUMN_NAME ORDER BY s.SEQ_IN_INDEX SEPARATOR ', '), '') AS actual_columns
FROM (
    SELECT 'guest_limit_lookup' AS probe_name, 'guests' AS table_name, 'idx_guests_sponsor_status' AS expected_index
    UNION ALL
    SELECT 'contract_policy_lookup', 'contracts', 'idx_contracts_member_status_end'
    UNION ALL
    SELECT 'contract_policy_lookup_alt', 'contracts', 'idx_contracts_member_active'
    UNION ALL
    SELECT 'booking_session_lookup', 'bookings', 'idx_bookings_session'
    UNION ALL
    SELECT 'payment_status_reporting', 'payments', 'idx_payments_status_paid_at'
) p
LEFT JOIN information_schema.STATISTICS s
  ON s.TABLE_SCHEMA = DATABASE()
 AND s.TABLE_NAME = p.table_name
 AND s.INDEX_NAME = p.expected_index
GROUP BY p.probe_name, p.table_name, p.expected_index
ORDER BY p.table_name, p.probe_name;
