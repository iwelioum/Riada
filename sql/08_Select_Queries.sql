USE riada_db;

WITH latest_contract AS (
    SELECT
        c.*,
        ROW_NUMBER() OVER (PARTITION BY c.member_id ORDER BY c.start_date DESC, c.id DESC) AS rn
    FROM contracts c
)
SELECT
    m.id AS member_id,
    m.last_name,
    m.first_name,
    lc.id AS contract_id,
    lc.status AS contract_status,
    sp.plan_name,
    cl.name AS home_club,
    COALESCE(SUM(CASE WHEN i.status = 'overdue' AND i.due_date < CURDATE() THEN 1 ELSE 0 END), 0) AS overdue_invoice_count
FROM members m
LEFT JOIN latest_contract lc
       ON lc.member_id = m.id
      AND lc.rn = 1
LEFT JOIN subscription_plans sp
       ON sp.id = lc.plan_id
LEFT JOIN clubs cl
       ON cl.id = lc.home_club_id
LEFT JOIN invoices i
       ON i.contract_id = lc.id
GROUP BY
    m.id, m.last_name, m.first_name, lc.id, lc.status, sp.plan_name, cl.name
ORDER BY m.id;

SELECT
    cl.name AS club_name,
    al.access_status,
    COALESCE(al.denial_reason, 'none') AS denial_reason,
    COUNT(*) AS attempts_30d
FROM access_log al
JOIN clubs cl
  ON cl.id = al.club_id
WHERE al.accessed_at >= NOW(3) - INTERVAL 30 DAY
GROUP BY cl.name, al.access_status, COALESCE(al.denial_reason, 'none')
ORDER BY cl.name, al.access_status, attempts_30d DESC;

SELECT
    DATE_FORMAT(i.issued_on, '%Y-%m') AS yyyymm,
    cl.name AS club_name,
    COUNT(*) AS invoice_count,
    ROUND(SUM(i.amount_incl_tax), 2) AS billed_total,
    ROUND(SUM(i.amount_paid), 2) AS paid_total,
    ROUND(SUM(i.balance_due), 2) AS open_balance_total,
    ROUND(100 * SUM(CASE WHEN i.status IN ('paid', 'partially_paid') THEN 1 ELSE 0 END) / COUNT(*), 2) AS collection_ratio_pct
FROM invoices i
JOIN contracts c
  ON c.id = i.contract_id
JOIN clubs cl
  ON cl.id = c.home_club_id
GROUP BY DATE_FORMAT(i.issued_on, '%Y-%m'), cl.name
ORDER BY yyyymm DESC, cl.name;

SELECT
    cs.id AS session_id,
    cl.name AS club_name,
    co.course_name,
    cs.starts_at,
    co.max_capacity,
    cs.enrolled_count,
    ROUND(100 * cs.enrolled_count / co.max_capacity, 2) AS occupancy_pct
FROM class_sessions cs
JOIN courses co
  ON co.id = cs.course_id
JOIN clubs cl
  ON cl.id = cs.club_id
WHERE cs.starts_at BETWEEN NOW(3) AND NOW(3) + INTERVAL 14 DAY
ORDER BY cs.starts_at, cl.name, co.course_name;

SELECT
    cl.name AS club_name,
    mt.priority,
    mt.status,
    COUNT(*) AS ticket_count,
    ROUND(SUM(mt.repair_cost), 2) AS total_repair_cost
FROM maintenance_tickets mt
JOIN equipment e
  ON e.id = mt.equipment_id
JOIN clubs cl
  ON cl.id = e.club_id
GROUP BY cl.name, mt.priority, mt.status
ORDER BY cl.name, FIELD(mt.priority, 'critical', 'high', 'medium', 'low'), mt.status;

WITH latest_active_contract AS (
    SELECT
        c.member_id,
        c.id AS contract_id,
        c.plan_id,
        ROW_NUMBER() OVER (PARTITION BY c.member_id ORDER BY c.start_date DESC, c.id DESC) AS rn
    FROM contracts c
    WHERE c.status = 'active'
)
SELECT
    g.id AS guest_id,
    g.status AS guest_status,
    g.sponsor_member_id,
    lac.contract_id,
    sp.plan_name,
    sp.duo_pass_allowed,
    CASE
        WHEN g.status = 'active' AND (sp.duo_pass_allowed IS NULL OR sp.duo_pass_allowed = 0) THEN 'violation'
        WHEN g.status = 'active' AND sp.duo_pass_allowed = 1 THEN 'ok'
        ELSE 'not_applicable'
    END AS compliance_status
FROM guests g
LEFT JOIN latest_active_contract lac
       ON lac.member_id = g.sponsor_member_id
      AND lac.rn = 1
LEFT JOIN subscription_plans sp
       ON sp.id = lac.plan_id
ORDER BY g.id;

WITH overdue_by_contract AS (
    SELECT
        i.contract_id,
        COUNT(*) AS overdue_count
    FROM invoices i
    WHERE i.status IN ('overdue', 'partially_paid')
      AND i.due_date < CURDATE()
    GROUP BY i.contract_id
),
denied_by_member AS (
    SELECT
        al.member_id,
        COUNT(*) AS denied_60d
    FROM access_log al
    WHERE al.access_status = 'denied'
      AND al.accessed_at >= NOW(3) - INTERVAL 60 DAY
      AND al.member_id IS NOT NULL
    GROUP BY al.member_id
)
SELECT
    m.id AS member_id,
    m.last_name,
    m.first_name,
    c.id AS contract_id,
    sp.plan_name,
    COALESCE(obc.overdue_count, 0) AS overdue_invoice_count,
    COALESCE(dbm.denied_60d, 0) AS denied_access_60d,
    COALESCE(obc.overdue_count, 0) * 10 + COALESCE(dbm.denied_60d, 0) * 3 AS risk_score
FROM contracts c
JOIN members m
  ON m.id = c.member_id
JOIN subscription_plans sp
  ON sp.id = c.plan_id
LEFT JOIN overdue_by_contract obc
  ON obc.contract_id = c.id
LEFT JOIN denied_by_member dbm
  ON dbm.member_id = m.id
WHERE c.status = 'active'
ORDER BY risk_score DESC, m.id
LIMIT 25;

SELECT
    so.option_name,
    COUNT(DISTINCT co.contract_id) AS active_contracts_with_option,
    ROUND(SUM(so.monthly_price), 2) AS monthly_option_revenue_floor
FROM contract_options co
JOIN service_options so
  ON so.id = co.option_id
JOIN contracts c
  ON c.id = co.contract_id
WHERE c.status = 'active'
  AND co.removed_on IS NULL
GROUP BY so.option_name
ORDER BY active_contracts_with_option DESC, so.option_name;
