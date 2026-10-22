// Customer portal login, step 2: check the 6-digit code and hand back a short-lived session token.
// The token is random, only its SHA-256 hash is stored, and it is useless without the matching email.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;
const SESSION_TTL_HOURS = 2;

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
    const otp = String(body?.otp ?? "").trim();
    if (!email || email.length > 254 || !/^\d{6}$/.test(otp)) {
      return json({ verified: false });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) return json({ error: "server_misconfigured" }, 500);
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Newest unused, unexpired code for this address.
    const { data: row } = await admin
      .from("customer_otps")
      .select("id, code_hash, attempts")
      .eq("email", email)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!row) return json({ verified: false });

    if (row.attempts >= MAX_ATTEMPTS) {
      await admin.from("customer_otps").update({ used: true }).eq("id", row.id);
      return json({ verified: false });
    }
    // Count the attempt before comparing, so a wrong guess always uses one up.
    await admin.from("customer_otps").update({ attempts: row.attempts + 1 }).eq("id", row.id);

    const given = await sha256Hex(`${email}:${otp}:${serviceKey}`);
    if (given !== row.code_hash) return json({ verified: false });

    await admin.from("customer_otps").update({ used: true }).eq("id", row.id);

    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { error: sessErr } = await admin.from("customer_sessions").insert({
      email,
      token_hash: await sha256Hex(token),
      expires_at: new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString(),
    });
    if (sessErr) {
      console.error("session insert failed:", sessErr.message);
      return json({ error: "server_error" }, 500);
    }

    // Name to greet them with: from their newest order, else their referral code.
    const pattern = escapeLike(email);
    let name = "";
    const { data: o } = await admin
      .from("orders").select("client_name").ilike("client_email", pattern)
      .order("created_at", { ascending: false }).limit(1);
    name = o?.[0]?.client_name ?? "";
    if (!name) {
      const { data: r } = await admin
        .from("referral_codes").select("owner_name").ilike("owner_email", pattern).limit(1);
      name = r?.[0]?.owner_name ?? "";
    }

    return json({ verified: true, token, name });
  } catch (e: any) {
    console.error("verify-customer-otp error:", e);
    return json({ error: "server_error" }, 500);
  }
});
