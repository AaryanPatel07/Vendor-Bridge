// supabase/functions/send-invoice-email/index.ts
// Fetches the invoice PDF from Storage and emails it to the vendor via Resend.
// Also marks the invoice status as 'sent' and records sent_at timestamp.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { invoice_id } = await req.json();
  if (!invoice_id) {
    return new Response(JSON.stringify({ error: "invoice_id is required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch the invoice
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      vendor:vendors (company_name, contact_email, contact_name),
      purchase_order:purchase_orders (po_number)
    `)
    .eq("id", invoice_id)
    .single();

  if (error || !invoice) {
    return new Response(JSON.stringify({ error: "Invoice not found" }), {
      status: 404, headers: { "Content-Type": "application/json" },
    });
  }

  if (!invoice.pdf_url) {
    return new Response(
      JSON.stringify({ error: "PDF not generated yet. Call generate-invoice-pdf first." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Download the PDF from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("invoice-pdfs")
    .download(invoice.pdf_url);

  if (downloadError || !fileData) {
    return new Response(JSON.stringify({ error: "Failed to fetch PDF from storage" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  // Convert blob to base64 for Resend attachment
  const arrayBuffer = await fileData.arrayBuffer();
  const base64Pdf = btoa(
    String.fromCharCode(...new Uint8Array(arrayBuffer))
  );

  const issueDate = new Date(invoice.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const fileName = `${invoice.invoice_number}.pdf`;

  // Send via Resend with PDF attachment
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "VendorBridge <invoices@vendorbridge.app>",
      to: invoice.vendor.contact_email,
      subject: `Invoice ${invoice.invoice_number} from VendorBridge`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Invoice ${invoice.invoice_number}</h2>
          <p>Dear ${invoice.vendor.contact_name},</p>
          <p>Please find your invoice attached for the purchase order <strong>${invoice.purchase_order.po_number}</strong>.</p>
          <table style="width:100%; border-collapse:collapse; margin: 16px 0; background:#f8f9fa;">
            <tr>
              <td style="padding:10px 16px;"><strong>Invoice Number</strong></td>
              <td style="padding:10px 16px;">${invoice.invoice_number}</td>
            </tr>
            <tr style="background:#fff;">
              <td style="padding:10px 16px;"><strong>Issue Date</strong></td>
              <td style="padding:10px 16px;">${issueDate}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;"><strong>Subtotal</strong></td>
              <td style="padding:10px 16px;">₹${Number(invoice.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="background:#fff;">
              <td style="padding:10px 16px;"><strong>GST (${invoice.tax_rate}%)</strong></td>
              <td style="padding:10px 16px;">₹${Number(invoice.tax_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="background:#1a1a2e; color:#fff;">
              <td style="padding:12px 16px;"><strong>Total Amount</strong></td>
              <td style="padding:12px 16px;"><strong>₹${Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </table>
          <p style="color:#666; font-size:13px;">
            The invoice PDF is attached to this email. If you have any questions,
            please contact your VendorBridge procurement officer.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: base64Pdf,
        },
      ],
    }),
  });

  if (!emailResponse.ok) {
    const errText = await emailResponse.text();
    return new Response(JSON.stringify({ error: "Email send failed", detail: errText }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  // Mark invoice as 'sent'
  const { error: updateError } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", invoice_id);

  if (updateError) {
    return new Response(JSON.stringify({ error: "Invoice status update failed" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ success: true, sent_to: invoice.vendor.contact_email }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
