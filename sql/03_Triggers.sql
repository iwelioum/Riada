USE riada_db;

DELIMITER $$


DROP TRIGGER IF EXISTS trg_before_payment_insert_integrity$$
CREATE TRIGGER trg_before_payment_insert_integrity
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE v_balance_due    DECIMAL(10,2) DEFAULT NULL;
    DECLARE v_invoice_status VARCHAR(20)   DEFAULT NULL;

    SELECT balance_due, status
    INTO   v_balance_due, v_invoice_status
    FROM   invoices
    WHERE  id = NEW.invoice_id
    FOR UPDATE;

    IF v_balance_due IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Invoice not found. Value: invalid invoice_id';
    END IF;

    IF NEW.status = 'failed' AND (NEW.error_code IS NULL OR TRIM(NEW.error_code) = '') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Failed payment missing error code. Value: error_code required';
    END IF;

    IF NEW.status <> 'failed' AND NEW.error_code IS NOT NULL AND TRIM(NEW.error_code) <> '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Non-failed payment cannot carry error code. Value: clear error_code';
    END IF;

    IF NEW.status = 'succeeded' AND v_invoice_status IN ('paid', 'cancelled') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Payment not allowed for paid/cancelled invoice. Value: invalid invoice state';
    END IF;

    IF NEW.status = 'succeeded' AND NEW.amount > v_balance_due + 0.01 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Payment exceeds invoice balance due. Value: overpayment blocked';
    END IF;

    IF NEW.status = 'refunded' AND v_invoice_status NOT IN ('paid', 'partially_paid') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Refund requires paid/partially paid invoice. Value: invalid invoice state';
    END IF;

    IF NEW.status IN ('succeeded', 'refunded')
       AND (NEW.transaction_reference IS NULL OR TRIM(NEW.transaction_reference) = '') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Payment reference required for succeeded/refunded status. Value: missing transaction_reference';
    END IF;

    IF NEW.paid_at > NOW(3) + INTERVAL 1 DAY THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][payments] Reason: Payment date too far in the future. Value: paid_at out of bounds';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_after_payment_insert$$
CREATE TRIGGER trg_after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'succeeded' THEN
        UPDATE invoices
        SET
            amount_paid     = amount_paid + NEW.amount,
            status          = CASE
                                  WHEN (amount_paid + NEW.amount) >= (amount_incl_tax - 0.01)
                                  THEN 'paid'
                                  ELSE 'partially_paid'
                              END,
            paid_in_full_at = CASE
                                  WHEN (amount_paid + NEW.amount) >= (amount_incl_tax - 0.01)
                                  THEN NOW(3)
                                  ELSE NULL
                              END
        WHERE id = NEW.invoice_id;

    ELSEIF NEW.status = 'refunded' THEN

        UPDATE invoices
        SET    amount_paid     = GREATEST(0.00, amount_paid - NEW.amount),
               status          = CASE
                                     WHEN GREATEST(0.00, amount_paid - NEW.amount) <= 0.01
                                     THEN 'issued'
                                     ELSE 'partially_paid'
                                 END,
               paid_in_full_at = NULL
        WHERE  id = NEW.invoice_id;

    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_invoice_insert$$
CREATE TRIGGER trg_before_invoice_insert
BEFORE INSERT ON invoices
FOR EACH ROW
BEGIN
    DECLARE v_year        YEAR;
    DECLARE v_sequence_no INT UNSIGNED;

    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN

        SET v_year = YEAR(COALESCE(NEW.issued_on, CURDATE()));

        INSERT INTO invoice_sequences (year, last_number)
        VALUES (v_year, 1)
        ON DUPLICATE KEY UPDATE
            last_number = LAST_INSERT_ID(last_number + 1);

        SET v_sequence_no = LAST_INSERT_ID();

        SET NEW.invoice_number = CONCAT(
            'INV-', v_year, '-',
            LPAD(v_sequence_no, 5, '0')
        );

    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_invoice_update_integrity$$
