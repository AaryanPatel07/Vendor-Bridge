// supabase/functions/run-approval-workflow/index.ts
// Handles approve / reject actions from the approver.
// Validates state transitions, updates approval, triggers cascading status changes.
// The actual cascading (quotation awarded, rfq closed) is done by DB trigger (00002).
// This function handles: validation, the approval update, and the DB trigger does the rest.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify the caller's JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  const supabaseAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);
  if (userError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const role = user.app_metadata?.role;
  if (!["approver", "admin"].includes(role)) {
    return new Response(
      JSON.stringify({ error: "Only approvers and admins can act on approvals" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const { approval_id, action, remarks } = await req.json();

  if (!approval_id || !action) {
    return new Response(
      JSON.stringify({ error: "approval_id and action (approve|reject) are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!["approve", "reject"].includes(action)) {
    return new Response(
      JSON.stringify({ error: "action must be 'approve' or 'reject'" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch the approval and verify state
  const { data: approval, error: fetchError } = await supabase
    .from("approvals")
    .select("*, rfq:rfqs(title, status), quotation:quotations(status)")
    .eq("id", approval_id)
    .single();

  if (fetchError || !approval) {
    return new Response(JSON.stringify({ error: "Approval not found" }), {
      status: 404, headers: { "Content-Type": "application/json" },
    });
  }

  // Guard: only the assigned approver (or admin) can act
  if (role !== "admin" && approval.approver_id !== user.id) {
    return new Response(
      JSON.stringify({ error: "You are not the assigned approver for this request" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Guard: can only act on pending approvals
  if (approval.status !== "pending") {
    return new Response(
      JSON.stringify({ error: `Approval is already ${approval.status}. Cannot act again.` }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  // Guard: RFQ must still be under_review (not already closed/cancelled)
  if (!["published", "under_review"].includes(approval.rfq.status)) {
    return new Response(
      JSON.stringify({ error: `RFQ is ${approval.rfq.status}. Approval can no longer be processed.` }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  // Update the approval — the DB trigger (trg_handle_approval_result) handles the rest:
  // marks quotation as awarded, rejects others, closes the RFQ
  const { data: updated, error: updateError } = await supabase
    .from("approvals")
    .update({
      status: newStatus,
      remarks: remarks ?? null,
      approver_id: user.id,     // in case it wasn't pre-assigned
      acted_at: new Date().toISOString(),
    })
    .eq("id", approval_id)
    .select()
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: "Failed to update approval", detail: updateError }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      approval_id,
      new_status: newStatus,
      message: action === "approve"
        ? "Quotation approved. Purchase Order can now be generated."
        : "Quotation rejected. The quotation is back under review.",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
