USE riada_db;

CREATE TABLE IF NOT EXISTS clubs (
    id                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(150)    NOT NULL,
    address_street       VARCHAR(255)    NOT NULL,
    address_city         VARCHAR(100)    NOT NULL,
    address_postal_code  VARCHAR(10)     NOT NULL,
    country              VARCHAR(50)     NOT NULL DEFAULT 'Belgium',
    is_open_24_7         TINYINT(1)      NOT NULL DEFAULT 1,
    opened_on            DATE            NOT NULL,
    operational_status   ENUM('open','temporarily_closed','permanently_closed')
                                         NOT NULL DEFAULT 'open',
    created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                   ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS members (
    id                           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    last_name                    VARCHAR(100)    NOT NULL,
    first_name                   VARCHAR(100)    NOT NULL,
    email                        VARCHAR(100)    NOT NULL,
    gender                       ENUM('male','female','unspecified')
                                                 NOT NULL DEFAULT 'unspecified',
    date_of_birth                DATE            NOT NULL,
    nationality                  VARCHAR(50)     NOT NULL DEFAULT 'Belgian',
    mobile_phone                 VARCHAR(20)     NULL,
    address_street               VARCHAR(255)    NULL,
    address_city                 VARCHAR(100)    NULL,
    address_postal_code          VARCHAR(10)     NULL,
    status                       ENUM('active','suspended','anonymized')
                                                 NOT NULL DEFAULT 'active',
    referral_member_id           INT UNSIGNED    NULL,
    primary_goal                 ENUM('weight_loss','muscle_gain','fitness','maintenance','other')
                                                 NULL,
    acquisition_source           ENUM('web_advertising','social_media','word_of_mouth','other')
                                                 NULL,
    medical_certificate_provided TINYINT(1)      NOT NULL DEFAULT 0,
    gdpr_consent_at              DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    marketing_consent            TINYINT(1)      NOT NULL DEFAULT 0,
    last_visit_date              DATE            NULL,
    total_visits                 INT UNSIGNED    NOT NULL DEFAULT 0,
    created_at                   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at                   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                          ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_members_email (email),
    CONSTRAINT fk_members_referral
        FOREIGN KEY (referral_member_id) REFERENCES members (id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    INDEX idx_members_referral (referral_member_id),
    INDEX idx_members_status   (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS subscription_plans (
    id                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    plan_name            VARCHAR(100)    NOT NULL,
    base_price           DECIMAL(10,2)   NOT NULL,
    commitment_months    INT UNSIGNED    NOT NULL DEFAULT 12,
    enrollment_fee       DECIMAL(10,2)   NOT NULL DEFAULT 19.99,
    limited_club_access  TINYINT(1)      NOT NULL DEFAULT 0,
    duo_pass_allowed     TINYINT(1)      NOT NULL DEFAULT 0,
    created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                   ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_subscription_plans_name (plan_name),
    CONSTRAINT chk_subscription_plans_base_price    CHECK (base_price > 0),
    CONSTRAINT chk_subscription_plans_enrollment_fee CHECK (enrollment_fee >= 0),
    CONSTRAINT chk_subscription_plans_commitment    CHECK (commitment_months > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS service_options (
    id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    option_name    VARCHAR(100)    NOT NULL,
    monthly_price  DECIMAL(10,2)   NOT NULL,
    created_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                             ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_service_options_name (option_name),
    CONSTRAINT chk_service_options_monthly_price CHECK (monthly_price > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS subscription_plan_options (
    plan_id    INT UNSIGNED    NOT NULL,
    option_id  INT UNSIGNED    NOT NULL,
    PRIMARY KEY (plan_id, option_id),
    CONSTRAINT fk_spo_plan
        FOREIGN KEY (plan_id)   REFERENCES subscription_plans (id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_spo_option
        FOREIGN KEY (option_id) REFERENCES service_options (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_spo_option (option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS courses (
    id                   INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    course_name          VARCHAR(100)      NOT NULL,
    description          TEXT              NULL,
    difficulty_level     ENUM('beginner','intermediate','advanced','all_levels')
                                           NOT NULL DEFAULT 'all_levels',
    duration_minutes     SMALLINT UNSIGNED NOT NULL,
    max_capacity         SMALLINT UNSIGNED NOT NULL DEFAULT 20,
    estimated_calories   INT UNSIGNED      NULL,
    activity_type        ENUM('cardio','strength','flexibility','relaxation','dance','combat','mixed')
                                           NULL,
    created_at           DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at           DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                     ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_courses_name (course_name),
    CONSTRAINT chk_courses_duration  CHECK (duration_minutes > 0),
    CONSTRAINT chk_courses_capacity  CHECK (max_capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS employees (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    last_name       VARCHAR(100)    NOT NULL,
    first_name      VARCHAR(100)    NOT NULL,
    email           VARCHAR(100)    NOT NULL,
    club_id         INT UNSIGNED    NOT NULL,
    role            ENUM('instructor','manager','receptionist','technician','intern','management')
                                    NOT NULL,
    monthly_salary  DECIMAL(10,2)   NULL,
    qualifications  TEXT            NULL,
    hired_on        DATE            NOT NULL,
    created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                             ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_employees_email (email),
    CONSTRAINT fk_employees_club
        FOREIGN KEY (club_id) REFERENCES clubs (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_employees_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS contracts (
    id                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    member_id            INT UNSIGNED    NULL,
    plan_id              INT UNSIGNED    NOT NULL,
    home_club_id         INT UNSIGNED    NOT NULL,
    start_date           DATE            NOT NULL,
    end_date             DATE            NULL,
    contract_type        ENUM('fixed_term','open_ended')
                                         NOT NULL DEFAULT 'fixed_term',
    status               ENUM('active','suspended','expired','cancelled')
                                         NOT NULL DEFAULT 'active',
    cancelled_on         DATE            NULL,
    cancellation_reason  VARCHAR(255)    NULL,
    freeze_start_date    DATE            NULL,
    freeze_end_date      DATE            NULL,
    created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                   ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT fk_contracts_member
        FOREIGN KEY (member_id)    REFERENCES members (id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT fk_contracts_plan
        FOREIGN KEY (plan_id)      REFERENCES subscription_plans (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_contracts_club
        FOREIGN KEY (home_club_id) REFERENCES clubs (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_contracts_dates
        CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT chk_contracts_cancelled_on
        CHECK (cancelled_on IS NULL OR cancelled_on >= start_date),
    CONSTRAINT chk_contracts_freeze_dates
        CHECK (freeze_end_date IS NULL OR freeze_end_date >= freeze_start_date),
    INDEX idx_contracts_member_status_end (member_id, status, end_date),
    INDEX idx_contracts_plan      (plan_id),
    INDEX idx_contracts_home_club (home_club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS contract_options (
    id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    contract_id  INT UNSIGNED    NOT NULL,
    option_id    INT UNSIGNED    NOT NULL,
    added_on     DATE            NOT NULL,
    removed_on   DATE            NULL,
    created_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                           ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT fk_contract_options_contract
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_contract_options_option
        FOREIGN KEY (option_id)   REFERENCES service_options (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_contract_options_dates
        CHECK (removed_on IS NULL OR removed_on >= added_on),
    INDEX idx_contract_options_contract (contract_id),
    INDEX idx_contract_options_option   (option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS invoice_sequences (
    year         YEAR         NOT NULL,
    last_number  INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS invoices (
    id                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    contract_id          INT UNSIGNED    NULL,
    invoice_number       VARCHAR(50)     NOT NULL,
    issued_on            DATE            NOT NULL DEFAULT (CURRENT_DATE),
    due_date             DATE            NOT NULL,
    billing_period_start DATE            NOT NULL,
    billing_period_end   DATE            NOT NULL,
    amount_excl_tax      DECIMAL(10,2)   NOT NULL,
    vat_rate             DECIMAL(5,4)    NOT NULL DEFAULT 0.2100,
    vat_amount           DECIMAL(10,2)   GENERATED ALWAYS AS
                             (ROUND(amount_excl_tax * vat_rate, 2)) STORED,
    amount_incl_tax      DECIMAL(10,2)   GENERATED ALWAYS AS
                             (ROUND(amount_excl_tax * (1 + vat_rate), 2)) STORED,
    status               ENUM('draft','issued','paid','partially_paid','overdue','cancelled')
                                         NOT NULL DEFAULT 'issued',
    amount_paid          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    balance_due          DECIMAL(10,2)   GENERATED ALWAYS AS
                             (ROUND(amount_incl_tax - amount_paid, 2)) STORED,
    paid_in_full_at      DATETIME(3)     NULL,
    created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                   ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_invoices_number (invoice_number),
    CONSTRAINT fk_invoices_contract
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT chk_invoices_amount_excl_tax CHECK (amount_excl_tax > 0),
    CONSTRAINT chk_invoices_amount_paid     CHECK (amount_paid >= 0),
    CONSTRAINT chk_invoices_vat_rate        CHECK (vat_rate >= 0 AND vat_rate < 1),
    CONSTRAINT chk_invoices_due_date        CHECK (due_date >= issued_on),
    CONSTRAINT chk_invoices_period          CHECK (billing_period_end >= billing_period_start),
    INDEX idx_invoices_contract_status_due (contract_id, status, due_date),
    INDEX idx_invoices_contract_period     (contract_id, billing_period_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS invoice_lines (
    id                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    invoice_id            INT UNSIGNED    NOT NULL,
    description           VARCHAR(255)    NOT NULL,
    line_type             ENUM('subscription','option','enrollment_fee','penalty','credit_note','other')
                                          NOT NULL,
    plan_id               INT UNSIGNED    NULL,
    option_id             INT UNSIGNED    NULL,
    quantity              INT UNSIGNED    NOT NULL DEFAULT 1,
    unit_price_excl_tax   DECIMAL(10,2)   NOT NULL,
    vat_rate              DECIMAL(5,4)    NOT NULL DEFAULT 0.2100,
    line_amount_excl_tax  DECIMAL(10,2)   GENERATED ALWAYS AS
                              (ROUND(quantity * unit_price_excl_tax, 2)) STORED,
    line_amount_incl_tax  DECIMAL(10,2)   GENERATED ALWAYS AS
                              (ROUND(quantity * unit_price_excl_tax * (1 + vat_rate), 2)) STORED,
    PRIMARY KEY (id),
    CONSTRAINT fk_invoice_lines_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices (id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_lines_plan
        FOREIGN KEY (plan_id)    REFERENCES subscription_plans (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_lines_option
        FOREIGN KEY (option_id)  REFERENCES service_options (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_invoice_lines_unit_price CHECK (unit_price_excl_tax >= 0),
    CONSTRAINT chk_invoice_lines_quantity   CHECK (quantity > 0),
    INDEX idx_invoice_lines_invoice (invoice_id),
    INDEX idx_invoice_lines_plan    (plan_id),
    INDEX idx_invoice_lines_option  (option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS payments (
    id                    INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    invoice_id            INT UNSIGNED     NOT NULL,
    paid_at               DATETIME(3)      NOT NULL,
    amount                DECIMAL(10,2)    NOT NULL,
    status                ENUM('pending','succeeded','failed','refunded')
                                           NOT NULL,
    payment_method        ENUM('sepa_direct_debit','credit_card','cash','bank_transfer')
                                           NOT NULL DEFAULT 'sepa_direct_debit',
    transaction_reference VARCHAR(100)     NULL,
    error_code            VARCHAR(50)      NULL,
    attempt_count         TINYINT UNSIGNED NOT NULL DEFAULT 1,
    created_at            DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at            DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                     ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT fk_payments_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_payments_amount        CHECK (amount > 0),
    CONSTRAINT chk_payments_attempt_count CHECK (attempt_count >= 1),
    INDEX idx_payments_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS access_log (
    id             BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    member_id      INT UNSIGNED     NULL,
    club_id        INT UNSIGNED     NOT NULL,
    accessed_at    DATETIME(3)      NOT NULL,
    access_status  ENUM('granted','denied') NOT NULL,
    denial_reason  VARCHAR(255)     NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_access_log_member
        FOREIGN KEY (member_id) REFERENCES members (id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT fk_access_log_club
        FOREIGN KEY (club_id)   REFERENCES clubs (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_access_log_member_club_status_at (member_id, club_id, access_status, accessed_at),
    INDEX idx_access_log_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS class_sessions (
    id               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    course_id        INT UNSIGNED      NOT NULL,
    instructor_id    INT UNSIGNED      NOT NULL,
    club_id          INT UNSIGNED      NOT NULL,
    starts_at        DATETIME(3)       NOT NULL,
    duration_minutes SMALLINT UNSIGNED NOT NULL,
    enrolled_count   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at       DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT fk_class_sessions_course
        FOREIGN KEY (course_id)     REFERENCES courses (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_class_sessions_instructor
        FOREIGN KEY (instructor_id) REFERENCES employees (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_class_sessions_club
        FOREIGN KEY (club_id)       REFERENCES clubs (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_class_sessions_duration CHECK (duration_minutes > 0),
    INDEX idx_class_sessions_course     (course_id),
    INDEX idx_class_sessions_instructor (instructor_id),
    INDEX idx_class_sessions_club       (club_id),
    INDEX idx_class_sessions_starts_at  (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS bookings (
    member_id   INT UNSIGNED    NOT NULL,
    session_id  INT UNSIGNED    NOT NULL,
    booked_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    status      ENUM('confirmed','waitlisted','cancelled')
                                NOT NULL DEFAULT 'confirmed',
    PRIMARY KEY (member_id, session_id),
    CONSTRAINT fk_bookings_member
        FOREIGN KEY (member_id)  REFERENCES members (id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_bookings_session
        FOREIGN KEY (session_id) REFERENCES class_sessions (id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    INDEX idx_bookings_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS equipment (
    id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name             VARCHAR(100)    NOT NULL,
    equipment_type   VARCHAR(50)     NOT NULL,
    club_id          INT UNSIGNED    NOT NULL,
    brand            VARCHAR(100)    NULL,
    model            VARCHAR(100)    NULL,
    acquisition_year YEAR            NOT NULL,
    status           ENUM('in_service','under_maintenance','broken','retired')
                                     NOT NULL DEFAULT 'in_service',
    purchase_cost    DECIMAL(10,2)   NULL,
    usage_hours      INT UNSIGNED    NOT NULL DEFAULT 0,
    created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                              ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT fk_equipment_club
        FOREIGN KEY (club_id) REFERENCES clubs (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_equipment_purchase_cost
        CHECK (purchase_cost IS NULL OR purchase_cost >= 0),
    INDEX idx_equipment_club   (club_id),
    INDEX idx_equipment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    equipment_id         INT UNSIGNED    NOT NULL,
    technician_id        INT UNSIGNED    NULL,
    maintenance_type     ENUM('breakdown','preventive','installation') NOT NULL,
    status               ENUM('reported','assigned','in_progress','resolved')
                                         NOT NULL DEFAULT 'reported',
    priority             ENUM('low','medium','high','critical')
                                         NOT NULL DEFAULT 'medium',
    reported_at          DATETIME(3)     NOT NULL,
    resolved_at          DATETIME(3)     NULL,
    problem_description  TEXT            NULL,
    repair_cost          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                   ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT fk_maintenance_equipment
        FOREIGN KEY (equipment_id)  REFERENCES equipment (id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_maintenance_technician
        FOREIGN KEY (technician_id) REFERENCES employees (id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT chk_maintenance_resolved_at
        CHECK (resolved_at IS NULL OR resolved_at >= reported_at),
    CONSTRAINT chk_maintenance_repair_cost CHECK (repair_cost >= 0),
    INDEX idx_maintenance_equipment  (equipment_id),
    INDEX idx_maintenance_technician (technician_id),
    INDEX idx_maintenance_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS guests (
    id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    sponsor_member_id INT UNSIGNED    NULL,
    last_name         VARCHAR(100)    NOT NULL,
    first_name        VARCHAR(100)    NOT NULL,
    date_of_birth     DATE            NOT NULL,
    email             VARCHAR(100)    NULL,
    status            ENUM('active','banned') NOT NULL DEFAULT 'active',
    created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                               ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT fk_guests_sponsor
        FOREIGN KEY (sponsor_member_id) REFERENCES members (id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    INDEX idx_guests_sponsor_status (sponsor_member_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS guest_access_log (
    id                   BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    guest_id             INT UNSIGNED     NOT NULL,
    companion_member_id  INT UNSIGNED     NULL,
    club_id              INT UNSIGNED     NOT NULL,
    accessed_at          DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    access_status        ENUM('granted','denied') NOT NULL,
    denial_reason        VARCHAR(255)     NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_guest_access_log_guest
        FOREIGN KEY (guest_id)            REFERENCES guests (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_guest_access_log_member
        FOREIGN KEY (companion_member_id) REFERENCES members (id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT fk_guest_access_log_club
        FOREIGN KEY (club_id)             REFERENCES clubs (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_guest_access_log_guest    (guest_id),
    INDEX idx_guest_access_log_member   (companion_member_id),
    INDEX idx_guest_access_log_club     (club_id),
    INDEX idx_guest_access_log_accessed (accessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS audit_gdpr (
    id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    member_id       INT UNSIGNED     NOT NULL,
    anonymized_at   DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    requested_by    VARCHAR(100)     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_gdpr_member
        FOREIGN KEY (member_id) REFERENCES members (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_audit_gdpr_member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


SELECT
    TABLE_NAME        AS `Table`,
    ENGINE            AS `Engine`,
    TABLE_COLLATION   AS `Collation`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
