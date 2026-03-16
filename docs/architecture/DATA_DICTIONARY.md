# 📋 RIADA Complete Data Dictionary v5.1

**Last Updated:** March 15, 2026 | **Production Ready** | **12 Tables, 5+ Procedures, 15+ Triggers**

---

## 📊 Quick Table Reference

| Table | Records | Purpose | Key Columns |
|-------|---------|---------|------------|
| Members | 50K | Member profiles | Id, Email (UQ), Status |
| Contracts | 100K | Membership tiers | ContractId, MemberId, Status |
| Billing_Invoices | 600K | Monthly invoices | InvoiceId, MemberId, Status |
| Courses | 100 | Class catalog | CourseId, CourseName (UQ) |
| Sessions | 5K/mo | Class instances | SessionId, CourseId, SessionDate |
| Bookings | 50K/mo | Enrollments | BookingId, MemberId, SessionId |
| Guests | 10K/mo | Guest passes | GuestId, MemberId, VisitDate |
| Equipment | 2K | Inventory | EquipmentId, Status, Location |
| Maintenance_Tickets | 1K/mo | Work orders | TicketId, EquipmentId, Status |
| Access_Control | 500K/mo | Entry/exit logs | AccessLogId, MemberId, AccessTime (PARTITIONED) |
| Analytics_Reports | 1K | Dashboard data | ReportId, ReportType, ReportDate |
| System_Parameters | 50 | Configuration | ParameterId, ParameterKey (UQ) |

---

## 🗄️ Detailed Schemas

### 1. Members Table
**Size:** 50K rows | **Growth:** 1-2K/month | **Indexed:** email, status, registration_date

```sql
CREATE TABLE Members (
  MemberId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Gender ENUM('Male','Female','Unspecified') NOT NULL DEFAULT 'Unspecified',
  DateOfBirth DATE NOT NULL CHECK (YEAR(NOW()) - YEAR(DateOfBirth) >= 16),
  MobilePhone VARCHAR(20) NULL,
  AddressStreet VARCHAR(255) NULL,
  AddressCity VARCHAR(100) NULL,
  AddressPostalCode VARCHAR(20) NULL,
  RegistrationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('Active','Inactive','Suspended','Cancelled') NOT NULL DEFAULT 'Active',
  MedicalCertificateProvided BOOLEAN NOT NULL DEFAULT FALSE,
  MarketingConsent BOOLEAN NOT NULL DEFAULT FALSE,
  PrimaryGoal VARCHAR(100) NULL,
  AcquisitionSource VARCHAR(100) NULL,
  ReferralMemberId INT NULL REFERENCES Members(MemberId),
  
  KEY idx_email (Email),
  KEY idx_status (Status),
  KEY idx_registration_date (RegistrationDate)
);
```

**Triggers:**
- `tr_member_status_audit` - Log all status changes
- `tr_member_email_notify` - Send confirmation emails

---

### 2. Contracts Table
**Size:** 100K rows | **Growth:** 500-1K/month | **Constraint:** One active per member

```sql
CREATE TABLE Contracts (
  ContractId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  MemberId INT NOT NULL REFERENCES Members(MemberId),
  ContractType ENUM('Trial','Limited','Unlimited','DailyPass') NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  MonthlyRate DECIMAL(10,2) NOT NULL CHECK (MonthlyRate >= 0),
  Status ENUM('Active','Frozen','Expired','Cancelled') NOT NULL DEFAULT 'Active',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  Notes TEXT NULL,
  
  CONSTRAINT chk_contract_dates CHECK (EndDate > StartDate),
  CONSTRAINT uq_active_contract UNIQUE (MemberId, Status = 'Active'),
  
  KEY idx_member_id (MemberId),
  KEY idx_status (Status),
  KEY idx_end_date (EndDate)
);
```

---

### 3. Billing_Invoices Table
**Size:** 600K rows | **Growth:** 50K+/month | **Partitioned:** By month(InvoiceDate)

```sql
CREATE TABLE Billing_Invoices (
  InvoiceId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  MemberId INT NOT NULL REFERENCES Members(MemberId),
  ContractId INT NOT NULL REFERENCES Contracts(ContractId),
  InvoiceDate DATE NOT NULL DEFAULT CURDATE(),
  DueDate DATE NOT NULL,
  Amount DECIMAL(10,2) NOT NULL CHECK (Amount > 0),
  Status ENUM('Draft','Issued','Paid','Overdue','Cancelled') NOT NULL DEFAULT 'Issued',
  PaidDate DATE NULL,
  PaymentMethod ENUM('Card','Bank','Cash','Check') NULL,
  Notes TEXT NULL,
  
  KEY idx_member_id (MemberId),
  KEY idx_status (Status),
  KEY idx_due_date (DueDate),
  KEY idx_paid_date (PaidDate)
) PARTITION BY RANGE (MONTH(InvoiceDate)) (
  PARTITION p_01 VALUES LESS THAN (2),
  PARTITION p_02 VALUES LESS THAN (3),
  ...
  PARTITION p_12 VALUES LESS THAN (13)
);
```