CREATE TRIGGER trg_before_invoice_update_integrity
BEFORE UPDATE ON invoices
FOR EACH ROW
BEGIN
    IF NEW.status = 'paid'
       AND NEW.amount_paid + 0.01 < NEW.amount_incl_tax THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][invoices] Reason: Paid invoice is not fully settled. Value: amount_paid below amount_incl_tax';
    END IF;

    IF NEW.status = 'cancelled'
       AND NEW.amount_paid > 0.01 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][invoices] Reason: Cannot cancel invoice with non-zero paid amount. Value: amount_paid must be zero';
    END IF;

    IF NEW.status IN ('draft', 'issued')
       AND NEW.paid_in_full_at IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][invoices] Reason: Draft/issued invoice cannot have paid_in_full_at. Value: inconsistent status metadata';
    END IF;

    IF NEW.status = 'overdue'
       AND NEW.due_date >= CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][invoices] Reason: Overdue invoice due_date must be in the past. Value: invalid due_date';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_contract_insert_policy$$
CREATE TRIGGER trg_before_contract_insert_policy
BEFORE INSERT ON contracts
FOR EACH ROW
BEGIN
    DECLARE v_member_status VARCHAR(20) DEFAULT NULL;

    IF NEW.status = 'suspended'
       AND (NEW.freeze_start_date IS NULL OR NEW.freeze_end_date IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][contracts] Reason: Suspended contract requires freeze dates. Value: freeze_start_date/freeze_end_date required';
    END IF;

    IF NEW.status = 'cancelled'
       AND (
            NEW.cancelled_on IS NULL
            OR NEW.cancellation_reason IS NULL
            OR TRIM(NEW.cancellation_reason) = ''
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][contracts] Reason: Cancelled contract requires cancellation fields. Value: cancelled_on/cancellation_reason required';
    END IF;

    IF NEW.status = 'active'
       AND (
            NEW.freeze_start_date IS NOT NULL
            OR NEW.freeze_end_date IS NOT NULL
            OR NEW.cancelled_on IS NOT NULL
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][contracts] Reason: Active contract cannot carry freeze/cancellation markers. Value: status metadata mismatch';
    END IF;

    IF NEW.member_id IS NOT NULL THEN
        SELECT status
        INTO   v_member_status
        FROM   members
        WHERE  id = NEW.member_id;

        IF NEW.status IN ('active', 'suspended')
           AND v_member_status <> 'active' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][contracts] Reason: Active/suspended contract requires active member. Value: member status incompatible';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_contract_update_policy$$
CREATE TRIGGER trg_before_contract_update_policy
BEFORE UPDATE ON contracts
FOR EACH ROW
BEGIN
    DECLARE v_member_status VARCHAR(20) DEFAULT NULL;

    IF NEW.status = 'suspended'
       AND (NEW.freeze_start_date IS NULL OR NEW.freeze_end_date IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][contracts] Reason: Suspended contract requires freeze dates on update. Value: freeze_start_date/freeze_end_date required';
    END IF;

    IF NEW.status = 'cancelled'
       AND (
            NEW.cancelled_on IS NULL
            OR NEW.cancellation_reason IS NULL
            OR TRIM(NEW.cancellation_reason) = ''
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][contracts] Reason: Cancelled contract requires cancellation fields on update. Value: cancelled_on/cancellation_reason required';
    END IF;

    IF NEW.status = 'active'
       AND (
            NEW.freeze_start_date IS NOT NULL
            OR NEW.freeze_end_date IS NOT NULL
            OR NEW.cancelled_on IS NOT NULL
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][contracts] Reason: Active contract cannot carry freeze/cancellation markers on update. Value: status metadata mismatch';
    END IF;

    IF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][contracts] Reason: Cancelled contract cannot be reactivated. Value: immutable terminal status';
    END IF;

    IF NEW.member_id IS NOT NULL THEN
        SELECT status
        INTO   v_member_status
        FROM   members
        WHERE  id = NEW.member_id;

        IF NEW.status IN ('active', 'suspended')
           AND v_member_status <> 'active' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][contracts] Reason: Active/suspended contract requires active member on update. Value: member status incompatible';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_guest_insert_limit$$
