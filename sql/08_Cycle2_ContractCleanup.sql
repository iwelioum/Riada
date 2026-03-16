-- ============================================================================
-- Cycle 2 Database Optimization: Contract Data Cleanup and Integrity
-- Created: 2026-03-16
-- Purpose: Fix freeze_dates orphaned references and enforce data consistency
-- ============================================================================

USE riada_db;

-- ============================================================================
-- Step 1: Data Audit - Find dangling freeze_dates references
-- ============================================================================
SELECT 
    id,
    status,
    freeze_start_date,
    freeze_end_date,
    created_at,
    CASE 
        WHEN status != 'suspended' AND (freeze_start_date IS NOT NULL OR freeze_end_date IS NOT NULL)
        THEN 'ORPHANED'
        ELSE 'OK'
    END AS freeze_dates_status
FROM contracts
WHERE (freeze_start_date IS NOT NULL OR freeze_end_date IS NOT NULL)
  AND status != 'suspended'
ORDER BY id;

-- ============================================================================
-- Step 2: Identify problematic records
-- ============================================================================
SELECT 
    COUNT(*) as orphaned_records,
    GROUP_CONCAT(id SEPARATOR ', ') as contract_ids
FROM contracts
WHERE (freeze_start_date IS NOT NULL OR freeze_end_date IS NOT NULL)
  AND status != 'suspended';

-- ============================================================================
-- Step 3: Clean up orphaned freeze_dates on active contracts
-- This transaction safely removes freeze_dates from contracts that are not suspended
-- ============================================================================
START TRANSACTION;

UPDATE contracts
SET freeze_start_date = NULL, freeze_end_date = NULL
WHERE (freeze_start_date IS NOT NULL OR freeze_end_date IS NOT NULL)
  AND status != 'suspended';

SELECT ROW_COUNT() AS cleaned_records;

COMMIT;

-- ============================================================================
-- Step 4: Data Integrity Check - Verify the cleanup
-- ============================================================================
SELECT 
    COUNT(*) as remaining_orphaned,
    GROUP_CONCAT(id SEPARATOR ', ') as contract_ids
FROM contracts
WHERE (freeze_start_date IS NOT NULL OR freeze_end_date IS NOT NULL)
  AND status != 'suspended';

-- ============================================================================
-- Step 5: Summary Report
-- ============================================================================
SELECT 
    'Contract Freeze Dates Integrity Report' as report_title,
    COUNT(*) as total_contracts,
    SUM(CASE WHEN status = 'suspended' AND freeze_start_date IS NOT NULL THEN 1 ELSE 0 END) as suspended_with_dates,
    SUM(CASE WHEN status = 'active' AND freeze_start_date IS NULL THEN 1 ELSE 0 END) as active_without_dates,
    SUM(CASE WHEN status = 'active' AND freeze_start_date IS NOT NULL THEN 1 ELSE 0 END) as active_with_dates_issue,
    SUM(CASE WHEN freeze_start_date > freeze_end_date THEN 1 ELSE 0 END) as invalid_date_ranges
FROM contracts;

-- End of script
