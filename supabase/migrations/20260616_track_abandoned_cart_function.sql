-- Fix abandoned_carts 401 on anon upsert.
--
-- Root cause: supabase-js v2 .upsert() requests Prefer: return=representation
-- by default, which makes PostgREST attempt SELECT on the upserted row after
-- writing. The existing SELECT policy on abandoned_carts is restricted to
-- authenticated users, so anon gets 401.
--
-- Loosening SELECT to anon would expose every customer email + cart contents
-- to anyone who hits the REST endpoint with the anon key. Not acceptable.
--
-- Instead: route the upsert through a SECURITY DEFINER function that does the
-- INSERT ... ON CONFLICT UPDATE server-side and returns void. anon never reads
-- the row, never sees emails. The function itself has EXECUTE granted to anon.

CREATE OR REPLACE FUNCTION public.track_abandoned_cart(
  p_session_id TEXT,
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_event_type TEXT,
  p_package_name TEXT,
  p_cart_data JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO abandoned_carts (
    session_id, customer_email, customer_name, event_type, package_name, cart_data, updated_at
  ) VALUES (
    p_session_id, p_customer_email, p_customer_name, p_event_type, p_package_name, p_cart_data, NOW()
  )
  ON CONFLICT (session_id) DO UPDATE SET
    customer_email = EXCLUDED.customer_email,
    customer_name  = EXCLUDED.customer_name,
    event_type     = EXCLUDED.event_type,
    package_name   = EXCLUDED.package_name,
    cart_data      = EXCLUDED.cart_data,
    updated_at     = NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.track_abandoned_cart(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_abandoned_cart(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

COMMENT ON FUNCTION public.track_abandoned_cart IS
  'Anon-callable upsert into abandoned_carts. Used by checkout wizard so anon can track its own cart without needing SELECT permission on the table.';
