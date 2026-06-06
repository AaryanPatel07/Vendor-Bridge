// supabase/functions/send-rfq-invites/index.ts
// Triggered by the frontend when an RFQ is published (status changes to 'published')
// Sends personalised invitation emails to all assigned vendors via Resend

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://vendorbridge.app";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { rfq_id } = await req.json();
  if (!rfq_id) {
    return new Response(JSON.stringify({ error: "rfq_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use service role to bypass RLS for reading vendor emails
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch the RFQ with its assigned vendors
  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .select(`
      id, title, description, deadline, items,
      rfq_vendor_assignments (
        vendor:vendors (
          id, company_name, contact_email, contact_name
        )
      )
    `)
    .eq("id", rfq_id)
    .eq("status", "published")
    .single();

  if (rfqError || !rfq) {
    return new Response(JSON.stringify({ error: "RFQ not found or not published" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const vendors = rfq.rfq_vendor_assignments.map((a: any) => a.vendor);
  const deadline = new Date(rfq.deadline).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const results = await Promise.allSettled(
    vendors.map((vendor: any) => sendInviteEmail(vendor, rfq, deadline))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return new Response(
    JSON.stringify({ success: true, sent, failed }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

async function sendInviteEmail(vendor: any, rfq: any, deadline: string) {
  const quotationUrl = `${APP_URL}/vendor/rfqs/${rfq.id}/quote`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Request for Quotation — ${rfq.title}</h2>
      <p>Dear ${vendor.contact_name},</p>
      <p>
        You have been invited to submit a quotation for the following procurement request.
        Please review the details and submit your quotation before the deadline.
      </p>
      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        <tr style="background:#f4f4f4;">
          <td style="padding:8px 12px; font-weight:bold;">RFQ Title</td>
          <td style="padding:8px 12px;">${rfq.title}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; font-weight:bold;">Deadline</td>
          <td style="padding:8px 12px; color:#c0392b;">${deadline}</td>
        </tr>
        ${rfq.description ? `
        <tr style="background:#f4f4f4;">
          <td style="padding:8px 12px; font-weight:bold;">Description</td>
          <td style="padding:8px 12px;">${rfq.description}</td>
        </tr>` : ""}
      </table>
      <p><strong>Items Required:</strong></p>
      <ul>
        ${rfq.items.map((item: any) => `
          <li>${item.name} — Qty: ${item.quantity} ${item.unit}</li>
        `).join("")}
      </ul>
      <div style="margin: 24px 0;">
        <a href="${quotationUrl}"
           style="background:#1a1a2e; color:#fff; padding:12px 24px;
                  text-decoration:none; border-radius:6px; font-weight:bold;">
          Submit Your Quotation
        </a>
      </div>
      <p style="color:#666; font-size:13px;">
        This is an automated invitation from VendorBridge.
        If you have questions, contact your procurement officer.
      </p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "VendorBridge <noreply@vendorbridge.app>",
      to: vendor.contact_email,
      subject: `RFQ Invitation: ${rfq.title} — Deadline ${deadline}`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email to ${vendor.contact_email}: ${error}`);
  }
}
