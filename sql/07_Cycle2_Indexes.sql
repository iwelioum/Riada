-- ============================================================================
-- Cycle 2 Database Optimization: Strategic Composite Indexes
-- Created: 2026-03-16
-- Purpose: Fix N+1 query patterns and improve pagination performance
-- ============================================================================

USE riada_db;

DELIMITER $$

-- Stored procedure to safely create indexes
DROP PROCEDURE IF EXISTS sp_create_index_if_missing_v2$$
CREATE PROCEDURE sp_create_index_if_missing_v2(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_index_columns VARCHAR(512),
    IN p_description VARCHAR(255)
)
BEGIN
    DECLARE v_index_exists INT;
    
    SELECT COUNT(*) INTO v_index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name;
    
    IF v_index_exists = 0 THEN
        SET @ddl = CONCAT(
            'CREATE INDEX `', p_index_name, '` ON `', p_table_name, '` (', p_index_columns, ')'
        );
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✓ Created index: ', p_index_name, ' on ', p_table_name, ' - ', p_description) AS status;
    ELSE
        SELECT CONCAT('⊘ Index already exists: ', p_index_name) AS status;
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- Index 1: idx_guests_active_status
-- Purpose: Optimize ListGuestsUseCase pagination query
-- Query Pattern: SELECT * FROM guests WHERE status = 'active' ORDER BY last_name, first_name LIMIT 50 OFFSET 0
-- Impact: Reduces full table scan; status filtering + sort key included
-- ============================================================================
CALL sp_create_index_if_missing_v2(
    'guests', 
    'idx_guests_active_status',
    '`status`, `last_name`, `first_name`',
    'Optimize guest list pagination and active status filtering'
);

-- ============================================================================
-- Index 2: idx_contracts_member_active
-- Purpose: Optimize contract queries for active contracts by member
-- Query Pattern: SELECT * FROM contracts WHERE member_id = ? AND status IN ('active','suspended')
-- Impact: Fast member contract lookup; enables contract list pagination
-- ============================================================================
CALL sp_create_index_if_missing_v2(
    'contracts',
    'idx_contracts_member_active',
    '`member_id`, `status`, `start_date`',
    'Optimize contract queries by member and status with date ordering'
);

-- ============================================================================
-- Index 3: idx_invoices_contract_status
-- Purpose: Optimize invoice queries for contract billing
-- Query Pattern: SELECT * FROM invoices WHERE contract_id = ? AND status IN ('issued','overdue','paid')
-- Impact: Fast invoice lookup by contract; enables invoice listing
-- ============================================================================
CALL sp_create_index_if_missing_v2(
    'invoices',
    'idx_invoices_contract_status',
    '`contract_id`, `status`, `billing_period_start`',
    'Optimize invoice queries by contract and status with period ordering'
);

-- ============================================================================
-- Index 4: idx_class_sessions_club_date
-- Purpose: Optimize class session queries for club schedule
-- Query Pattern: SELECT * FROM class_sessions WHERE club_id = ? AND starts_at >= ? ORDER BY starts_at
-- Impact: Fast session lookup by club and date; enables session listing
-- ============================================================================
CALL sp_create_index_if_missing_v2(
    'class_sessions',
    'idx_class_sessions_club_date',
    '`club_id`, `starts_at`',
    'Optimize class session queries by club and date for schedule display'
);

-- ============================================================================
-- Verify all indexes were created
-- ============================================================================
SELECT
    table_name,
    index_name,
    GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ', ') AS index_columns,
    seq_in_index,
    column_name
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND index_name IN (
      'idx_guests_active_status',
      'idx_contracts_member_active',
      'idx_invoices_contract_status',
      'idx_class_sessions_club_date'
  )
GROUP BY table_name, index_name
ORDER BY table_name, index_name;

-- ============================================================================
-- Performance analysis: Show index cardinality and selectivity
-- ============================================================================
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    STAT_NAME,
    STAT_VALUE,
    SAMPLE_SIZE,
    STAT_DESCRIPTION
FROM mysql.innodb_index_stats
WHERE OBJECT_SCHEMA = DATABASE()
  AND INDEX_NAME IN (
      'idx_guests_active_status',
      'idx_contracts_member_active',
      'idx_invoices_contract_status',
      'idx_class_sessions_club_date'
  )
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

DROP PROCEDURE IF EXISTS sp_create_index_if_missing_v2;

-- End of script