**Triggers:**
- `tr_invoice_mark_paid` - Auto-mark as Paid when payment recorded
- `tr_invoice_flag_overdue` - Daily: Mark >30 days overdue

---

### 4. Courses Table
**Size:** ~100 rows | **Growth:** 1-2/month

```sql
CREATE TABLE Courses (
  CourseId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  CourseName VARCHAR(200) NOT NULL UNIQUE,
  Description TEXT NULL,
  InstructorId INT NOT NULL REFERENCES Members(MemberId),
  MaxParticipants INT NOT NULL DEFAULT 20,
  DifficultyLevel ENUM('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  Schedule VARCHAR(255) NULL,
  Status ENUM('Active','OnHold','Archived') NOT NULL DEFAULT 'Active',
  
  KEY idx_name (CourseName),
  KEY idx_status (Status)
);
```

---

### 5. Sessions Table
**Size:** 5K+/month | **Partitioned:** By month(SessionDate)

```sql
CREATE TABLE Sessions (
  SessionId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  CourseId INT NOT NULL REFERENCES Courses(CourseId),
  SessionDate DATETIME NOT NULL,
  EndTime DATETIME NOT NULL,
  Location VARCHAR(100) NOT NULL,
  CurrentParticipants INT NOT NULL DEFAULT 0,
  Status ENUM('Scheduled','InProgress','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  
  KEY idx_course_id (CourseId),
  KEY idx_session_date (SessionDate)
) PARTITION BY RANGE (MONTH(SessionDate)) (...);
```

---

### 6. Bookings Table
**Size:** 50K+/month | **Constraint:** UQ(MemberId, SessionId)

```sql
CREATE TABLE Bookings (
  BookingId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  MemberId INT NOT NULL REFERENCES Members(MemberId),
  SessionId INT NOT NULL REFERENCES Sessions(SessionId),
  BookingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('Confirmed','Cancelled','Attended','NoShow') NOT NULL DEFAULT 'Confirmed',
  
  CONSTRAINT uq_member_session UNIQUE (MemberId, SessionId),
  
  KEY idx_member_id (MemberId),
  KEY idx_session_id (SessionId)
);
```

**Triggers:**
- `tr_booking_increment_count` - Insert: +1 CurrentParticipants
- `tr_booking_decrement_count` - Delete: -1 CurrentParticipants
- `tr_booking_validate_capacity` - BEFORE: Enforce MaxParticipants

---

### 7. Guests Table
**Size:** 10K+/month | **Constraint:** Max 5 guests/member/month

```sql
CREATE TABLE Guests (
  GuestId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  MemberId INT NOT NULL REFERENCES Members(MemberId),
  GuestName VARCHAR(150) NOT NULL,
  GuestEmail VARCHAR(255) NULL,
  VisitDate DATETIME NOT NULL,
  Status ENUM('Active','Banned','Expired') NOT NULL DEFAULT 'Active',
  Reason VARCHAR(255) NULL,
  
  KEY idx_member_id (MemberId),
  KEY idx_visit_date (VisitDate)
);
```

---

### 8. Equipment Table
**Size:** ~2K rows

```sql
CREATE TABLE Equipment (
  EquipmentId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  EquipmentName VARCHAR(200) NOT NULL,
  Category VARCHAR(100) NOT NULL,
  PurchaseDate DATE NOT NULL,
  Location VARCHAR(100) NOT NULL,
  Status ENUM('Operational','InMaintenance','Retired','Damaged') NOT NULL DEFAULT 'Operational',
  LastMaintenanceDate DATE NULL,
  
  KEY idx_status (Status),
  KEY idx_location (Location)
);
```

---

### 9. Maintenance_Tickets Table
**Size:** 1K+/month

```sql
CREATE TABLE Maintenance_Tickets (
  TicketId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  EquipmentId INT NOT NULL REFERENCES Equipment(EquipmentId),
  ReportedBy INT NOT NULL REFERENCES Members(MemberId),
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Description TEXT NOT NULL,
  Status ENUM('Open','InProgress','Completed','Closed','WontFix') NOT NULL DEFAULT 'Open',
  Priority ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
  CompletedAt DATETIME NULL,
  Notes TEXT NULL,
  
  KEY idx_equipment_id (EquipmentId),
  KEY idx_status (Status),
  KEY idx_priority (Priority)
);
```

---

### 10. Access_Control Table
**Size:** 500K+/month | **PARTITIONED:** By month(AccessTime) | **CRITICAL for performance**

