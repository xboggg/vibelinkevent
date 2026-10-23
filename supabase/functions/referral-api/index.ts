// Referral program server side. Replaces direct browser access to referral_codes / referrals,
// which exposed owner emails, mobile money numbers and balances to anyone.
//
// Actions (POST JSON { action, ... }):
//   validate_code    { code }                          -> { valid, referrer_name }      (first name only)
//   record_referral  { code, order_id, referred_email } -> { recorded } (server re-checks the order)
//   create_code      { name, email }                   -> { created }  (code is shown only after email login)
//   dashboard        { email, token, name? }           -> { code, referrals }  (needs a portal login token)
//   save_momo        { email, token, momo }            -> { ok }               (needs a portal login token)
//
// The portal login token comes from verify-customer-otp (table customer_sessions, stored hashed).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Must match REFERRAL_REWARDS in src/components/admin/ReferralsAdmin.tsx
const REWARDS: Record<string, number> = {
  "Regular Birthday": 100,
  "Graduation": 100,
  "Naming / Outdooring": 100,
  "Anniversary / Vow Renewal": 200,
  "Milestone Birthday": 200,
  "Church Event": 200,
  "Engagement / Customary": 200,
  "Funeral & Memorial": 200,
  "Wedding": 300,
  "Corporate Event": 300,
  "Bespoke": 500,
};

const CODE_RE = /^[A-Z0-9-]{3,24}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORDER_CLAIM_WINDOW_HOURS = 24;

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

