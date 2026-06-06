-- ============================================================
-- VendorBridge — Initial Schema
-- Run this in Supabase SQL Editor or via supabase db push
-- ============================================================

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'officer', 'approver', 'vendor');
CREATE TYPE vendor_status AS ENUM ('active', 'inactive', 'blacklisted');
CREATE TYPE rfq_status AS ENUM ('draft', 'published', 'under_review', 'closed', 'cancelled');
CREATE TYPE quotation_status AS ENUM ('submitted', 'under_review', 'shortlisted', 'rejected', 'awarded');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE po_status AS ENUM ('generated', 'sent', 'acknowledged', 'completed');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'cancelled');
CREATE TYPE notification_type AS ENUM (
  'rfq_published', 'rfq_closed',
  'quotation_received', 'quotation_shortlisted', 'quotation_rejected', 'quotation_awarded',
  'approval_requested', 'approval_done',
  'po_generated', 'invoice_sent'
);

-- ─────────────────────────────────────────
-- SEQUENCES for document numbers
-- ─────────────────────────────────────────
CREATE SEQUENCE po_number_seq START 1;
CREATE SEQUENCE invoice_number_seq START 1;

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          user_role NOT NULL DEFAULT 'officer',
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- VENDORS
-- ─────────────────────────────────────────
CREATE TABLE vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_name    TEXT NOT NULL,
  gst_number      TEXT NOT NULL,
  category        TEXT NOT NULL,
  contact_name    TEXT NOT NULL,
  contact_email   TEXT NOT NULL UNIQUE,
  contact_phone   TEXT NOT NULL,
  address         TEXT,
  status          vendor_status NOT NULL DEFAULT 'active',
  rating          NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RFQs
-- ─────────────────────────────────────────
CREATE TABLE rfqs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  status          rfq_status NOT NULL DEFAULT 'draft',
  deadline        TIMESTAMPTZ NOT NULL,
  -- items is an array of {name, description, quantity, unit, estimated_price}
  items           JSONB NOT NULL DEFAULT '[]',
  attachments     JSONB NOT NULL DEFAULT '[]', -- array of storage paths
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RFQ VENDOR ASSIGNMENTS (many-to-many)
-- ─────────────────────────────────────────
CREATE TABLE rfq_vendor_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id      UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id   UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);

-- ─────────────────────────────────────────
-- QUOTATIONS
-- ─────────────────────────────────────────
CREATE TABLE quotations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id          UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status          quotation_status NOT NULL DEFAULT 'submitted',
  -- items mirrors rfq items with vendor pricing: {name, quantity, unit, unit_price, total_price}
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_days   INTEGER NOT NULL,
  notes           TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);

-- ─────────────────────────────────────────
-- APPROVALS
-- ─────────────────────────────────────────
CREATE TABLE approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id          UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  requested_by    UUID NOT NULL REFERENCES profiles(id),
  approver_id     UUID REFERENCES profiles(id),
  status          approval_status NOT NULL DEFAULT 'pending',
  remarks         TEXT,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acted_at        TIMESTAMPTZ,
  UNIQUE(rfq_id, quotation_id)
);

-- ─────────────────────────────────────────
-- PURCHASE ORDERS
-- ─────────────────────────────────────────
CREATE TABLE purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number       TEXT NOT NULL UNIQUE,
  approval_id     UUID NOT NULL REFERENCES approvals(id) ON DELETE RESTRICT,
  quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE RESTRICT,
  vendor_id       UUID NOT NULL REFERENCES vendors(id),
  status          po_status NOT NULL DEFAULT 'generated',
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12,2) NOT NULL,
  generated_by    UUID NOT NULL REFERENCES profiles(id),
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT NOT NULL UNIQUE,
  po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
  vendor_id       UUID NOT NULL REFERENCES vendors(id),
  status          invoice_status NOT NULL DEFAULT 'draft',
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12,2) NOT NULL,
  tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 18.00, -- GST %
  tax_amount      NUMERIC(12,2) NOT NULL,
  total           NUMERIC(12,2) NOT NULL,
  pdf_url         TEXT,  -- Supabase Storage path
  sent_at         TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  generated_by    UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ACTIVITY LOGS (audit trail)
-- ─────────────────────────────────────────
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT NOT NULL,  -- 'rfq' | 'quotation' | 'approval' | 'purchase_order' | 'invoice'
  entity_id       UUID NOT NULL,
  action          TEXT NOT NULL,  -- 'created' | 'status_changed' | 'updated' | 'deleted'
  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',  -- {from_status, to_status, remarks, etc.}
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type                  notification_type NOT NULL,
  title                 TEXT NOT NULL,
  message               TEXT NOT NULL,
  is_read               BOOLEAN NOT NULL DEFAULT false,
  related_entity_type   TEXT,
  related_entity_id     UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_created_by ON rfqs(created_by);
CREATE INDEX idx_rfqs_deadline ON rfqs(deadline);
CREATE INDEX idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX idx_quotations_vendor_id ON quotations(vendor_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);
CREATE INDEX idx_po_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_invoices_po_id ON invoices(po_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id) WHERE is_read = false;