CREATE TRIGGER trg_before_guest_insert_limit
BEFORE INSERT ON guests
FOR EACH ROW
BEGIN
    DECLARE v_active_count INT UNSIGNED DEFAULT 0;
    DECLARE v_sponsor_member_lock INT UNSIGNED DEFAULT NULL;

    IF NEW.status = 'active' AND NEW.sponsor_member_id IS NOT NULL THEN

        SELECT id
        INTO   v_sponsor_member_lock
        FROM   members
        WHERE  id = NEW.sponsor_member_id
        FOR UPDATE;

        SELECT COUNT(*) INTO v_active_count
        FROM   guests
        WHERE  sponsor_member_id = NEW.sponsor_member_id
          AND  status            = 'active'
        FOR UPDATE;

        IF v_active_count >= 1 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Duo Pass guest limit reached. Value: max 1 active guest per member';
        END IF;

    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_guest_update_limit$$
CREATE TRIGGER trg_before_guest_update_limit
BEFORE UPDATE ON guests
FOR EACH ROW
BEGIN
    DECLARE v_active_count INT UNSIGNED DEFAULT 0;
    DECLARE v_sponsor_member_lock INT UNSIGNED DEFAULT NULL;

    IF NEW.status = 'active'
       AND OLD.status <> 'active'
       AND NEW.sponsor_member_id IS NOT NULL THEN

        SELECT id
        INTO   v_sponsor_member_lock
        FROM   members
        WHERE  id = NEW.sponsor_member_id
        FOR UPDATE;

        SELECT COUNT(*) INTO v_active_count
        FROM   guests
        WHERE  sponsor_member_id = NEW.sponsor_member_id
          AND  status            = 'active'
        FOR UPDATE;

        IF v_active_count >= 1 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Cannot reactivate guest -- Duo Pass limit already reached. Value: max 1 active guest per member';
        END IF;

    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_guest_insert_sponsor_policy$$
CREATE TRIGGER trg_before_guest_insert_sponsor_policy
BEFORE INSERT ON guests
FOR EACH ROW
BEGIN
    DECLARE v_sponsor_status   VARCHAR(20) DEFAULT NULL;
    DECLARE v_duo_contract_cnt INT UNSIGNED DEFAULT 0;

    IF NEW.status = 'active' THEN
        IF NEW.sponsor_member_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Active guest requires sponsor member. Value: sponsor_member_id required';
        END IF;

        SELECT status
        INTO   v_sponsor_status
        FROM   members
        WHERE  id = NEW.sponsor_member_id;

        IF v_sponsor_status <> 'active' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Sponsor member must be active. Value: invalid sponsor status';
        END IF;

        SELECT COUNT(*)
        INTO   v_duo_contract_cnt
        FROM   contracts c
        JOIN   subscription_plans sp ON sp.id = c.plan_id
        WHERE  c.member_id = NEW.sponsor_member_id
          AND  c.status = 'active'
          AND  (c.end_date IS NULL OR c.end_date >= CURDATE())
          AND  sp.duo_pass_allowed = 1;

        IF v_duo_contract_cnt = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Active guest requires sponsor with active Duo Pass contract. Value: duo_pass policy violation';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_guest_update_sponsor_policy$$
CREATE TRIGGER trg_before_guest_update_sponsor_policy
BEFORE UPDATE ON guests
FOR EACH ROW
BEGIN
    DECLARE v_sponsor_status   VARCHAR(20) DEFAULT NULL;
    DECLARE v_duo_contract_cnt INT UNSIGNED DEFAULT 0;

    IF NEW.status = 'active'
       AND (OLD.status <> 'active' OR NEW.sponsor_member_id <> OLD.sponsor_member_id) THEN
        IF NEW.sponsor_member_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Active guest requires sponsor member on update. Value: sponsor_member_id required';
        END IF;

        SELECT status
        INTO   v_sponsor_status
        FROM   members
        WHERE  id = NEW.sponsor_member_id;

        IF v_sponsor_status <> 'active' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Sponsor member must be active on update. Value: invalid sponsor status';
        END IF;

        SELECT COUNT(*)
        INTO   v_duo_contract_cnt
        FROM   contracts c
        JOIN   subscription_plans sp ON sp.id = c.plan_id
        WHERE  c.member_id = NEW.sponsor_member_id
          AND  c.status = 'active'
          AND  (c.end_date IS NULL OR c.end_date >= CURDATE())
          AND  sp.duo_pass_allowed = 1;

        IF v_duo_contract_cnt = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][guests] Reason: Active guest requires sponsor with active Duo Pass contract on update. Value: duo_pass policy violation';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_member_insert_age$$
