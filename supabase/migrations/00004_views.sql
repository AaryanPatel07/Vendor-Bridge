-- ============================================================
-- VendorBridge — Views for Dashboard & Analytics
-- Run AFTER 00003_rls_policies.sql
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Dashboard summary view
--    Used for the top analytics cards
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  (SELECT COUNT(*) FROM rfqs WHERE status = 'published') AS active_rfqs,
  (SELECT COUNT(*) FROM approvals WHERE status = 'pending') AS pending_approvals,
  (SELECT COUNT(*) FROM purchase_orders WHERE status IN ('generated', 'sent')) AS active_pos,
  (SELECT COUNT(*) FROM invoices WHERE status = 'sent') AS pending_invoices,
  (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid' AND created_at >= date_trunc('month', NOW())) AS revenue_this_month,
  (SELECT COUNT(*) FROM vendors WHERE status = 'active') AS active_vendors,
  (SELECT COUNT(*) FROM quotations WHERE submitted_at >= NOW() - INTERVAL '7 days') AS quotations_this_week;

-- ─────────────────────────────────────────
-- 2. Quotation comparison view
--    Side-by-side data for a given RFQ
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW quotation_comparison AS
SELECT
  q.id AS quotation_id,
  q.rfq_id,
  q.status AS quotation_status,
  q.subtotal,
  q.delivery_days,
  q.notes,
  q.submitted_at,
  v.id AS vendor_id,
  v.company_name,
  v.rating AS vendor_rating,
  v.gst_number
FROM quotations q
JOIN vendors v ON v.id = q.vendor_id;

-- ─────────────────────────────────────────
-- 3. Procurement activity feed
--    Used for the activity timeline on the dashboard
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW procurement_activity_feed AS
SELECT
  al.id,
  al.entity_type,
  al.entity_id,
  al.action,
  al.metadata,
  al.created_at,
  p.full_name AS actor_name,
  p.email AS actor_email,
  p.role AS actor_role
FROM activity_logs al
LEFT JOIN profiles p ON p.id = al.actor_id
ORDER BY al.created_at DESC;

-- ─────────────────────────────────────────
-- 4. Monthly spending trend
--    Used for the analytics chart
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW monthly_spending AS
SELECT
  date_trunc('month', created_at) AS month,
  COUNT(*) AS invoice_count,
  SUM(total) AS total_spent,
  SUM(tax_amount) AS total_tax
FROM invoices
WHERE status IN ('sent', 'paid')
GROUP BY date_trunc('month', created_at)
ORDER BY month DESC;

-- ─────────────────────────────────────────
-- 5. Vendor performance view
--    Used for vendor analytics screen
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW vendor_performance AS
SELECT
  v.id AS vendor_id,
  v.company_name,
  v.category,
  v.status,
  v.rating,
  COUNT(DISTINCT q.rfq_id) AS rfqs_participated,
  COUNT(DISTINCT CASE WHEN q.status = 'awarded' THEN q.id END) AS rfqs_won,
  ROUND(
    COUNT(DISTINCT CASE WHEN q.status = 'awarded' THEN q.id END)::NUMERIC
    / NULLIF(COUNT(DISTINCT q.rfq_id), 0) * 100, 1
  ) AS win_rate_percent,
  COALESCE(SUM(CASE WHEN i.status IN ('sent', 'paid') THEN i.total ELSE 0 END), 0) AS total_invoiced
FROM vendors v
LEFT JOIN quotations q ON q.vendor_id = v.id
LEFT JOIN purchase_orders po ON po.vendor_id = v.id
LEFT JOIN invoices i ON i.vendor_id = v.id
GROUP BY v.id, v.company_name, v.category, v.status, v.rating;

-- ─────────────────────────────────────────
-- 6. Full procurement pipeline view
--    Traces rfq → quotation → approval → po → invoice
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW procurement_pipeline AS
SELECT
  r.id AS rfq_id,
  r.title AS rfq_title,
  r.status AS rfq_status,
  r.deadline,
  r.created_at AS rfq_created_at,
  q.id AS quotation_id,
  q.subtotal AS quotation_value,
  q.status AS quotation_status,
  a.id AS approval_id,
  a.status AS approval_status,
  a.acted_at AS approval_date,
  po.id AS po_id,
  po.po_number,
  po.status AS po_status,
  inv.id AS invoice_id,
  inv.invoice_number,
  inv.total AS invoice_total,
  inv.status AS invoice_status,
  v.company_name AS vendor_name
FROM rfqs r
LEFT JOIN quotations q ON q.rfq_id = r.id AND q.status = 'awarded'
LEFT JOIN approvals a ON a.quotation_id = q.id
LEFT JOIN purchase_orders po ON po.quotation_id = q.id
LEFT JOIN invoices inv ON inv.po_id = po.id
LEFT JOIN vendors v ON v.id = q.vendor_id
ORDER BY r.created_at DESC;
