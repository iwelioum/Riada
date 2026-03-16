USE riada_db;

-- ============================================================================
-- Cycle 4 Task Tracking Update (idempotent)
-- Marks Cycle 4 database tasks as done when db_tasks table is present.
-- Safe no-op when db_tasks does not exist in target environment.
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_mark_cycle4_db_tasks_done;

DELIMITER $$

CREATE PROCEDURE sp_mark_cycle4_db_tasks_done()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'db_tasks'
    ) THEN
        SET @sql_mark_done = 'UPDATE db_tasks SET status = ''done'' WHERE id LIKE ''cycle4-%''';
        PREPARE stmt_mark_done FROM @sql_mark_done;
        EXECUTE stmt_mark_done;
        DEALLOCATE PREPARE stmt_mark_done;

        SET @sql_report = 'SELECT id, title, status FROM db_tasks WHERE id LIKE ''cycle4-%'' ORDER BY id';
        PREPARE stmt_report FROM @sql_report;
        EXECUTE stmt_report;
        DEALLOCATE PREPARE stmt_report;
    ELSE
        SELECT 'db_tasks table not found in current schema; no updates applied.' AS info_message;
    END IF;
END$$

DELIMITER ;

CALL sp_mark_cycle4_db_tasks_done();
DROP PROCEDURE IF EXISTS sp_mark_cycle4_db_tasks_done;
