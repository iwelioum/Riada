USE riada_db;

DELIMITER $$


DROP PROCEDURE IF EXISTS sp_CheckAccess$$
CREATE PROCEDURE sp_CheckAccess(
    IN  p_member_id  INT UNSIGNED,
    IN  p_club_id    INT UNSIGNED,
    OUT p_decision   VARCHAR(10)
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
BEGIN

    DECLARE v_contract_id    INT UNSIGNED  DEFAULT NULL;
    DECLARE v_home_club_id   INT UNSIGNED  DEFAULT NULL;
    DECLARE v_limited_access TINYINT(1)    DEFAULT 0;
    DECLARE v_member_exists  INT UNSIGNED  DEFAULT 0;
    DECLARE v_log_member_id  INT UNSIGNED  DEFAULT NULL;
    DECLARE v_member_status  VARCHAR(20)   DEFAULT NULL;
    DECLARE v_club_exists    INT UNSIGNED  DEFAULT 0;
    DECLARE v_club_operational_status VARCHAR(30) DEFAULT NULL;
    DECLARE v_overdue_count  INT UNSIGNED  DEFAULT 0;
    DECLARE v_denial_reason  VARCHAR(255)  DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF v_club_exists = 1 THEN
            INSERT INTO access_log
                (member_id, club_id, accessed_at, access_status, denial_reason)
            VALUES
                (v_log_member_id, p_club_id, NOW(3), 'denied', 'Internal system error');
        END IF;
        SET p_decision = 'denied';
    END;

    SET p_decision = 'denied';

    access_checks: BEGIN

        SELECT operational_status INTO v_club_operational_status
        FROM   clubs
        WHERE  id = p_club_id;

        IF v_club_operational_status IS NULL THEN
            SET v_denial_reason = 'Unknown club ID';
            LEAVE access_checks;
        END IF;

        SET v_club_exists = 1;

        IF v_club_operational_status <> 'open' THEN
            SET v_denial_reason = 'Club is currently not open';
            LEAVE access_checks;
        END IF;

        SELECT COUNT(*) INTO v_member_exists
        FROM   members
        WHERE  id = p_member_id;

        IF v_member_exists = 0 THEN
            SET v_denial_reason = 'Unknown member ID';
            LEAVE access_checks;
        END IF;

        SET v_log_member_id = p_member_id;

        SELECT status INTO v_member_status
        FROM   members
        WHERE  id = p_member_id;

        IF v_member_status = 'anonymized' THEN
            SET v_denial_reason = 'Member account is anonymized';
            LEAVE access_checks;
        END IF;

        IF v_member_status = 'suspended' THEN
            SET v_denial_reason = 'Member account is suspended';
            LEAVE access_checks;
        END IF;

        SELECT ct.id, ct.home_club_id, sp.limited_club_access
        INTO   v_contract_id, v_home_club_id, v_limited_access
        FROM   contracts          ct
        JOIN   subscription_plans sp ON sp.id = ct.plan_id
        WHERE  ct.member_id = p_member_id
          AND  ct.status    = 'active'
          AND  (ct.end_date IS NULL OR ct.end_date >= CURDATE())
        ORDER  BY ct.start_date DESC
        LIMIT  1;

        IF v_contract_id IS NULL THEN
            SET v_denial_reason = 'No active contract';
            LEAVE access_checks;
        END IF;

        IF v_limited_access = 1 AND v_home_club_id <> p_club_id THEN
            SET v_denial_reason = 'Access restricted to home club (Basic plan)';
            LEAVE access_checks;
        END IF;

        SELECT COUNT(*) INTO v_overdue_count
        FROM   invoices
        WHERE  contract_id = v_contract_id
          AND  status      IN ('overdue', 'partially_paid')
          AND  due_date    < CURDATE();

        IF v_overdue_count > 0 THEN
            SET v_denial_reason = 'Outstanding overdue invoice(s)';
            LEAVE access_checks;
        END IF;

        SET p_decision      = 'granted';
        SET v_denial_reason = NULL;

    END access_checks;

    IF v_club_exists = 1 THEN
        INSERT INTO access_log
            (member_id, club_id, accessed_at, access_status, denial_reason)
        VALUES
            (v_log_member_id, p_club_id, NOW(3), p_decision, v_denial_reason);
    END IF;

END$$


DROP PROCEDURE IF EXISTS sp_CheckAccessGuest$$
CREATE PROCEDURE sp_CheckAccessGuest(
    IN  p_guest_id             INT UNSIGNED,
    IN  p_companion_member_id  INT UNSIGNED,
    IN  p_club_id              INT UNSIGNED,
    OUT p_decision             VARCHAR(10)
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
BEGIN

    DECLARE v_denial_reason         VARCHAR(255)       DEFAULT 'Unknown reason';
    DECLARE v_guest_status          ENUM('active','banned') DEFAULT NULL;
    DECLARE v_guest_age             INT                DEFAULT 0;
    DECLARE v_guest_exists          INT UNSIGNED       DEFAULT 0;
    DECLARE v_club_exists           INT UNSIGNED       DEFAULT 0;
    DECLARE v_club_operational_status VARCHAR(30)      DEFAULT NULL;
    DECLARE v_guest_sponsor_member_id INT UNSIGNED     DEFAULT NULL;
    DECLARE v_companion_member_status VARCHAR(20)      DEFAULT NULL;
    DECLARE v_companion_contract_id INT UNSIGNED       DEFAULT NULL;
    DECLARE v_companion_home_club_id INT UNSIGNED      DEFAULT NULL;
    DECLARE v_companion_limited_access TINYINT(1)      DEFAULT 0;
    DECLARE v_duo_pass_allowed      TINYINT(1)         DEFAULT 0;
    DECLARE v_overdue_count         INT UNSIGNED       DEFAULT 0;
    DECLARE v_companion_access_id   BIGINT UNSIGNED    DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF EXISTS (SELECT 1 FROM guests WHERE id = p_guest_id)
           AND EXISTS (SELECT 1 FROM clubs WHERE id = p_club_id) THEN
            INSERT INTO guest_access_log
                (guest_id, companion_member_id, club_id,
                 accessed_at, access_status, denial_reason)
            VALUES
                (
                    p_guest_id,
                    IF(EXISTS (SELECT 1 FROM members WHERE id = p_companion_member_id), p_companion_member_id, NULL),
                    p_club_id,
                    NOW(3),
                    'denied',
                    'Internal system error'
                );
        END IF;
        SET p_decision = 'denied';
    END;

    SET p_decision = 'denied';

    guest_checks: BEGIN

        SELECT operational_status INTO v_club_operational_status
        FROM   clubs
        WHERE  id = p_club_id;

        IF v_club_operational_status IS NULL THEN
            SET v_denial_reason = 'Unknown club ID';
            LEAVE guest_checks;
        END IF;

        SET v_club_exists = 1;

        IF v_club_operational_status <> 'open' THEN
            SET v_denial_reason = 'Club is currently not open';
            LEAVE guest_checks;
        END IF;

        SELECT COUNT(*) INTO v_guest_exists
        FROM   guests
        WHERE  id = p_guest_id;

        IF v_guest_exists = 0 THEN
            SET v_denial_reason = 'Guest not registered';
            LEAVE guest_checks;
        END IF;

        SELECT status, TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()), sponsor_member_id
        INTO   v_guest_status, v_guest_age, v_guest_sponsor_member_id
        FROM   guests
        WHERE  id = p_guest_id;

        IF v_guest_status = 'banned' THEN
            SET v_denial_reason = 'Guest is banned';
            LEAVE guest_checks;
        END IF;

        IF v_guest_age < 16 THEN
            SET v_denial_reason = 'Guest is under minimum age (16 years)';
            LEAVE guest_checks;
        END IF;

        IF v_guest_sponsor_member_id IS NULL THEN
            SET v_denial_reason = 'Guest has no registered sponsor';
            LEAVE guest_checks;
        END IF;

        IF v_guest_sponsor_member_id <> p_companion_member_id THEN
            SET v_denial_reason = 'Companion member is not the registered sponsor';
            LEAVE guest_checks;
        END IF;

        SELECT status INTO v_companion_member_status
        FROM   members
        WHERE  id = p_companion_member_id;

        IF v_companion_member_status IS NULL THEN
            SET v_denial_reason = 'Companion member not found';
            LEAVE guest_checks;
        END IF;

        IF v_companion_member_status <> 'active' THEN
            SET v_denial_reason = 'Companion member account is not active';
            LEAVE guest_checks;
        END IF;

        SELECT ct.id, sp.duo_pass_allowed, ct.home_club_id, sp.limited_club_access
        INTO   v_companion_contract_id, v_duo_pass_allowed, v_companion_home_club_id, v_companion_limited_access
        FROM   contracts          ct
        JOIN   subscription_plans sp ON sp.id = ct.plan_id
        WHERE  ct.member_id = p_companion_member_id
          AND  ct.status    = 'active'
          AND  (ct.end_date IS NULL OR ct.end_date >= CURDATE())
        ORDER  BY ct.start_date DESC
        LIMIT  1;

        IF v_duo_pass_allowed IS NULL OR v_duo_pass_allowed = 0 THEN
            SET v_denial_reason = 'Companion member does not have an active Duo Pass';
            LEAVE guest_checks;
        END IF;

        IF v_companion_limited_access = 1 AND v_companion_home_club_id <> p_club_id THEN
            SET v_denial_reason = 'Companion member cannot access this club with current plan';
            LEAVE guest_checks;
        END IF;

        SELECT COUNT(*) INTO v_overdue_count
        FROM   invoices
        WHERE  contract_id = v_companion_contract_id
          AND  status      IN ('overdue', 'partially_paid')
          AND  due_date    < CURDATE();

        IF v_overdue_count > 0 THEN
            SET v_denial_reason = 'Companion member has overdue invoice(s)';
            LEAVE guest_checks;
        END IF;

        SELECT id INTO v_companion_access_id
        FROM   access_log
        WHERE  member_id      = p_companion_member_id
          AND  club_id        = p_club_id
          AND  access_status  = 'granted'
          AND  accessed_at   >= NOW(3) - INTERVAL 30 MINUTE
        ORDER  BY accessed_at DESC
        LIMIT  1;

        IF v_companion_access_id IS NULL THEN
            SET v_denial_reason = 'Companion member not present (must have scanned within 30 minutes)';
            LEAVE guest_checks;
        END IF;

        SET p_decision      = 'granted';
        SET v_denial_reason = NULL;

    END guest_checks;

    IF v_guest_exists = 1 AND v_club_exists = 1 THEN
        INSERT INTO guest_access_log
            (guest_id, companion_member_id, club_id,
             accessed_at, access_status, denial_reason)
        VALUES
            (
                p_guest_id,
                IF(EXISTS (SELECT 1 FROM members WHERE id = p_companion_member_id), p_companion_member_id, NULL),
                p_club_id,
                NOW(3),
                p_decision,
                v_denial_reason
            );
    END IF;

END$$


DROP PROCEDURE IF EXISTS sp_GenerateMonthlyInvoice$$
CREATE PROCEDURE sp_GenerateMonthlyInvoice(
    IN  p_contract_id  INT UNSIGNED,
    OUT p_result       VARCHAR(100)
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
proc_label: BEGIN

    DECLARE v_plan_id         INT UNSIGNED  DEFAULT NULL;
    DECLARE v_base_price      DECIMAL(10,2) DEFAULT NULL;
    DECLARE v_plan_name       VARCHAR(100)  DEFAULT NULL;
    DECLARE v_options_total   DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_amount_excl_tax DECIMAL(10,2) DEFAULT NULL;
    DECLARE v_period_start    DATE          DEFAULT NULL;
    DECLARE v_period_end      DATE          DEFAULT NULL;
    DECLARE v_invoice_exists  INT UNSIGNED  DEFAULT 0;
    DECLARE v_invoice_id      INT UNSIGNED  DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_contract_id IS NULL OR p_contract_id = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[SP][sp_GenerateMonthlyInvoice] Invalid input: p_contract_id must be > 0';
    END IF;

    SET v_period_start = DATE_FORMAT(CURDATE(), '%Y-%m-01');
    SET v_period_end   = LAST_DAY(CURDATE());

    START TRANSACTION;

        SELECT ct.plan_id, sp.base_price, sp.plan_name
        INTO   v_plan_id, v_base_price, v_plan_name
        FROM   contracts          ct
        JOIN   members            m  ON m.id  = ct.member_id
        JOIN   subscription_plans sp ON sp.id = ct.plan_id
        WHERE  ct.id     = p_contract_id
          AND  ct.status = 'active'
          AND  m.status  = 'active'
          AND  (ct.end_date IS NULL OR ct.end_date >= CURDATE())
        FOR UPDATE;

        IF v_plan_id IS NULL THEN
            ROLLBACK;
            SET p_result = 'ERROR: contract not found or not active';
            LEAVE proc_label;
        END IF;

        SELECT COUNT(*) INTO v_invoice_exists
        FROM   invoices
        WHERE  contract_id          = p_contract_id
          AND  billing_period_start = v_period_start
          AND  status               <> 'cancelled';

        IF v_invoice_exists > 0 THEN
            ROLLBACK;
            SET p_result = 'SKIP: invoice already generated for this billing period';
            LEAVE proc_label;
        END IF;

        SELECT COALESCE(SUM(so.monthly_price), 0.00) INTO v_options_total
        FROM   contract_options co
        JOIN   service_options  so ON so.id = co.option_id
        WHERE  co.contract_id = p_contract_id
          AND  co.added_on   <= v_period_end
          AND  (co.removed_on IS NULL OR co.removed_on >= v_period_start);

        SET v_amount_excl_tax = v_base_price + v_options_total;

        INSERT INTO invoices
            (contract_id, invoice_number, issued_on, due_date,
             billing_period_start, billing_period_end,
             amount_excl_tax, status)
        VALUES
            (p_contract_id, '', CURDATE(),
             DATE_ADD(CURDATE(), INTERVAL 15 DAY),
             v_period_start, v_period_end,
             v_amount_excl_tax, 'issued');

        SET v_invoice_id = LAST_INSERT_ID();

        INSERT INTO invoice_lines
            (invoice_id, description, line_type, plan_id, quantity, unit_price_excl_tax)
        VALUES
            (v_invoice_id,
             CONCAT('Monthly subscription - ', v_plan_name),
             'subscription', v_plan_id, 1, v_base_price);

        INSERT INTO invoice_lines
            (invoice_id, description, line_type, option_id, quantity, unit_price_excl_tax)
        SELECT
            v_invoice_id,
            CONCAT('Option: ', so.option_name),
            'option',
            so.id,
            1,
            so.monthly_price
        FROM   contract_options co
        JOIN   service_options  so ON so.id = co.option_id
        WHERE  co.contract_id = p_contract_id
          AND  co.added_on   <= v_period_end
          AND  (co.removed_on IS NULL OR co.removed_on >= v_period_start);

    COMMIT;

    SET p_result = CONCAT('OK: invoice generated - id=', v_invoice_id,
                           ', amount_excl_tax=', v_amount_excl_tax, ' EUR');

END proc_label$$


DROP PROCEDURE IF EXISTS sp_FreezeContract$$
CREATE PROCEDURE sp_FreezeContract(
    IN  p_contract_id    INT UNSIGNED,
    IN  p_duration_days  INT UNSIGNED,
    OUT p_result         VARCHAR(100)
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
proc_label: BEGIN

    DECLARE v_status        VARCHAR(20) DEFAULT NULL;
    DECLARE v_end_date      DATE        DEFAULT NULL;
    DECLARE v_contract_type VARCHAR(30) DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_contract_id IS NULL OR p_contract_id = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[SP][sp_FreezeContract] Invalid input: p_contract_id must be > 0';
    END IF;

    IF p_duration_days IS NULL OR p_duration_days = 0 OR p_duration_days > 365 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[SP][sp_FreezeContract] Invalid input: p_duration_days must be between 1 and 365';
    END IF;

    START TRANSACTION;

        SELECT status, end_date, contract_type
        INTO   v_status, v_end_date, v_contract_type
        FROM   contracts
        WHERE  id = p_contract_id
        FOR UPDATE;

        IF v_status IS NULL THEN
            ROLLBACK;
            SET p_result = 'ERROR: contract not found';
            LEAVE proc_label;
        END IF;

        IF v_status <> 'active' THEN
            ROLLBACK;
            SET p_result = CONCAT('ERROR: contract is not active (current status: ', v_status, ')');
            LEAVE proc_label;
        END IF;

        UPDATE contracts
        SET
            status            = 'suspended',
            freeze_start_date = CURDATE(),
            freeze_end_date   = DATE_ADD(CURDATE(), INTERVAL p_duration_days DAY),
            end_date          = CASE
                                    WHEN v_contract_type = 'fixed_term'
                                         AND v_end_date IS NOT NULL
                                    THEN DATE_ADD(v_end_date, INTERVAL p_duration_days DAY)
                                    ELSE v_end_date
                                END
        WHERE  id = p_contract_id;

    COMMIT;

    SET p_result = CONCAT(
        'OK: contract ', p_contract_id,
        ' suspended for ', p_duration_days, ' days',
        ' until ', DATE_ADD(CURDATE(), INTERVAL p_duration_days DAY)
    );

END proc_label$$


DROP PROCEDURE IF EXISTS sp_RenewContract$$
CREATE PROCEDURE sp_RenewContract(
    IN  p_contract_id  INT UNSIGNED,
    OUT p_result       VARCHAR(100)
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
proc_label: BEGIN

    DECLARE v_member_id         INT UNSIGNED  DEFAULT NULL;
    DECLARE v_plan_id           INT UNSIGNED  DEFAULT NULL;
    DECLARE v_home_club_id      INT UNSIGNED  DEFAULT NULL;
    DECLARE v_end_date          DATE          DEFAULT NULL;
    DECLARE v_contract_type     VARCHAR(30)   DEFAULT NULL;
    DECLARE v_status            VARCHAR(20)   DEFAULT NULL;
    DECLARE v_commitment_months INT UNSIGNED  DEFAULT NULL;
    DECLARE v_new_contract_id   INT UNSIGNED  DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_contract_id IS NULL OR p_contract_id = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[SP][sp_RenewContract] Invalid input: p_contract_id must be > 0';
    END IF;

    START TRANSACTION;

        SELECT member_id, plan_id, home_club_id, end_date, contract_type, status
        INTO   v_member_id, v_plan_id, v_home_club_id, v_end_date, v_contract_type, v_status
        FROM   contracts
        WHERE  id = p_contract_id
        FOR UPDATE;

        IF v_member_id IS NULL THEN
            ROLLBACK;
            SET p_result = 'ERROR: contract not found';
            LEAVE proc_label;
        END IF;

        IF v_contract_type = 'open_ended' THEN
            ROLLBACK;
            SET p_result = 'ERROR: open-ended contracts cannot be renewed';
            LEAVE proc_label;
        END IF;

        IF v_status NOT IN ('active', 'expired') THEN
            ROLLBACK;
            SET p_result = CONCAT('ERROR: incompatible contract status (', v_status, ')');
            LEAVE proc_label;
        END IF;

        SELECT commitment_months INTO v_commitment_months
        FROM   subscription_plans
        WHERE  id = v_plan_id;

        UPDATE contracts
        SET    status = 'expired'
        WHERE  id = p_contract_id;

        INSERT INTO contracts
            (member_id, plan_id, home_club_id,
             start_date, end_date, contract_type, status)
        VALUES
            (v_member_id, v_plan_id, v_home_club_id,
             DATE_ADD(COALESCE(v_end_date, CURDATE()), INTERVAL 1 DAY),
             DATE_ADD(
                 DATE_ADD(COALESCE(v_end_date, CURDATE()), INTERVAL 1 DAY),
                 INTERVAL v_commitment_months MONTH
             ),
             'fixed_term', 'active');

        SET v_new_contract_id = LAST_INSERT_ID();

        INSERT INTO contract_options (contract_id, option_id, added_on)
        SELECT v_new_contract_id, option_id, CURDATE()
        FROM   contract_options
        WHERE  contract_id = p_contract_id
          AND  removed_on  IS NULL;

    COMMIT;

    SET p_result = CONCAT(
        'OK: new contract id=', v_new_contract_id,
        ' created from contract ', p_contract_id
    );

END proc_label$$


DROP PROCEDURE IF EXISTS sp_ExpireElapsedContracts$$
CREATE PROCEDURE sp_ExpireElapsedContracts(
    OUT p_count INT
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_count = -1;
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

        UPDATE contracts
        SET    status = 'expired'
        WHERE  status   IN ('active', 'suspended')
          AND  end_date IS NOT NULL
          AND  end_date  < CURDATE();

        SET p_count = ROW_COUNT();

    COMMIT;

END$$


DROP PROCEDURE IF EXISTS sp_AnonymizeMember$$
CREATE PROCEDURE sp_AnonymizeMember(
    IN  p_member_id    INT UNSIGNED,
    IN  p_requested_by VARCHAR(100),
    OUT p_result       VARCHAR(100)
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
proc_label: BEGIN

    DECLARE v_current_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_birth_year     YEAR        DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_member_id IS NULL OR p_member_id = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[SP][sp_AnonymizeMember] Invalid input: p_member_id must be > 0';
    END IF;

    IF p_requested_by IS NULL OR TRIM(p_requested_by) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[SP][sp_AnonymizeMember] Invalid input: p_requested_by must not be empty';
    END IF;

    START TRANSACTION;

        SELECT status, YEAR(date_of_birth)
        INTO   v_current_status, v_birth_year
        FROM   members
        WHERE  id = p_member_id
        FOR UPDATE;

        IF v_current_status IS NULL THEN
            ROLLBACK;
            SET p_result = 'ERROR: member not found';
            LEAVE proc_label;
        END IF;

        IF v_current_status = 'anonymized' THEN
            ROLLBACK;
            SET p_result = 'ERROR: member is already anonymized';
            LEAVE proc_label;
        END IF;

        UPDATE contracts
        SET    status               = 'cancelled',
               cancelled_on        = CURDATE(),
               cancellation_reason = 'GDPR right-to-erasure'
        WHERE  member_id = p_member_id
          AND  status    NOT IN ('expired', 'cancelled');

        UPDATE bookings
        SET    status = 'cancelled'
        WHERE  member_id = p_member_id
          AND  status    = 'confirmed';

        UPDATE members
        SET
            last_name                    = 'ANONYMIZED',
            first_name                   = 'ANONYMIZED',
            email                        = CONCAT('anon_', p_member_id, '@deleted.invalid'),
            mobile_phone                 = NULL,
            address_street               = NULL,
            address_city                 = NULL,
            address_postal_code          = NULL,
            date_of_birth                = MAKEDATE(v_birth_year, 1),
            gender                       = 'unspecified',
            nationality                  = 'ANONYMIZED',
            primary_goal                 = NULL,
            acquisition_source           = NULL,
            referral_member_id           = NULL,
            medical_certificate_provided = 0,
            marketing_consent            = 0,
            gdpr_consent_at              = gdpr_consent_at,
            last_visit_date              = NULL,
            status                       = 'anonymized'
        WHERE  id = p_member_id;

        UPDATE guests
        SET
            last_name     = CONCAT('ANON-GUEST-', id),
            first_name    = 'ANONYMIZED',
            email         = NULL,
            date_of_birth = MAKEDATE(YEAR(date_of_birth), 1),
            status        = 'banned'
        WHERE  sponsor_member_id = p_member_id;

        INSERT INTO audit_gdpr (member_id, anonymized_at, requested_by)
        VALUES (p_member_id, NOW(3), p_requested_by);

    COMMIT;

    SET p_result = CONCAT('OK: member ', p_member_id, ' anonymized (GDPR right-to-erasure)');

END proc_label$$


DROP PROCEDURE IF EXISTS sp_ExpireElapsedInvoices$$
CREATE PROCEDURE sp_ExpireElapsedInvoices(
    OUT p_count INT
)
NOT DETERMINISTIC
SQL SECURITY DEFINER
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_count = -1;
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

        UPDATE invoices
        SET    status = 'overdue'
        WHERE  status   IN ('issued', 'partially_paid')
          AND  due_date  < CURDATE();

        SET p_count = ROW_COUNT();

    COMMIT;

END$$


DELIMITER ;


SELECT
    ROUTINE_NAME     AS `Procedure`,
    SECURITY_TYPE    AS `Security`,
    IS_DETERMINISTIC AS `Deterministic`,
    CREATED          AS `Created`
FROM   information_schema.ROUTINES
WHERE  ROUTINE_SCHEMA = DATABASE()
  AND  ROUTINE_TYPE   = 'PROCEDURE'
ORDER  BY ROUTINE_NAME;