// Same fail-open pattern as the other functions: if the limiter is unavailable, allow.
async function allowed(admin: any, fn: string, ip: string, max: number): Promise<boolean> {
  try {
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_function_name: fn,
      p_client_ip: ip,
      p_max_requests: max,
      p_window_minutes: 60,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}

function maskEmail(email: string | null): string {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}

function firstName(name: string | null): string {
  return (name ?? "").trim().split(/\s+/)[0]?.slice(0, 30) ?? "";
}

async function validSession(admin: any, email: string, token: string): Promise<boolean> {
  if (!email || !/^[0-9a-f]{64}$/.test(token)) return false;
  const { data } = await admin
    .from("customer_sessions")
    .select("id")
    .eq("token_hash", await sha256Hex(token))
    .eq("email", email)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return !!data;
}

function newCode(name: string): string {
  const prefix = (name.split(/\s+/)[0] ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "VIBE";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from(bytes).map((b) => alphabet[b % alphabet.length]).join("");
  return `${prefix}-${suffix}`;
}

async function ensureCode(admin: any, email: string, name: string): Promise<{ created: boolean; ok: boolean }> {
  const { data: existing } = await admin
    .from("referral_codes").select("id").ilike("owner_email", escapeLike(email)).limit(1);
  if (existing && existing.length > 0) return { created: false, ok: true };
  for (let i = 0; i < 6; i++) {
    const { error } = await admin.from("referral_codes").insert({
      code: newCode(name),
      owner_email: email,
      owner_name: name,
      reward_percentage: 10,
    });
    if (!error) return { created: true, ok: true };
    if (error.code !== "23505") {
      console.error("referral code insert failed:", error.message);
      return { created: false, ok: false };
    }
  }
  return { created: false, ok: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) return json({ error: "server_misconfigured" }, 500);
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const ip = clientIp(req);

    // ---- validate_code -------------------------------------------------------------
    if (action === "validate_code") {
      if (!(await allowed(admin, "referral-api:validate_code", ip, 60))) return json({ error: "too_many_requests" }, 429);
      const code = String(body?.code ?? "").trim().toUpperCase();
      if (!CODE_RE.test(code)) return json({ valid: false });
      const { data } = await admin
        .from("referral_codes").select("owner_name, is_active").eq("code", code).maybeSingle();
      if (!data || data.is_active === false) return json({ valid: false });
      return json({ valid: true, referrer_name: firstName(data.owner_name) });
    }

    // ---- record_referral -----------------------------------------------------------
    if (action === "record_referral") {
      if (!(await allowed(admin, "referral-api:record_referral", ip, 20))) return json({ error: "too_many_requests" }, 429);
      const code = String(body?.code ?? "").trim().toUpperCase();
      const orderId = String(body?.order_id ?? "").trim();
      const referredEmail = String(body?.referred_email ?? "").trim().toLowerCase();
      if (!CODE_RE.test(code) || !UUID_RE.test(orderId) || !EMAIL_RE.test(referredEmail)) {
        return json({ recorded: false, reason: "invalid_input" });
      }

      const { data: order } = await admin
        .from("orders")
        .select("id, client_email, package_name, created_at, referral_code")
        .eq("id", orderId)
        .maybeSingle();
      if (!order) return json({ recorded: false, reason: "order_not_found" });
      if ((order.client_email ?? "").toLowerCase() !== referredEmail) return json({ recorded: false, reason: "email_mismatch" });
      if ((order.referral_code ?? "").toUpperCase() !== code) return json({ recorded: false, reason: "code_mismatch" });
      const ageHours = (Date.now() - new Date(order.created_at).getTime()) / 3600000;
      if (ageHours > ORDER_CLAIM_WINDOW_HOURS) return json({ recorded: false, reason: "order_too_old" });

      const { data: codeRow } = await admin
        .from("referral_codes").select("owner_email, is_active").eq("code", code).maybeSingle();
      if (!codeRow || codeRow.is_active === false) return json({ recorded: false, reason: "invalid_code" });
      if ((codeRow.owner_email ?? "").toLowerCase() === referredEmail) return json({ recorded: false, reason: "self_referral" });

      const { data: dup } = await admin.from("referrals").select("id").eq("order_id", orderId).limit(1);
      if (dup && dup.length > 0) return json({ recorded: false, reason: "duplicate" });

      const packageName = order.package_name ?? "";
      const { error: insErr } = await admin.from("referrals").insert({
        referrer_email: codeRow.owner_email,
        referred_email: referredEmail,
        referral_code: code,
        order_id: orderId,
        status: "pending",
        reward_amount: REWARDS[packageName] ?? 0,
        package_name: packageName,
      });
      if (insErr) {
        console.error("referral insert failed:", insErr.message);
        return json({ recorded: false, reason: "server_error" }, 500);
      }
      const { error: bumpErr } = await admin.rpc("increment_referral_stats", { p_code: code });
      if (bumpErr) console.error("referral stats bump failed:", bumpErr.message);
      return json({ recorded: true });
    }

    // ---- create_code ---------------------------------------------------------------
    if (action === "create_code") {
      if (!(await allowed(admin, "referral-api:create_code", ip, 5))) return json({ error: "too_many_requests" }, 429);
      const email = String(body?.email ?? "").trim().toLowerCase();
      const name = String(body?.name ?? "").trim();
      if (!EMAIL_RE.test(email) || email.length > 254 || name.length < 2 || name.length > 80) {
        return json({ error: "invalid_input" }, 400);
      }
      const res = await ensureCode(admin, email, name);
      if (!res.ok) return json({ error: "server_error" }, 500);
      return json({ created: res.created });
    }

    // ---- dashboard / save_momo (need a portal login) ---------------------------------
    if (action === "dashboard" || action === "save_momo") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      const token = String(body?.token ?? "").trim();
      if (!(await validSession(admin, email, token))) return json({ error: "unauthorized" }, 401);
      const pattern = escapeLike(email);

      if (action === "save_momo") {
        const momo = String(body?.momo ?? "").trim();
        if (!/^[0-9+\s-]{9,16}$/.test(momo)) return json({ error: "invalid_momo" }, 400);
        const { data: updated, error } = await admin
          .from("referral_codes")
          .update({ owner_momo_number: momo })
          .ilike("owner_email", pattern)
          .select("id");
        if (error) {
          console.error("momo update failed:", error.message);
          return json({ error: "server_error" }, 500);
        }
        if (!updated || updated.length === 0) return json({ error: "no_code" }, 404);
        return json({ ok: true });
      }

      // dashboard: make sure a code exists (same behaviour as before), then return it
      const name = String(body?.name ?? "").trim().slice(0, 80) || email.split("@")[0];
      const ensured = await ensureCode(admin, email, name);
      if (!ensured.ok) return json({ error: "server_error" }, 500);

      const { data: codeRow } = await admin
        .from("referral_codes")
        .select("code, owner_momo_number, total_referrals, successful_referrals, pending_referrals, total_earnings, available_balance")
        .ilike("owner_email", pattern)
        .limit(1)
        .maybeSingle();
      const { data: refs } = await admin
        .from("referrals")
        .select("id, referred_email, status, reward_amount, created_at, completed_at")
        .ilike("referrer_email", pattern)
        .order("created_at", { ascending: false });

      return json({
        code: codeRow ?? null,
        referrals: (refs ?? []).map((r: any) => ({ ...r, referred_email: maskEmail(r.referred_email) })),
      });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e: any) {
    console.error("referral-api error:", e);
    return json({ error: "server_error" }, 500);
  }
});