CREATE TRIGGER trg_before_member_insert_age
BEFORE INSERT ON members
FOR EACH ROW
BEGIN
    IF TIMESTAMPDIFF(YEAR, NEW.date_of_birth, CURDATE()) < 16 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][members] Reason: Minimum age requirement not met. Value: must be >= 16 years old';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_member_update_age$$
CREATE TRIGGER trg_before_member_update_age
BEFORE UPDATE ON members
FOR EACH ROW
BEGIN
    IF NEW.date_of_birth <> OLD.date_of_birth
       AND TIMESTAMPDIFF(YEAR, NEW.date_of_birth, CURDATE()) < 16 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][members] Reason: Minimum age requirement not met on date_of_birth update. Value: must be >= 16 years old';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_member_delete_gdpr_guard$$
CREATE TRIGGER trg_before_member_delete_gdpr_guard
BEFORE DELETE ON members
FOR EACH ROW
BEGIN
    DECLARE v_audit_rows INT UNSIGNED DEFAULT 0;

    IF OLD.status <> 'anonymized' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][members] Reason: Direct deletion requires prior anonymization. Value: use sp_AnonymizeMember first';
    END IF;

    SELECT COUNT(*)
    INTO   v_audit_rows
    FROM   audit_gdpr
    WHERE  member_id = OLD.id;

    IF v_audit_rows = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][members] Reason: Missing GDPR audit trail before deletion. Value: anonymization audit required';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_guest_insert_age$$
CREATE TRIGGER trg_before_guest_insert_age
BEFORE INSERT ON guests
FOR EACH ROW
BEGIN
    IF TIMESTAMPDIFF(YEAR, NEW.date_of_birth, CURDATE()) < 16 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][guests] Reason: Minimum age requirement not met. Value: must be >= 16 years old (Duo Pass)';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_guest_update_age$$
CREATE TRIGGER trg_before_guest_update_age
BEFORE UPDATE ON guests
FOR EACH ROW
BEGIN
    IF NEW.date_of_birth <> OLD.date_of_birth
       AND TIMESTAMPDIFF(YEAR, NEW.date_of_birth, CURDATE()) < 16 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][guests] Reason: Minimum age requirement not met on date_of_birth update. Value: must be >= 16 years old';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_after_access_granted$$
CREATE TRIGGER trg_after_access_granted
AFTER INSERT ON access_log
FOR EACH ROW
BEGIN
    IF NEW.access_status = 'granted' AND NEW.member_id IS NOT NULL THEN
        UPDATE members
        SET    last_visit_date = DATE(NEW.accessed_at),
               total_visits    = total_visits + 1
        WHERE  id = NEW.member_id;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_class_session_insert_instructor$$
CREATE TRIGGER trg_before_class_session_insert_instructor
BEFORE INSERT ON class_sessions
FOR EACH ROW
BEGIN
    DECLARE v_role         VARCHAR(20) DEFAULT NULL;
    DECLARE v_employee_club_id INT UNSIGNED DEFAULT NULL;

    SELECT role, club_id
    INTO   v_role, v_employee_club_id
    FROM   employees
    WHERE  id = NEW.instructor_id;

    IF v_role IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Instructor not found. Value: invalid instructor_id';
    END IF;

    IF v_role NOT IN ('instructor', 'intern') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Employee role cannot teach classes. Value: instructor/intern required';
    END IF;

    IF v_employee_club_id <> NEW.club_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Instructor assigned outside home club. Value: cross-club assignment blocked';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_class_session_update_instructor$$
CREATE TRIGGER trg_before_class_session_update_instructor
BEFORE UPDATE ON class_sessions
FOR EACH ROW
BEGIN
    DECLARE v_role         VARCHAR(20) DEFAULT NULL;
    DECLARE v_employee_club_id INT UNSIGNED DEFAULT NULL;

    IF NEW.instructor_id <> OLD.instructor_id OR NEW.club_id <> OLD.club_id THEN
        SELECT role, club_id
        INTO   v_role, v_employee_club_id
        FROM   employees
        WHERE  id = NEW.instructor_id;

        IF v_role IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Instructor not found on update. Value: invalid instructor_id';
        END IF;

        IF v_role NOT IN ('instructor', 'intern') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Employee role cannot teach classes on update. Value: instructor/intern required';
        END IF;

        IF v_employee_club_id <> NEW.club_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Instructor assigned outside home club on update. Value: cross-club assignment blocked';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_class_session_insert_timing$$
