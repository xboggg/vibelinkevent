// Customer portal data: returns ONLY the signed-in customer's own orders.
// Requires the session token from verify-customer-otp. Internal columns (priority, hours,
// payment references, etc.) are deliberately not returned.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORDER_COLUMNS =
  "id, event_title, event_type, event_date, package_name, total_price, order_status, payment_status, created_at, preferred_delivery_date, client_name, client_email, deposit_paid, balance_paid, final_link";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const token = String(body?.token ?? "").trim();
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

    const { data: orders, error } = await admin
      .from("orders")
      .select(ORDER_COLUMNS)
      .ilike("client_email", escapeLike(email))
      .order("created_at", { ascending: false });
    if (error) {
      console.error("orders read failed:", error.message);
      return json({ error: "server_error" }, 500);
    }

    return json({ orders: orders ?? [] });
  } catch (e: any) {
    console.error("customer-orders error:", e);
    return json({ error: "server_error" }, 500);
  }
});
