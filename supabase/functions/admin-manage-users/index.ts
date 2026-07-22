// Admin-only user operations that require service_role.
// The caller's JWT is verified as admin BEFORE any privileged action runs.
//
// Actions:
//   - delete_user       { target_user_id }
//   - update_metadata   { target_user_id, full_name }
//   - send_password_reset { target_email }
//
// Guardrails:
//   - Caller must have user_roles.role='admin'
//   - Caller cannot delete themselves
//   - Caller cannot demote themselves if they're the only admin
//   - Deleting a user cascades role removal first (belt & suspenders — RLS on user_roles allows it via admin)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  action: "delete_user" | "update_metadata" | "send_password_reset";
  target_user_id?: string;
  target_email?: string;
  full_name?: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceKey) {
    return json({ error: "server_misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "missing_auth" }, 401);
  }
  const jwt = authHeader.slice(7);

  // Use service-role client for BOTH identifying the caller and admin operations.
  // Verifying the JWT via admin.getUser(jwt) bypasses the anon-key/JWT-signing
  // mismatch that .auth.getUser() was hitting.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Identify caller by validating the JWT with service role
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    console.error("JWT validation failed:", userErr?.message);
    return json({ error: "invalid_session", detail: userErr?.message }, 401);
  }
  const caller = userData.user;

  // 2. Confirm caller is admin (using same service-role client)
  const { data: role } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) return json({ error: "not_admin" }, 403);

  // 3. Route action
  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const { action, target_user_id, target_email, full_name } = payload;

  try {
    if (action === "delete_user") {
      if (!target_user_id) return json({ error: "missing_target_user_id" }, 400);
      if (target_user_id === caller.id) return json({ error: "cannot_delete_self" }, 400);

      // If target is admin, ensure at least one other admin remains
      const { data: targetRole } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", target_user_id)
        .eq("role", "admin")
        .maybeSingle();
      if (targetRole) {
        const { count } = await admin
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");
        if ((count ?? 0) <= 1) {
          return json({ error: "cannot_delete_only_admin" }, 400);
        }
      }

      // Delete role rows first (belt & suspenders — FK cascade should handle it, but explicit is safer)
      await admin.from("user_roles").delete().eq("user_id", target_user_id);

      const { error: delErr } = await admin.auth.admin.deleteUser(target_user_id);
      if (delErr) return json({ error: "delete_failed", detail: delErr.message }, 500);

      return json({ ok: true, action: "deleted", target_user_id });
    }

    if (action === "update_metadata") {
      if (!target_user_id) return json({ error: "missing_target_user_id" }, 400);
      if (typeof full_name !== "string") return json({ error: "missing_full_name" }, 400);
      if (full_name.length > 120) return json({ error: "name_too_long" }, 400);
      const trimmed = full_name.trim();

      // Update BOTH storage locations so admin UI (reads profiles.full_name)
      // and auth token claims (reads user_metadata.full_name) stay in sync.
      const { data: existing } = await admin.auth.admin.getUserById(target_user_id);
      const existingMeta = (existing?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const merged = { ...existingMeta, full_name: trimmed };

      const { error: upErr } = await admin.auth.admin.updateUserById(target_user_id, {
        user_metadata: merged,
      });
      if (upErr) return json({ error: "update_failed", detail: upErr.message }, 500);

      // profiles.id references auth.users.id (1:1). Upsert so it works even if
      // the profile row doesn't exist yet.
      const { error: profErr } = await admin
        .from("profiles")
        .upsert({ id: target_user_id, full_name: trimmed }, { onConflict: "id" });
      if (profErr) {
        console.error("Profile upsert failed:", profErr.message);
        // Don't hard-fail — auth metadata was updated, profile is best-effort
      }

      return json({ ok: true, action: "updated_metadata", target_user_id, full_name: trimmed });
    }

    if (action === "send_password_reset") {
      if (!target_email) return json({ error: "missing_target_email" }, 400);

      // Uses Supabase's built-in password-recovery flow — sends email via the project's SMTP settings
      const { error: resetErr } = await admin.auth.resetPasswordForEmail(target_email, {
        redirectTo: "https://vibelinkevent.com/admin/reset-password",
      });
      if (resetErr) return json({ error: "reset_failed", detail: resetErr.message }, 500);

      return json({ ok: true, action: "password_reset_sent", target_email });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e: any) {
    console.error("admin-manage-users error:", e);
    return json({ error: "server_error", detail: e?.message?.slice(0, 200) }, 500);
  }
});