CREATE TRIGGER trg_before_class_session_insert_timing
BEFORE INSERT ON class_sessions
FOR EACH ROW
BEGIN
    DECLARE v_course_duration SMALLINT UNSIGNED DEFAULT NULL;
    DECLARE v_max_capacity    SMALLINT UNSIGNED DEFAULT NULL;

    IF NEW.starts_at <= NOW(3) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Session must be scheduled in the future. Value: starts_at invalid';
    END IF;

    IF NEW.starts_at > NOW(3) + INTERVAL 180 DAY THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Session schedule horizon exceeded. Value: starts_at too far in future';
    END IF;

    SELECT duration_minutes, max_capacity
    INTO   v_course_duration, v_max_capacity
    FROM   courses
    WHERE  id = NEW.course_id;

    IF v_course_duration IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Course not found. Value: invalid course_id';
    END IF;

    IF NEW.duration_minutes <> v_course_duration THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Session duration must match course duration. Value: duration mismatch';
    END IF;

    IF NEW.enrolled_count > v_max_capacity THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Enrolled count exceeds course capacity. Value: over-capacity session';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_class_session_update_timing$$
CREATE TRIGGER trg_before_class_session_update_timing
BEFORE UPDATE ON class_sessions
FOR EACH ROW
BEGIN
    DECLARE v_course_duration SMALLINT UNSIGNED DEFAULT NULL;
    DECLARE v_max_capacity    SMALLINT UNSIGNED DEFAULT NULL;

    IF NEW.starts_at <= NOW(3) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Session must remain in the future on update. Value: starts_at invalid';
    END IF;

    IF NEW.starts_at > NOW(3) + INTERVAL 180 DAY THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Session schedule horizon exceeded on update. Value: starts_at too far in future';
    END IF;

    SELECT duration_minutes, max_capacity
    INTO   v_course_duration, v_max_capacity
    FROM   courses
    WHERE  id = NEW.course_id;

    IF v_course_duration IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Course not found on update. Value: invalid course_id';
    END IF;

    IF NEW.duration_minutes <> v_course_duration THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Session duration must match course duration on update. Value: duration mismatch';
    END IF;

    IF NEW.enrolled_count > v_max_capacity THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][class_sessions] Reason: Enrolled count exceeds course capacity on update. Value: over-capacity session';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_maintenance_insert_policy$$
CREATE TRIGGER trg_before_maintenance_insert_policy
BEFORE INSERT ON maintenance_tickets
FOR EACH ROW
BEGIN
    DECLARE v_technician_role VARCHAR(20) DEFAULT NULL;

    IF NEW.status = 'resolved' AND NEW.resolved_at IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Resolved ticket requires resolved_at. Value: resolved_at missing';
    END IF;

    IF NEW.status <> 'resolved' AND NEW.resolved_at IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Non-resolved ticket cannot have resolved_at. Value: inconsistent lifecycle state';
    END IF;

    IF NEW.status IN ('assigned', 'in_progress', 'resolved') AND NEW.technician_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Assigned/in-progress/resolved ticket requires technician. Value: technician_id missing';
    END IF;

    IF NEW.technician_id IS NOT NULL THEN
        SELECT role
        INTO   v_technician_role
        FROM   employees
        WHERE  id = NEW.technician_id;

        IF v_technician_role NOT IN ('technician', 'manager', 'management') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Invalid technician role. Value: technician/manager/management required';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_maintenance_update_policy$$
CREATE TRIGGER trg_before_maintenance_update_policy
BEFORE UPDATE ON maintenance_tickets
FOR EACH ROW
BEGIN
    DECLARE v_technician_role VARCHAR(20) DEFAULT NULL;

    IF NEW.status = 'resolved' AND NEW.resolved_at IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Resolved ticket requires resolved_at on update. Value: resolved_at missing';
    END IF;

    IF NEW.status <> 'resolved' AND NEW.resolved_at IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Non-resolved ticket cannot have resolved_at on update. Value: inconsistent lifecycle state';
    END IF;

    IF NEW.status IN ('assigned', 'in_progress', 'resolved') AND NEW.technician_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Assigned/in-progress/resolved ticket requires technician on update. Value: technician_id missing';
    END IF;

    IF NEW.technician_id IS NOT NULL THEN
        SELECT role
        INTO   v_technician_role
        FROM   employees
        WHERE  id = NEW.technician_id;

        IF v_technician_role NOT IN ('technician', 'manager', 'management') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][maintenance] Reason: Invalid technician role on update. Value: technician/manager/management required';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_booking_insert_policy$$