```sql
CREATE TABLE Access_Control (
  AccessLogId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  MemberId INT NOT NULL REFERENCES Members(MemberId),
  AccessTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  AccessType ENUM('Entry','Exit') NOT NULL,
  AccessMethod VARCHAR(50) NOT NULL,
  Status ENUM('Allowed','Denied') NOT NULL DEFAULT 'Allowed',
  DenyReason VARCHAR(255) NULL,
  
  KEY idx_member_time (MemberId, AccessTime),
  KEY idx_allowed (Status, AccessTime)
) PARTITION BY RANGE (MONTH(AccessTime)) (...);
```

**Triggers:**
- `tr_access_validate_contract` - Check active contract
- `tr_access_check_suspension` - Deny if suspended
- `tr_access_log_anomaly` - Flag multiple entries within 5min

---

### 11. Analytics_Reports Table
**Size:** 1K rows | **Retention:** 12 months

```sql
CREATE TABLE Analytics_Reports (
  ReportId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ReportType VARCHAR(100) NOT NULL,
  ReportDate DATE NOT NULL DEFAULT CURDATE(),
  ReportData JSON NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_date (ReportDate),
  KEY idx_type (ReportType)
);
```

**Example ReportData:**
```json
{
  "daily_visits": 145,
  "revenue": 4500.50,
  "new_members": 3,
  "top_courses": ["Yoga", "CrossFit", "Pilates"],
  "occupancy_rate": 0.78,
  "at_risk_members": 12
}
```

---

### 12. System_Parameters Table
**Size:** ~50 rows | **Config lookup**

```sql
CREATE TABLE System_Parameters (
  ParameterId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ParameterKey VARCHAR(100) NOT NULL UNIQUE,
  ParameterValue TEXT NULL,
  DataType VARCHAR(50) NOT NULL DEFAULT 'string',
  IsActive BOOLEAN NOT NULL DEFAULT TRUE,
  
  UNIQUE KEY uq_key (ParameterKey)
);
```

**Example Configs:**
```sql
INSERT INTO System_Parameters VALUES
  (1, 'max_guest_per_month', '5', 'int', TRUE),
  (2, 'invoice_due_days', '30', 'int', TRUE),
  (3, 'trial_duration_days', '7', 'int', TRUE),
  (4, 'rate_limit_rpm', '100', 'int', TRUE),
  (5, 'maintenance_window_hours', '02:00-04:00', 'string', TRUE);
```

---

## 🔧 Stored Procedures

### SP_GENERATE_MONTHLY_INVOICES
**Schedule:** 1st of month @ 00:00  
**Purpose:** Auto-create invoices for active contracts

```sql
CALL sp_generate_monthly_invoices()
  -- Returns: (invoices_created INT, errors INT)
```

### SP_CHECK_MEMBER_ACCESS
**Purpose:** Real-time access validation  
**Parameters:** @member_id INT  
**Returns:** (allowed BOOL, reason VARCHAR)

```sql
CALL sp_check_member_access(123, @allowed, @reason);
  -- Checks: Contract active, status, overdue invoices
```

### SP_GET_MEMBER_RISK_SCORE
**Purpose:** Calculate churn/billing risk  
**Factors:**
- Overdue invoices (0-30, 30-60, 60+ days)
- Payment failures
- Attendance decline
- Contract type changes

### SP_ARCHIVE_EXPIRED_CONTRACTS
**Schedule:** Daily @ 23:00  
**Purpose:** Auto-expire old contracts

### SP_PROCESS_GUEST_LIMIT
**Purpose:** Enforce monthly guest limits  
**Constraint:** Max 5 guests per member per month

---

## 📈 Key Indexes (Create ASAP)

```sql
-- HIGH PRIORITY (Queries run >100x/day)
CREATE INDEX idx_access_member_time ON Access_Control(MemberId, AccessTime);
CREATE INDEX idx_invoice_member_status ON Billing_Invoices(MemberId, Status);
CREATE UNIQUE INDEX idx_member_email ON Members(Email);
CREATE INDEX idx_booking_session ON Bookings(SessionId, BookingDate);

-- MEDIUM PRIORITY
CREATE INDEX idx_contract_member ON Contracts(MemberId, Status);
CREATE INDEX idx_session_course_date ON Sessions(CourseId, SessionDate);

-- AUDIT/ANALYTICS
CREATE INDEX idx_access_time_status ON Access_Control(AccessTime, Status);
CREATE INDEX idx_invoice_due ON Billing_Invoices(DueDate, Status);
```

---

## 🔐 Security & Privacy

- **PII fields:** Email, MobilePhone, Address (encrypted in production)
- **Audit logging:** All member status changes, invoice modifications, access denials
- **GDPR:** sp_anonymize_member removes all PII on request
- **Retention:** Access logs deleted after 12 months

---

**Approved:** Architecture Team | **Effective Date:** 2026-03-01 | **Next Review:** 2026-06-15
