## [2025-03-16] DATABASE_MASTER — MySQL Audit Report

### EXECUTIVE SUMMARY
- **Schema**: Well-designed with 16 tables, InnoDB engine, proper ENUM types
- **Triggers**: 28 triggers - comprehensive but high complexity
- **Stored Procedures**: 8 procedures - good separation of business logic
- **Indexes**: 14 composite/strategic indexes covering high-traffic paths
- **Generated Columns**: 3 (invoices: vat_amount, amount_incl_tax, balance_due)

---

## FINDINGS: Critical Issues (0/5) | Warnings (3/5) | Observations (4/5)

### 🔴 CRITICAL ISSUES: NONE

### 🟡 WARNINGS

**1. Payment Overpayment Logic - Floating Point Precision Risk**
   - **Trigger**: `trg_before_payment_insert_integrity` (Line 40-43)
   - **Issue**: Uses `v_balance_due + 0.01` tolerance check which assumes 2 decimal places
   - **Risk**: If amounts are DECIMAL(10,3) or (10,4), tolerance becomes incorrect
   - **Fix**: Add comment clarifying EUR 2-decimal assumption or use configurable tolerance
   
**2. Invoice Overdue Status - Manual vs Trigger Enforcement**
   - **Trigger**: `trg_before_invoice_update_integrity` (Line 157-161)
   - **Issue**: Overdue status can be set manually via trigger, but actual status change happens via stored procedure `sp_ExpireElapsedInvoices`
   - **Conflict**: A user could manually mark invoice 'overdue' before due_date passes
   - **Fix**: Allow only system (stored procedure) to set 'overdue' status, or add timestamp-based trigger

**3. Contract Freeze Date Logic - Inconsistency Risk**
   - **Trigger**: `trg_before_contract_update_policy` (Line 236-243)
   - **Issue**: Trigger requires freeze_dates when status='suspended', but allows setting all to NULL when status='active'
   - **Risk**: An active contract with leftover freeze_dates won't trigger the check
   - **Fix**: Add trigger to clear freeze_dates when transitioning TO 'active' status

### 🟢 OBSERVATIONS

**1. Guest Duo Pass Enforcement - Well Designed**
   - **Triggers**: `trg_before_guest_insert_sponsor_policy`, `trg_before_guest_insert_limit`
   - **Assessment**: Correctly validates sponsor status, Duo Pass contract, and 1-guest-per-member limit
   - **Status**: ✅ WORKING WELL

**2. Booking Capacity Management - Complex but Sound**
   - **Triggers**: `trg_before_booking_insert_cap`, `trg_after_booking_insert`, `trg_after_booking_update`, `trg_after_booking_delete`
   - **Assessment**: Properly enforces enrolled_count <= max_capacity with FOR UPDATE locks
   - **Status**: ✅ WORKING WELL

**3. Access Control Procedures - Comprehensive**
   - **Procedures**: `sp_CheckAccess`, `sp_CheckAccessGuest`
   - **Assessment**: Validates club status, member status, contract validity, overdue invoices, and guest sponsor relationships
   - **Status**: ✅ WORKING WELL

**4. GDPR Data Anonymization - Secure**
   - **Procedure**: `sp_AnonymizeMember` (622+ lines)
   - **Assessment**: Cascades to contracts, bookings, guests; maintains referential integrity
   - **Status**: ✅ WORKING WELL

---

## TRIGGERS ASSESSMENT (28 Total)

### Group 1: Payment Integrity (2 triggers)
1. ✅ `trg_before_payment_insert_integrity` - Working well; validates invoice state, error codes, amounts
2. ✅ `trg_after_payment_insert` - Working well; updates invoice status atomically