CREATE TRIGGER trg_before_booking_insert_policy
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_session_start DATETIME(3) DEFAULT NULL;
    DECLARE v_session_club_id INT UNSIGNED DEFAULT NULL;
    DECLARE v_club_status VARCHAR(30) DEFAULT NULL;
    DECLARE v_member_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_contract_id INT UNSIGNED DEFAULT NULL;
    DECLARE v_home_club_id INT UNSIGNED DEFAULT NULL;
    DECLARE v_limited_access TINYINT(1) DEFAULT 0;

    IF NEW.status IN ('confirmed', 'waitlisted') THEN
        SELECT cs.starts_at, cs.club_id, cl.operational_status
        INTO   v_session_start, v_session_club_id, v_club_status
        FROM   class_sessions cs
        JOIN   clubs cl ON cl.id = cs.club_id
        WHERE  cs.id = NEW.session_id;

        IF v_session_start IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Session not found. Value: invalid session_id';
        END IF;

        IF v_session_start <= NOW(3) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Cannot book past session. Value: starts_at must be in the future';
        END IF;

        IF v_club_status <> 'open' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Club is not open. Value: booking blocked';
        END IF;

        SELECT status
        INTO   v_member_status
        FROM   members
        WHERE  id = NEW.member_id;

        IF v_member_status IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Member not found. Value: invalid member_id';
        END IF;

        IF v_member_status <> 'active' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Member account is not active. Value: booking blocked';
        END IF;

        SELECT ct.id, ct.home_club_id, sp.limited_club_access
        INTO   v_contract_id, v_home_club_id, v_limited_access
        FROM   contracts ct
        JOIN   subscription_plans sp ON sp.id = ct.plan_id
        WHERE  ct.member_id = NEW.member_id
          AND  ct.status = 'active'
          AND  (ct.end_date IS NULL OR ct.end_date >= DATE(v_session_start))
        ORDER BY ct.start_date DESC
        LIMIT 1;

        IF v_contract_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: No eligible active contract. Value: booking blocked';
        END IF;

        IF v_limited_access = 1 AND v_home_club_id <> v_session_club_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Contract limited to home club. Value: booking blocked';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_booking_insert_cap$$
CREATE TRIGGER trg_before_booking_insert_cap
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_enrolled     SMALLINT UNSIGNED;
    DECLARE v_max_capacity SMALLINT UNSIGNED;

    IF NEW.status = 'confirmed' THEN

        SELECT cs.enrolled_count, c.max_capacity
        INTO   v_enrolled, v_max_capacity
        FROM   class_sessions cs
        JOIN   courses         c ON c.id = cs.course_id
        WHERE  cs.id = NEW.session_id
        FOR UPDATE;

        IF v_enrolled >= v_max_capacity THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Session is at full capacity. Value: no available slots';
        END IF;

    END IF;
END$$


DROP TRIGGER IF EXISTS trg_after_booking_insert$$
CREATE TRIGGER trg_after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' THEN
        UPDATE class_sessions
        SET    enrolled_count = enrolled_count + 1
        WHERE  id = NEW.session_id;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_booking_update_policy$$
