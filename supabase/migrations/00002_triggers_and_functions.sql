-- ============================================================
-- VendorBridge — Triggers & Functions
-- Run AFTER 00001_initial_schema.sql
-- ============================================================

-- ─────────────────────────────────────────
-- 1. updated_at auto-updater
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_rfqs_updated_at
  BEFORE UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_quotations_updated_at
  BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_po_updated_at
  BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────
-- 2. Auto-generate PO number on INSERT
--    Format: PO-YYYYMM-0001
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMM') || '-' ||
                   LPAD(nextval('po_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_po_number
  BEFORE INSERT ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION generate_po_number();

-- ─────────────────────────────────────────
-- 3. Auto-generate Invoice number on INSERT
--    Format: INV-YYYYMM-0001
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' ||
                        LPAD(nextval('invoice_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ─────────────────────────────────────────
-- 4. Activity log — fires on any status change
--    across rfqs, quotations, approvals, pos, invoices
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activity_logs (entity_type, entity_id, action, actor_id, metadata)
    VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'status_changed',
      auth.uid(),
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_rfq_status_log
  AFTER UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION log_status_change();
CREATE TRIGGER trg_quotation_status_log
  AFTER UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION log_status_change();
CREATE TRIGGER trg_approval_status_log
  AFTER UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION log_status_change();
CREATE TRIGGER trg_po_status_log
  AFTER UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION log_status_change();
CREATE TRIGGER trg_invoice_status_log
  AFTER UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- ─────────────────────────────────────────
-- 5. Activity log — fires on INSERT for key tables
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_entity_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES (TG_TABLE_NAME, NEW.id, 'created', auth.uid(), '{}'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_rfq_created_log
  AFTER INSERT ON rfqs FOR EACH ROW EXECUTE FUNCTION log_entity_created();
CREATE TRIGGER trg_quotation_created_log
  AFTER INSERT ON quotations FOR EACH ROW EXECUTE FUNCTION log_entity_created();
CREATE TRIGGER trg_po_created_log
  AFTER INSERT ON purchase_orders FOR EACH ROW EXECUTE FUNCTION log_entity_created();
CREATE TRIGGER trg_invoice_created_log
  AFTER INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION log_entity_created();

-- ─────────────────────────────────────────
-- 6. Notifications — auto-create when approval is submitted
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_approval_requested()
RETURNS TRIGGER AS $$
DECLARE
  v_rfq_title TEXT;
BEGIN
  SELECT title INTO v_rfq_title FROM rfqs WHERE id = NEW.rfq_id;

  -- notify the assigned approver
  IF NEW.approver_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
    VALUES (
      NEW.approver_id,
      'approval_requested',
      'Approval Required',
      'A quotation for "' || v_rfq_title || '" needs your approval.',
      'approval',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_approval_requested
  AFTER INSERT ON approvals FOR EACH ROW EXECUTE FUNCTION notify_approval_requested();

-- ─────────────────────────────────────────
-- 7. Notifications — when approval is acted on, notify the officer
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_approval_done()
RETURNS TRIGGER AS $$
DECLARE
  v_rfq_title TEXT;
  v_officer_id UUID;
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    SELECT r.title, r.created_by INTO v_rfq_title, v_officer_id
    FROM rfqs r WHERE r.id = NEW.rfq_id;

    INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
    VALUES (
      v_officer_id,
      'approval_done',
      'Approval ' || initcap(NEW.status::TEXT),
      'Quotation for "' || v_rfq_title || '" was ' || NEW.status::TEXT || '.',
      'approval',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_approval_done
  AFTER UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION notify_approval_done();

-- ─────────────────────────────────────────
-- 8. When approval is approved → auto-mark quotation as awarded
--    and mark all other quotations for same RFQ as rejected
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_approval_result()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    -- award the winning quotation
    UPDATE quotations SET status = 'awarded'
    WHERE id = NEW.quotation_id;

    -- reject all other quotations for this RFQ
    UPDATE quotations SET status = 'rejected'
    WHERE rfq_id = NEW.rfq_id AND id <> NEW.quotation_id AND status NOT IN ('rejected');

    -- close the RFQ
    UPDATE rfqs SET status = 'closed' WHERE id = NEW.rfq_id;
  END IF;

  IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    -- put quotation back to under_review for re-evaluation
    UPDATE quotations SET status = 'under_review'
    WHERE id = NEW.quotation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_handle_approval_result
  AFTER UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION handle_approval_result();

-- ─────────────────────────────────────────
-- 9. When RFQ is published → create a profile entry for auth.users
--    This is called from Supabase Auth webhook on user signup
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'officer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
