// Pinned to the version the other functions already import, so the Deno
// cache is shared and behaviour stays consistent across functions.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * Verify that the caller is a signed-in admin.
 *
 * Several functions send email to a caller-supplied address. Rate limiting
 * alone does not protect those: the anon key ships in the public JS bundle,
 * so anyone can replay a request and have VibeLink email arbitrary people.
 * That is a deliverability and brand risk, not just a nuisance — a domain
 * reported for spam stops delivering real order mail.
 *
 * Returns null when the caller is a verified admin, or a ready-to-return
 * Response (401/403) when they are not.
 *
 * The JWT is verified with the SERVICE-ROLE client rather than an anon
 * client: passing the caller's Authorization header to an anon client hits
 * a JWT-signing mismatch and rejects valid sessions.
 */
export async function requireAdmin(
  req: Request,
  supabase: SupabaseClient,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const json = { ...corsHeaders, "Content-Type": "application/json" };

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: json,
    });
  }

  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  const { data, error } = await supabase.auth.getUser(jwt);
  const user = data?.user;
  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: json,
    });
  }

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !role) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: json,
    });
  }

  return null;
}

/** Build a service-role client. Never expose this key to a caller. */
export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