CREATE TRIGGER trg_before_booking_update_policy
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_session_start DATETIME(3) DEFAULT NULL;
    DECLARE v_session_club_id INT UNSIGNED DEFAULT NULL;
    DECLARE v_club_status VARCHAR(30) DEFAULT NULL;
    DECLARE v_member_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_contract_id INT UNSIGNED DEFAULT NULL;
    DECLARE v_home_club_id INT UNSIGNED DEFAULT NULL;
    DECLARE v_limited_access TINYINT(1) DEFAULT 0;

    IF NEW.status IN ('confirmed', 'waitlisted')
       AND (
            OLD.status NOT IN ('confirmed', 'waitlisted')
            OR NEW.member_id <> OLD.member_id
            OR NEW.session_id <> OLD.session_id
       ) THEN
        SELECT cs.starts_at, cs.club_id, cl.operational_status
        INTO   v_session_start, v_session_club_id, v_club_status
        FROM   class_sessions cs
        JOIN   clubs cl ON cl.id = cs.club_id
        WHERE  cs.id = NEW.session_id;

        IF v_session_start IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Session not found on update. Value: invalid session_id';
        END IF;

        IF v_session_start <= NOW(3) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Cannot move booking to past session. Value: starts_at must be in the future';
        END IF;

        IF v_club_status <> 'open' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Club is not open on update. Value: booking blocked';
        END IF;

        SELECT status
        INTO   v_member_status
        FROM   members
        WHERE  id = NEW.member_id;

        IF v_member_status IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Member not found on update. Value: invalid member_id';
        END IF;

        IF v_member_status <> 'active' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Member account is not active on update. Value: booking blocked';
        END IF;

        SELECT ct.id, ct.home_club_id, sp.limited_club_access
        INTO   v_contract_id, v_home_club_id, v_limited_access
        FROM   contracts ct
        JOIN   subscription_plans sp ON sp.id = ct.plan_id
        WHERE  ct.member_id = NEW.member_id
          AND  ct.status = 'active'
          AND  (ct.end_date IS NULL OR ct.end_date >= DATE(v_session_start))
        ORDER BY ct.start_date DESC
        LIMIT 1;

        IF v_contract_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: No eligible active contract on update. Value: booking blocked';
        END IF;

        IF v_limited_access = 1 AND v_home_club_id <> v_session_club_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Contract limited to home club on update. Value: booking blocked';
        END IF;
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_before_booking_update_cap$$
CREATE TRIGGER trg_before_booking_update_cap
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_enrolled     SMALLINT UNSIGNED;
    DECLARE v_max_capacity SMALLINT UNSIGNED;

    IF NEW.status = 'confirmed'
       AND (
            OLD.status <> 'confirmed'
            OR NEW.session_id <> OLD.session_id
       ) THEN

        SELECT cs.enrolled_count, c.max_capacity
        INTO   v_enrolled, v_max_capacity
        FROM   class_sessions cs
        JOIN   courses         c ON c.id = cs.course_id
        WHERE  cs.id = NEW.session_id
        FOR UPDATE;

        IF v_enrolled >= v_max_capacity THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = '[TRG][bookings] Reason: Cannot re-confirm -- session is at full capacity. Value: no available slots';
        END IF;

    END IF;
END$$


DROP TRIGGER IF EXISTS trg_after_booking_update$$
CREATE TRIGGER trg_after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.status = 'confirmed'
       AND NEW.status = 'confirmed'
       AND NEW.session_id <> OLD.session_id THEN

        UPDATE class_sessions
        SET    enrolled_count = GREATEST(0, enrolled_count - 1)
        WHERE  id = OLD.session_id;

        UPDATE class_sessions
        SET    enrolled_count = enrolled_count + 1
        WHERE  id = NEW.session_id;

    ELSEIF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN

        UPDATE class_sessions
        SET    enrolled_count = enrolled_count + 1
        WHERE  id = NEW.session_id;

    ELSEIF OLD.status = 'confirmed' AND NEW.status <> 'confirmed' THEN

        UPDATE class_sessions
        SET    enrolled_count = GREATEST(0, enrolled_count - 1)
        WHERE  id = OLD.session_id;

    END IF;
END$$


DROP TRIGGER IF EXISTS trg_after_booking_delete$$
CREATE TRIGGER trg_after_booking_delete
AFTER DELETE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.status = 'confirmed' THEN
        UPDATE class_sessions
        SET    enrolled_count = GREATEST(0, enrolled_count - 1)
        WHERE  id = OLD.session_id;
    END IF;
END$$


DELIMITER ;


SELECT
    TRIGGER_NAME               AS `Trigger`,
    EVENT_MANIPULATION         AS `Event`,
    EVENT_OBJECT_TABLE         AS `Table`,
    ACTION_TIMING              AS `Timing`
FROM   information_schema.TRIGGERS
WHERE  TRIGGER_SCHEMA = DATABASE()
ORDER  BY EVENT_OBJECT_TABLE, ACTION_TIMING, EVENT_MANIPULATION;
