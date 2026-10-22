// Customer portal login, step 1: email a 6-digit code.
// Tables customer_otps / customer_sessions are service-role only (RLS on, no policies).
// A code is only emailed if the address has an order or a referral code; the caller is
// never told which (response is identical either way), so this cannot be used to probe emails.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CODE_TTL_MINUTES = 10;
const MAX_SENDS_PER_HOUR = 3;

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
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "invalid_email" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) return json({ error: "server_misconfigured" }, 500);
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Housekeeping: drop old codes and expired sessions.
    await admin.from("customer_otps").delete().lt("expires_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());
    await admin.from("customer_sessions").delete().lt("expires_at", new Date().toISOString());

    // Rate limit: at most MAX_SENDS_PER_HOUR codes per address per hour.
    const since = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count: recent } = await admin
      .from("customer_otps")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since);
    if ((recent ?? 0) >= MAX_SENDS_PER_HOUR) return json({ error: "too_many_requests" }, 429);

    // Eligible = has at least one order or a referral code.
    const pattern = escapeLike(email);
    const { data: orderRows } = await admin
      .from("orders").select("id").ilike("client_email", pattern).limit(1);
    let eligible = (orderRows?.length ?? 0) > 0;
    if (!eligible) {
      const { data: refRows } = await admin
        .from("referral_codes").select("id").ilike("owner_email", pattern).limit(1);
      eligible = (refRows?.length ?? 0) > 0;
    }

    if (eligible) {
      const rnd = new Uint32Array(1);
      crypto.getRandomValues(rnd);
      const code = String(rnd[0] % 1000000).padStart(6, "0");
      const codeHash = await sha256Hex(`${email}:${code}:${serviceKey}`);

      const { data: inserted, error: insErr } = await admin
        .from("customer_otps")
        .insert({
          email,
          code_hash: codeHash,
          expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
        })
        .select("id")
        .single();
      if (insErr) {
        console.error("otp insert failed:", insErr.message);
        return json({ error: "server_error" }, 500);
      }

      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:Segoe UI,Tahoma,Arial,sans-serif;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#1a1a2e;padding:24px;text-align:center;color:#ffffff;font-size:22px;font-weight:bold;">VibeLink <span style="color:#f5a623;">Event</span></td></tr>
<tr><td style="padding:32px 28px;color:#333;font-size:16px;line-height:1.6;">
<p style="margin:0 0 16px;">Your code to open My Orders:</p>
<p style="margin:0 0 20px;text-align:center;font-size:34px;letter-spacing:8px;font-weight:bold;color:#1a1a2e;">${code}</p>
<p style="margin:0 0 8px;">It works for ${CODE_TTL_MINUTES} minutes. If you did not ask for it, you can ignore this email.</p>
</td></tr></table></td></tr></table></body></html>`;

      const { error: mailErr } = await resend.emails.send({
        from: "VibeLink Event <hello@vibelinkevent.com>",
        to: [email],
        subject: "Your VibeLink code",
        html,
      });
      if (mailErr) {
        console.error("otp email failed:", JSON.stringify(mailErr));
        await admin.from("customer_otps").delete().eq("id", inserted.id);
        return json({ error: "send_failed" }, 500);
      }
    }

    return json({ ok: true });
  } catch (e: any) {
    console.error("send-customer-otp error:", e);
    return json({ error: "server_error" }, 500);
  }
});