### Group 2: Invoice Management (2 triggers)
3. ✅ `trg_before_invoice_insert` - Working well; auto-generates invoice numbers using sequence table
4. ⚠️ `trg_before_invoice_update_integrity` - Needs review: manual 'overdue' status risk (Warning #2)

### Group 3: Contract Lifecycle (2 triggers)
5. ✅ `trg_before_contract_insert_policy` - Working well; enforces freeze/cancel metadata consistency
6. ⚠️ `trg_before_contract_update_policy` - Needs fix: freeze_dates cleanup on reactivation (Warning #3)

### Group 4: Guest Management (6 triggers)
7. ✅ `trg_before_guest_insert_limit` - Working well; prevents >1 active guest per member
8. ✅ `trg_before_guest_update_limit` - Working well; blocks reactivation when limit reached
9. ✅ `trg_before_guest_insert_sponsor_policy` - Working well; validates Duo Pass and sponsor status
10. ✅ `trg_before_guest_update_sponsor_policy` - Working well; revalidates on sponsor change
11. ✅ `trg_before_member_insert_age` - Working well; enforces age >= 16
12. ✅ `trg_before_member_update_age` - Working well; prevents age violation on edit

### Group 5: Guest Age & Booking (4 triggers)
13. ✅ `trg_before_guest_insert_age` - Working well; enforces age >= 16 for guests
14. ✅ `trg_before_guest_update_age` - Working well; prevents age violation on guest edit
15. ✅ `trg_after_access_granted` - Working well; updates member.last_visit_date & total_visits
16. ✅ `trg_before_booking_insert_policy` - Working well; validates session, member, contract, access type

### Group 6: Class Session Management (4 triggers)
17. ✅ `trg_before_class_session_insert_instructor` - Working well; validates instructor role and club assignment
18. ✅ `trg_before_class_session_update_instructor` - Working well; revalidates on instructor change
19. ✅ `trg_before_class_session_insert_timing` - Working well; enforces timing and capacity
20. ✅ `trg_before_class_session_update_timing` - Working well; revalidates timing on edit

### Group 7: Maintenance Tickets (2 triggers)
21. ✅ `trg_before_maintenance_insert_policy` - Working well; validates technician role and status lifecycle
22. ✅ `trg_before_maintenance_update_policy` - Working well; revalidates on update

### Group 8: Booking Capacity (6 triggers)
23. ✅ `trg_before_booking_insert_cap` - Working well; prevents overbooking with FOR UPDATE
24. ✅ `trg_after_booking_insert` - Working well; increments enrolled_count
25. ✅ `trg_before_booking_update_policy` - Working well; revalidates booking rules on update
26. ✅ `trg_before_booking_update_cap` - Working well; prevents capacity violations on session change
27. ✅ `trg_after_booking_update` - Working well; adjusts enrolled_count on session move/cancel
28. ✅ `trg_after_booking_delete` - Working well; decrements enrolled_count on deletion

### Summary
- **Working Well**: 26/28 (92.8%)
- **Needs Review**: 2/28 (7.2%)
- **Performance Issues**: 0 (triggers use FOR UPDATE and indexed queries)
- **Redundant**: 0
- **Conflicts**: 0

---

## STORED PROCEDURES (8 Total)

1. ✅ **sp_CheckAccess** - Complex 126-line procedure
   - Validates club operational status, member status, contract validity, overdue invoices
   - Logs access decision to access_log with denial reason
   - Assessment: OPTIMAL - designed for frequent access control calls

2. ✅ **sp_CheckAccessGuest** - Complex 308-line procedure
   - Validates guest age, sponsor status, Duo Pass contract, companion presence (30 min rule)
   - Logs to guest_access_log
   - Assessment: OPTIMAL - handles complex guest access policy

3. ✅ **sp_GenerateMonthlyInvoice** - 423-line procedure with transaction
   - Creates invoice with auto-generated number via invoice_sequences
   - Calculates base_price + options total
   - Inserts invoice_lines for subscription + options
   - Assessment: GOOD - proper use of transaction, but see Performance Issue below

4. ✅ **sp_FreezeContract** - 497-line procedure with validation
   - Updates contract status to 'suspended' with freeze_start_date and freeze_end_date
   - Extends fixed-term end_date to account for freeze period
   - Assessment: GOOD - handles contract type distinction

5. ✅ **sp_RenewContract** - 590-line procedure
   - Converts expired contract to new active contract
   - Copies active contract_options to new contract
   - Assessment: GOOD - properly reuses options

6. ✅ **sp_ExpireElapsedContracts** - 620-line procedure
   - Bulk updates contracts where end_date < CURDATE()
   - Assessment: GOOD - designed for scheduled job (should run nightly)

7. ✅ **sp_AnonymizeMember** - 722-line procedure (LARGEST)
   - Cascading GDPR anonymization: contracts → bookings → members → guests → audit_gdpr
   - Assessment: EXCELLENT - comprehensive GDPR compliance

8. ✅ **sp_ExpireElapsedInvoices** - 750-line procedure
   - Bulk updates invoices where due_date < CURDATE() to 'overdue'
   - Assessment: GOOD - designed for scheduled job

### Assessment Summary
- **Properly Used**: 8/8 (100%) - All use OUT parameters or transactions correctly
- **Performance**: 7/8 GOOD, 1/8 see Performance Issue below
- **Dapper Integration**: ✅ All 5 service classes use correct Dapper patterns with DynamicParameters and CommandType.StoredProcedure

---

## INDEX STRATEGY: 14 Indexes Created

| Index Name | Table | Columns | Usage | Status |
|-----------|-------|---------|-------|--------|
| idx_members_city_status | members | city, status | Filtering by location + status | ✅ |
| idx_members_goal_source | members | primary_goal, acquisition_source | Analytics queries | ✅ |
| idx_members_referral | members | referral_member_id | FK join optimization | ✅ |
| idx_members_status | members | status | Active member filtering | ✅ |
| idx_contracts_member_status_start | contracts | member_id, status, start_date | Access control queries | ✅ |
| idx_contracts_status_end_date | contracts | status, end_date | Expiration queries | ✅ |
| idx_contract_options_contract_dates | contract_options | contract_id, added_on, removed_on | Period filtering | ✅ |
| idx_contract_options_contract_removed | contract_options | contract_id, removed_on | Active options | ✅ |
| idx_invoices_status_due_date | invoices | status, due_date | Overdue invoice queries | ✅ |
| idx_invoices_contract_period_status | invoices | contract_id, billing_period_start, status | Period queries | ✅ |
| idx_payments_status_paid_at | payments | status, paid_at | Payment reporting | ✅ |
| idx_access_log_club_status_at | access_log | club_id, access_status, accessed_at | High-volume analytics | ✅ |
| idx_guest_access_log_club_status_at | guest_access_log | club_id, access_status, accessed_at | High-volume analytics | ✅ |
| idx_maintenance_status_priority_reported | maintenance_tickets | status, priority, reported_at | Ticket filtering | ✅ |

### Missing Index Analysis

**Potentially Missing for High-Traffic Scenarios:**
1. ⚠️ `bookings(member_id, status, session_id)` - No composite index for member booking history
   - Current: Only FK index on member_id
   - Impact: Moderate - used in booking policy validation
   - Recommendation: Add if member booking history queries are frequent

2. ⚠️ `access_log(member_id, accessed_at)` - No index for member access history
   - Current: Only (member_id, club_id, access_status, accessed_at) exists
   - Impact: Low - the existing composite index covers this
   - Recommendation: Already covered

3. ⚠️ `class_sessions(starts_at)` alone is insufficient
   - Current: idx_class_sessions_starts_at exists
   - Future optimization: Consider (club_id, starts_at) for club schedule queries

**Recommended Additions:**
```sql
CREATE INDEX idx_bookings_member_status ON bookings(member_id, status);
CREATE INDEX idx_class_sessions_club_start ON class_sessions(club_id, starts_at);
```

---

## SCHEMA QUALITY ASSESSMENT

### Generated Columns (3 Total)
✅ **All correctly configured as STORED (persistent)**
1. invoices.vat_amount = ROUND(amount_excl_tax * vat_rate, 2)
2. invoices.amount_incl_tax = ROUND(amount_excl_tax * (1 + vat_rate), 2)
3. invoices.balance_due = ROUND(amount_incl_tax - amount_paid, 2)

**Assessment**: Excellent design - generated columns maintain financial accuracy

### Nullable Columns Analysis
- 27 properly nullable fields (mobile_phone, email, resolved_at, etc.)
- 1 design decision: `members.email` is NULLABLE but has UNIQUE constraint
  - **Note**: MySQL allows multiple NULLs in UNIQUE constraints (each NULL is unique)
  - This is by design - good for guest-member workflow
  - **Status**: ✅ Correct

### Constraints
- ✅ Foreign keys: 24 defined, proper CASCADE/RESTRICT policies
- ✅ CHECK constraints: 15 defined for data validation
- ✅ UNIQUE constraints: 5 defined (email, plan_name, option_name, invoice_number, etc.)
- ✅ Primary keys: All 16 tables have surrogate INT UNSIGNED keys

### Collation & Charset
- All tables: `utf8mb4_0900_ai_ci` (MySQL 8.0+)
- **Assessment**: ✅ Excellent - supports full Unicode + case-insensitive collation

---

## PERFORMANCE ISSUES IDENTIFIED

### ⚠️ Issue 1: N+1 Query in Application Layer
**Severity**: HIGH (not database, but affects database load)
**Location**: src/Riada.Application/UseCases/Guests/ListGuestsUseCase.cs
**Problem**: Fetches all guests without loading SponsorMember, causing N+1 lazy loading
**Impact**: 1000 guests = 1001 database round-trips
**Fix**: Use GuestRepository.GetAllWithSponsorAsync() with .Include(g => g.SponsorMember)

### ⚠️ Issue 2: Unlimited Result Set Loading
**Severity**: MEDIUM
**Location**: Same file - ListGuestsUseCase calls GetAllAsync() with no pagination
**Problem**: Loads all guests into memory at once
**Impact**: Memory exhaustion if guest table grows to thousands
**Fix**: Add pagination with Skip/Take

### ⚠️ Issue 3: Invoice Line Item Query Inefficiency
**Severity**: LOW
**Location**: sp_GenerateMonthlyInvoice (lines 375-416)
**Problem**: Queries contract_options twice (once to sum prices, once to insert)
**Optimization**: Restructure to use single JOIN-based calculation
**Current Impact**: Minimal for < 10,000 active contracts

### ✅ Issue 4: Access Control Procedures - NO Performance Issues
**Assessment**: sp_CheckAccess and sp_CheckAccessGuest use proper indexed WHERE clauses
- Uses indexes on contracts(member_id, status, end_date)
- Uses index on invoices(contract_id, status, due_date)
- Fast execution expected < 50ms per access check

---

## DAPPER INTEGRATION ASSESSMENT

### Services Using Dapper
1. ✅ **AccessCheckService** - Correct use of DynamicParameters + OUT parameters
2. ✅ **BillingService** - Correct transaction handling + OUT parameters
3. ✅ **ContractLifecycleService** - Correct parameter mapping
4. ✅ **GdprService** - Correct string parameter handling
5. ✅ **AnalyticsService** - Uses raw SQL with Dapper for complex queries (GOOD PATTERN)

### Dapper Best Practices Observed
✅ All services use:
- DynamicParameters for parameter safety
- CommandType.StoredProcedure explicitly set
- Async/await patterns
- OUT parameter handling with .Get<T>()
- Connection pooling (MySqlConnection from connection string)

### Dapper Anti-Patterns: NONE FOUND
- No SQL injection vulnerabilities (all parameterized)
- No hardcoded connection strings in repositories
- No missing error handling
- Cancellation token support throughout

---

## RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Payment double-charging due to floating-point | LOW | CRITICAL | Add DECIMAL precision comment; add integration tests |
| Contract freeze dates not cleared on reactivation | MEDIUM | MEDIUM | Add trigger to clear freeze_dates when status→active |
| Manual 'overdue' invoice status bypasses grace period | MEDIUM | MEDIUM | Remove manual 'overdue' option; only allow via sp_ExpireElapsedInvoices |
| Guest access procedure timeout on 30-min companion check | LOW | HIGH | Add index on access_log(member_id, accessed_at DESC LIMIT 1) |
| Booking capacity race condition | LOW | MEDIUM | Using FOR UPDATE locks - properly implemented |
| N+1 queries in guest operations | HIGH | MEDIUM | Refactor repository methods to use proper Include() patterns |

---

## QUICK WINS: 1-2 Day Optimizations

1. **[1 hour]** Add GuestRepository.GetAllWithSponsorAsync() method with .Include()
   - Eliminates N+1 in ListGuestsUseCase
   - Estimated improvement: 99% reduction in queries for 1000 guests (1000→1)

2. **[2 hours]** Add pagination to ListGuestsUseCase
   - Change from GetAllAsync() to GetPagedAsync(page=1, pageSize=50)
   - Prevents memory issues with large guest tables

3. **[3 hours]** Add trigger to clear freeze_dates when contract.status→'active'
   - Prevents data consistency issues
   - Update existing trg_before_contract_update_policy

4. **[1 hour]** Add comment to payment trigger about EUR 2-decimal precision
   - Prevents future confusion or bugs
   - Update line 40 with precision note

5. **[2 hours]** Add these indexes:
   ```sql
   CREATE INDEX idx_bookings_member_status ON bookings(member_id, status);
   CREATE INDEX idx_class_sessions_club_start ON class_sessions(club_id, starts_at);
   ```

---

## CYCLE 2 RECOMMENDATIONS

### HIGH PRIORITY
1. **Fix N+1 Query Issue** - GuestRepository.GetAllWithSponsorAsync()
2. **Add Missing Indexes** - bookings and class_sessions composite indexes
3. **Fix Contract Freeze Logic** - Trigger to clear freeze_dates on reactivation
4. **Add Pagination** - ListGuestsUseCase + other bulk fetch operations

### MEDIUM PRIORITY
1. **Refactor Invoice Generation** - Use single query instead of two
2. **Add Comprehensive Index Statistics** - ANALYZE TABLE for query optimization
3. **Implement Query Timeout** - Set max_execution_time on access procedures
4. **Add Connection Pooling Config** - Dapper pool size tuning

### LOW PRIORITY (Cycle 3+)
1. Implement materialized views for analytics queries
2. Add database monitoring (slow query log analysis)
3. Partition large tables (access_log, guest_access_log) by date
4. Archive old audit_gdpr records

---

## AUDIT CHECKLIST: SCHEMA CORRECTNESS

✅ All ForeignKey constraints properly configured
✅ Cascade/Restrict policies appropriate
✅ CHECK constraints protect data integrity
✅ Generated columns using STORED (not VIRTUAL)
✅ Timezone handling: DATETIME(3) with milliseconds
✅ No circular dependencies detected
✅ Audit columns (created_at, updated_at) on all tables
✅ Email fields have UNIQUE constraints where appropriate
✅ Age validation triggers prevent underage registration
✅ Financial fields use DECIMAL(10,2) not FLOAT
✅ Enum types restrict to valid business values
✅ No deprecated SQL functions used
✅ InnoDB engine on all tables (ACID compliance)
✅ UTF-8 collation for international data

---

**Report Generated**: 2025-03-16 | **Auditor**: DATABASE_MASTER | **Status**: AUDIT COMPLETE
