// supabase/functions/generate-invoice-pdf/index.ts
// Generates a PDF invoice using Browserless (headless Chrome API),
// saves it to Supabase Storage, and updates the invoice record with the pdf_url.
// Called from the frontend when user clicks "Generate PDF" on an invoice.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BROWSERLESS_API_KEY = Deno.env.get("BROWSERLESS_API_KEY")!;

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

  // Fetch full invoice data with joins
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      vendor:vendors (company_name, gst_number, contact_email, contact_name, address),
      purchase_order:purchase_orders (po_number),
      generator:profiles!invoices_generated_by_fkey (full_name, email)
    `)
    .eq("id", invoice_id)
    .single();

  if (error || !invoice) {
    return new Response(JSON.stringify({ error: "Invoice not found" }), {
      status: 404, headers: { "Content-Type": "application/json" },
    });
  }

  // Build the HTML for the invoice
  const html = buildInvoiceHTML(invoice);

  // Call Browserless to convert HTML to PDF
  const pdfResponse = await fetch(
    `https://chrome.browserless.io/pdf?token=${BROWSERLESS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        options: {
          printBackground: true,
          format: "A4",
          margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
        },
      }),
    }
  );

  if (!pdfResponse.ok) {
    return new Response(JSON.stringify({ error: "PDF generation failed" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const pdfBuffer = await pdfResponse.arrayBuffer();
  const fileName = `${invoice.invoice_number}.pdf`;
  const storagePath = `invoices/${invoice_id}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("invoice-pdfs")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return new Response(JSON.stringify({ error: "Storage upload failed", detail: uploadError }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  // Update the invoice record with the pdf_url
  const { error: updateError } = await supabase
    .from("invoices")
    .update({ pdf_url: storagePath })
    .eq("id", invoice_id);

  if (updateError) {
    return new Response(JSON.stringify({ error: "Invoice update failed" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  // Return a signed URL valid for 1 hour for immediate download/preview
  const { data: signedUrl } = await supabase.storage
    .from("invoice-pdfs")
    .createSignedUrl(storagePath, 3600);

  return new Response(
    JSON.stringify({ success: true, pdf_url: storagePath, signed_url: signedUrl?.signedUrl }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

function buildInvoiceHTML(invoice: any): string {
  const issueDate = new Date(invoice.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const itemRows = invoice.items.map((item: any) => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:center;">${item.unit}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:right;">
        ₹${Number(item.unit_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>
      <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:right;">
        ₹${Number(item.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; }
        .header { background: #1a1a2e; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
        .header .invoice-meta { text-align: right; font-size: 13px; }
        .header .invoice-number { font-size: 18px; font-weight: bold; }
        .parties { display: flex; justify-content: space-between; padding: 24px 32px; background: #f8f9fa; }
        .party h3 { margin: 0 0 8px 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .party p { margin: 2px 0; font-size: 14px; }
        .po-ref { padding: 12px 32px; background: #fff3cd; border-left: 4px solid #f0ad4e; margin: 0 32px; border-radius: 0 4px 4px 0; font-size: 13px; }
        table { width: calc(100% - 64px); margin: 24px 32px; border-collapse: collapse; }
        thead tr { background: #1a1a2e; color: #fff; }
        thead th { padding: 10px 12px; text-align: left; font-size: 13px; font-weight: 500; }
        thead th:last-child, thead th:nth-child(4) { text-align: right; }
        thead th:nth-child(2), thead th:nth-child(3) { text-align: center; }
        tbody tr:nth-child(even) { background: #f8f9fa; }
        .totals { width: 280px; margin: 0 32px 32px auto; }
        .totals table { width: 100%; margin: 0; }
        .totals td { padding: 6px 8px; font-size: 14px; }
        .totals td:last-child { text-align: right; font-weight: bold; }
        .total-row td { border-top: 2px solid #1a1a2e; font-size: 16px; padding-top: 10px; }
        .footer { border-top: 1px solid #eee; padding: 20px 32px; font-size: 12px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>INVOICE</h1>
          <div style="font-size:13px; margin-top:4px; opacity:0.8;">VendorBridge Procurement</div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-number">${invoice.invoice_number}</div>
          <div style="margin-top:6px;">Issue Date: ${issueDate}</div>
          <div>PO Ref: ${invoice.purchase_order.po_number}</div>
          <div style="margin-top:6px; font-size:16px; font-weight:bold;">
            Total: ₹${Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <h3>Billed To (Vendor)</h3>
          <p><strong>${invoice.vendor.company_name}</strong></p>
          <p>GST: ${invoice.vendor.gst_number}</p>
          <p>${invoice.vendor.contact_name}</p>
          <p>${invoice.vendor.contact_email}</p>
          ${invoice.vendor.address ? `<p>${invoice.vendor.address}</p>` : ""}
        </div>
        <div class="party" style="text-align:right;">
          <h3>Generated By</h3>
          <p><strong>${invoice.generator.full_name}</strong></p>
          <p>${invoice.generator.email}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item / Description</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:center;">Unit</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td>Subtotal</td>
            <td>₹${Number(invoice.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td>GST (${invoice.tax_rate}%)</td>
            <td>₹${Number(invoice.tax_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total Amount</strong></td>
            <td><strong>₹${Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </table>
      </div>

      <div class="footer">
        This is a computer-generated invoice. For queries contact your VendorBridge procurement officer.
      </div>
    </body>
    </html>
  `;
}
