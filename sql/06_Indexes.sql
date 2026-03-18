USE riada_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_create_index_if_missing$$
CREATE PROCEDURE sp_create_index_if_missing(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_index_columns VARCHAR(512)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = p_table_name
          AND index_name = p_index_name
    ) THEN
        SET @ddl = CONCAT(
            'CREATE INDEX `', p_index_name, '` ON `', p_table_name, '` (', p_index_columns, ')'
        );
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL sp_create_index_if_missing('clubs', 'idx_clubs_city_status', '`address_city`,`operational_status`');
CALL sp_create_index_if_missing('members', 'idx_members_city_status', '`address_city`,`status`');
CALL sp_create_index_if_missing('members', 'idx_members_goal_source', '`primary_goal`,`acquisition_source`');
CALL sp_create_index_if_missing('contracts', 'idx_contracts_status_end_date', '`status`,`end_date`');
CALL sp_create_index_if_missing('contracts', 'idx_contracts_member_status_start', '`member_id`,`status`,`start_date`');
CALL sp_create_index_if_missing('contract_options', 'idx_contract_options_contract_dates', '`contract_id`,`added_on`,`removed_on`');
CALL sp_create_index_if_missing('contract_options', 'idx_contract_options_contract_removed', '`contract_id`,`removed_on`');
CALL sp_create_index_if_missing('invoices', 'idx_invoices_status_due_date', '`status`,`due_date`');
CALL sp_create_index_if_missing('invoices', 'idx_invoices_contract_period_status', '`contract_id`,`billing_period_start`,`status`');
CALL sp_create_index_if_missing('payments', 'idx_payments_status_paid_at', '`status`,`paid_at`');
CALL sp_create_index_if_missing('access_log', 'idx_access_log_club_status_at', '`club_id`,`access_status`,`accessed_at`');
CALL sp_create_index_if_missing('guest_access_log', 'idx_guest_access_log_club_status_at', '`club_id`,`access_status`,`accessed_at`');
CALL sp_create_index_if_missing('class_sessions', 'idx_class_sessions_club_start', '`club_id`,`starts_at`');
CALL sp_create_index_if_missing('maintenance_tickets', 'idx_maintenance_status_priority_reported', '`status`,`priority`,`reported_at`');
CALL sp_create_index_if_missing('shifts', 'idx_shifts_employee_date', '`employee_id`,`date`');
CALL sp_create_index_if_missing('shifts', 'idx_shifts_club_date', '`club_id`,`date`');

DROP PROCEDURE IF EXISTS sp_create_index_if_missing;

SELECT
    table_name,
    index_name,
    GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS index_columns
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
      'idx_maintenance_status_priority_reported',
      'idx_shifts_employee_date',
      'idx_shifts_club_date'
  )
GROUP BY table_name, index_name
ORDER BY table_name, index_name;
