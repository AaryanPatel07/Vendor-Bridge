-- ============================================================
-- VendorBridge — Row Level Security (RLS) Policies
-- Run AFTER 00002_triggers_and_functions.sql
-- ============================================================

-- Enable RLS on every table
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors               ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_vendor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- HELPER: get current user's role from JWT
-- ─────────────────────────────────────────
-- Role is stored in auth.users.raw_app_meta_data by the admin
-- Access in policies via: auth.jwt() -> 'app_metadata' ->> 'role'

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
-- Everyone can read profiles (needed for displaying names)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Admin can update any profile (for role management)
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- ─────────────────────────────────────────
-- VENDORS
-- ─────────────────────────────────────────
-- Officers, approvers, admins can read all vendors
CREATE POLICY "vendors_internal_select"
  ON vendors FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Vendors can read only their own record
CREATE POLICY "vendors_own_select"
  ON vendors FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND profile_id = auth.uid()
  );

-- Admin and officer can insert vendors
CREATE POLICY "vendors_insert"
  ON vendors FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- Admin can update/delete vendors
CREATE POLICY "vendors_admin_update"
  ON vendors FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "vendors_admin_delete"
  ON vendors FOR DELETE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- ─────────────────────────────────────────
-- RFQs
-- ─────────────────────────────────────────
-- Officers and admins see all RFQs
CREATE POLICY "rfqs_internal_select"
  ON rfqs FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Vendors see only RFQs they are assigned to (and only published/closed ones)
CREATE POLICY "rfqs_vendor_select"
  ON rfqs FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND status IN ('published', 'closed')
    AND id IN (
      SELECT rva.rfq_id FROM rfq_vendor_assignments rva
      JOIN vendors v ON v.id = rva.vendor_id
      WHERE v.profile_id = auth.uid()
    )
  );

-- Officers and admins can create RFQs
CREATE POLICY "rfqs_insert"
  ON rfqs FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- Officers can update their own RFQs; admins can update any
CREATE POLICY "rfqs_update_own"
  ON rfqs FOR UPDATE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'officer'
    AND created_by = auth.uid()
    AND status = 'draft'  -- can only edit drafts
  );

CREATE POLICY "rfqs_admin_update"
  ON rfqs FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- ─────────────────────────────────────────
-- RFQ VENDOR ASSIGNMENTS
-- ─────────────────────────────────────────
CREATE POLICY "rva_internal_select"
  ON rfq_vendor_assignments FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

CREATE POLICY "rva_vendor_select"
  ON rfq_vendor_assignments FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
  );

CREATE POLICY "rva_insert"
  ON rfq_vendor_assignments FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

CREATE POLICY "rva_delete"
  ON rfq_vendor_assignments FOR DELETE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- ─────────────────────────────────────────
-- QUOTATIONS
-- ─────────────────────────────────────────
-- Officers and approvers see all quotations for their RFQs
CREATE POLICY "quotations_internal_select"
  ON quotations FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Vendors see only their own quotations
CREATE POLICY "quotations_vendor_select"
  ON quotations FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
  );

-- Vendors can submit (insert) quotations for RFQs they are assigned to
CREATE POLICY "quotations_vendor_insert"
  ON quotations FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    AND rfq_id IN (
      SELECT rva.rfq_id FROM rfq_vendor_assignments rva
      JOIN vendors v ON v.id = rva.vendor_id
      WHERE v.profile_id = auth.uid()
    )
  );

-- Vendors can update only their own SUBMITTED quotations (before review)
CREATE POLICY "quotations_vendor_update"
  ON quotations FOR UPDATE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    AND status = 'submitted'
  );

-- Officers can update quotation status (shortlist / reject)
CREATE POLICY "quotations_officer_update"
  ON quotations FOR UPDATE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- ─────────────────────────────────────────
-- APPROVALS
-- ─────────────────────────────────────────
-- Approvers, officers, admins can read approvals
CREATE POLICY "approvals_select"
  ON approvals FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Officers/admins create approval requests
CREATE POLICY "approvals_insert"
  ON approvals FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- Only the assigned approver (or admin) can update approval status
CREATE POLICY "approvals_approver_update"
  ON approvals FOR UPDATE
  USING (
    (
      auth.jwt() -> 'app_metadata' ->> 'role' = 'approver'
      AND approver_id = auth.uid()
    )
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- ─────────────────────────────────────────
-- PURCHASE ORDERS
-- ─────────────────────────────────────────
-- Internal users see all POs
CREATE POLICY "po_internal_select"
  ON purchase_orders FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Vendor sees their own POs
CREATE POLICY "po_vendor_select"
  ON purchase_orders FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
  );

-- Only officers and admins can generate POs
CREATE POLICY "po_insert"
  ON purchase_orders FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

CREATE POLICY "po_update"
  ON purchase_orders FOR UPDATE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- ─────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────
-- Internal users see all invoices
CREATE POLICY "invoices_internal_select"
  ON invoices FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Vendor sees their own invoices
CREATE POLICY "invoices_vendor_select"
  ON invoices FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
  );

-- Officers/admins can generate and update invoices
CREATE POLICY "invoices_insert"
  ON invoices FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

CREATE POLICY "invoices_update"
  ON invoices FOR UPDATE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- ─────────────────────────────────────────
-- ACTIVITY LOGS
-- ─────────────────────────────────────────
-- All internal users can read logs
CREATE POLICY "logs_internal_select"
  ON activity_logs FOR SELECT
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Logs are inserted only by triggers (SECURITY DEFINER), never directly by users
-- No INSERT policy for users needed

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
-- Users see only their own notifications
CREATE POLICY "notifications_own_select"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Mark own notifications as read
CREATE POLICY "notifications_own_update"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Inserted only by triggers (SECURITY DEFINER)
-- No INSERT policy for users needed
