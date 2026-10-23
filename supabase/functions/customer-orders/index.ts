// Customer portal data. Every action needs the session token from verify-customer-otp and
// only ever touches orders whose client_email matches the verified email.
// Internal columns (priority, hours, payment references, etc.) are deliberately not returned.
//
// Actions (POST JSON { email, token, action?, ... }):
//   (none) / "orders"  -> { orders }                       the customer's own orders
//   "revisions"        { order_id }          -> { revisions }  revision requests for one of their orders
//   "submit_revision"  { order_id, text }    -> { ok }         same effect as the old submit_revision_request
//                                                              RPC (insert request + order_status = 'revision'),
//                                                              but now checks ownership and order status
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORDER_COLUMNS =
  "id, event_title, event_type, event_date, package_name, total_price, order_status, payment_status, created_at, preferred_delivery_date, client_name, client_email, deposit_paid, balance_paid, final_link";
const REVISION_COLUMNS = "id, order_id, request_text, status, admin_response, created_at, updated_at";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Same rule the page already applies (RevisionRequest.canRequestRevision)
const REVISION_ALLOWED_STATUSES = ["draft_ready", "revision"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const token = String(body?.token ?? "").trim();
    const action = String(body?.action ?? "orders");
    if (!email || !/^[0-9a-f]{64}$/.test(token)) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) return json({ error: "server_misconfigured" }, 500);
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: session } = await admin
      .from("customer_sessions")
      .select("id")
      .eq("token_hash", await sha256Hex(token))
      .eq("email", email)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (!session) return json({ error: "unauthorized" }, 401);

    const pattern = escapeLike(email);

    if (action === "orders") {
      const { data: orders, error } = await admin
        .from("orders")
        .select(ORDER_COLUMNS)
        .ilike("client_email", pattern)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("orders read failed:", error.message);
        return json({ error: "server_error" }, 500);
      }
      return json({ orders: orders ?? [] });
    }

    if (action === "revisions" || action === "submit_revision") {
      const orderId = String(body?.order_id ?? "").trim();
      if (!UUID_RE.test(orderId)) return json({ error: "invalid_order" }, 400);

      // The order must belong to the verified email.
      const { data: order } = await admin
        .from("orders")
        .select("id, order_status")
        .eq("id", orderId)
        .ilike("client_email", pattern)
        .maybeSingle();
      if (!order) return json({ error: "not_found" }, 404);

      if (action === "revisions") {
        const { data: revisions, error } = await admin
          .from("order_revisions")
          .select(REVISION_COLUMNS)
          .eq("order_id", orderId)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("revisions read failed:", error.message);
          return json({ error: "server_error" }, 500);
        }
        return json({ revisions: revisions ?? [] });
      }

      // submit_revision
      const text = String(body?.text ?? "").trim();
      if (text.length < 10 || text.length > 2000) return json({ error: "invalid_text" }, 400);
      if (!REVISION_ALLOWED_STATUSES.includes(order.order_status)) return json({ error: "not_allowed_now" }, 409);

      try {
        const { data: ok, error: rlErr } = await admin.rpc("check_rate_limit", {
          p_function_name: "customer-orders:submit_revision",
          p_client_ip: clientIp(req),
          p_max_requests: 10,
          p_window_minutes: 60,
        });
        if (!rlErr && ok === false) return json({ error: "too_many_requests" }, 429);
      } catch { /* fail open like the other functions */ }

      const { error: insErr } = await admin
        .from("order_revisions")
        .insert({ order_id: orderId, request_text: text, status: "pending" });
      if (insErr) {
        console.error("revision insert failed:", insErr.message);
        return json({ error: "server_error" }, 500);
      }
      const { error: updErr } = await admin
        .from("orders")
        .update({ order_status: "revision", updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (updErr) console.error("order status update failed:", updErr.message);
      return json({ ok: true });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e: any) {
    console.error("customer-orders error:", e);
    return json({ error: "server_error" }, 500);
  }
});
