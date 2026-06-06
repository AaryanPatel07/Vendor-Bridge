-- ============================================================
-- VendorBridge — Storage Bucket Setup
-- Run in Supabase SQL Editor after schema migrations
-- ============================================================

-- Create the rfq-attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rfq-attachments',
  'rfq-attachments',
  false,
  10485760,    -- 10 MB max per file
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create the invoice-pdfs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-pdfs',
  'invoice-pdfs',
  false,
  10485760,
  ARRAY['application/pdf']
);

-- ─────────────────────────────────────────
-- RFQ Attachments Storage Policies
-- ─────────────────────────────────────────

-- Officers/admins can upload attachments
CREATE POLICY "rfq_attachments_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'rfq-attachments'
    AND auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer')
  );

-- Internal users can read all attachments
CREATE POLICY "rfq_attachments_read_internal"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'rfq-attachments'
    AND auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Vendors can read attachments for RFQs they are assigned to
-- (path format: rfqs/{rfq_id}/filename)
CREATE POLICY "rfq_attachments_read_vendor"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'rfq-attachments'
    AND auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND (storage.foldername(name))[1] IN (
      SELECT rva.rfq_id::TEXT
      FROM rfq_vendor_assignments rva
      JOIN vendors v ON v.id = rva.vendor_id
      WHERE v.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- Invoice PDFs Storage Policies
-- ─────────────────────────────────────────

-- Internal users can read all invoice PDFs
CREATE POLICY "invoice_pdfs_read_internal"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoice-pdfs'
    AND auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'officer', 'approver')
  );

-- Vendors can read their own invoice PDFs
-- (path format: invoices/{invoice_id}/filename)
CREATE POLICY "invoice_pdfs_read_vendor"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoice-pdfs'
    AND auth.jwt() -> 'app_metadata' ->> 'role' = 'vendor'
    AND (storage.foldername(name))[2] IN (
      SELECT i.id::TEXT
      FROM invoices i
      JOIN vendors v ON v.id = i.vendor_id
      WHERE v.profile_id = auth.uid()
    )
  );

-- Only service role (Edge functions) can upload invoice PDFs
-- No user-facing upload policy — this is intentional
