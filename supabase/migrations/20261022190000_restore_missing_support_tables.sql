-- APPLIED live 2026-10-22 (pasted into the Supabase SQL Editor by Edmund; verified afterwards). Restores tables that the repo's old migrations define
-- but the live database lacks (verified 2026-10-22): rate_limit_logs + check_rate_limit(),
-- user_totp_secrets, payment_history, payment_reminder_logs, security_audit_log.
-- Differences from the old migrations, on purpose:
--   * payment_history: the old "anyone can insert" policy is NOT recreated (visitors could forge payments).
--   * payment_reminder_logs: admin SELECT only (matches the final state of the old migrations).
--   * check_rate_limit / cleanup_rate_limit_logs: EXECUTE revoked from visitors (only edge functions,
--     which use the service role, may call them) so nobody can fill the log or lock others out.
-- Left out: order_installments and saved_designs (old rules there are open to everyone).
-- Effect once applied: the 5 email functions start rate limiting (5 requests/hour per visitor IP per function),
-- 2-step login (totp-manage) and payment history start working.

-- 1. Rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_ip text NOT NULL,
  function_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_lookup ON public.rate_limit_logs (client_ip, function_name, created_at DESC);
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON public.rate_limit_logs;
CREATE POLICY "Service role only" ON public.rate_limit_logs FOR ALL USING (false);
REVOKE ALL ON public.rate_limit_logs FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_function_name text, p_client_ip text, p_max_requests integer, p_window_minutes integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  request_count integer;
  window_start timestamptz;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  SELECT COUNT(*) INTO request_count FROM public.rate_limit_logs
   WHERE client_ip = p_client_ip AND function_name = p_function_name AND created_at >= window_start;
  IF request_count < p_max_requests THEN
    INSERT INTO public.rate_limit_logs (client_ip, function_name) VALUES (p_client_ip, p_function_name);
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.rate_limit_logs WHERE created_at < now() - interval '24 hours';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_logs() FROM PUBLIC, anon, authenticated;

-- 2. Admin 2-step login secrets (totp-manage)
CREATE TABLE IF NOT EXISTS public.user_totp_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_secret text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  backup_codes text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE public.user_totp_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own TOTP settings" ON public.user_totp_secrets;
CREATE POLICY "Users can view own TOTP settings" ON public.user_totp_secrets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own TOTP settings" ON public.user_totp_secrets;
CREATE POLICY "Users can insert own TOTP settings" ON public.user_totp_secrets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own TOTP settings" ON public.user_totp_secrets;
CREATE POLICY "Users can update own TOTP settings" ON public.user_totp_secrets FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own TOTP settings" ON public.user_totp_secrets;
CREATE POLICY "Users can delete own TOTP settings" ON public.user_totp_secrets FOR DELETE USING (auth.uid() = user_id);
REVOKE ALL ON public.user_totp_secrets FROM anon;
DROP TRIGGER IF EXISTS update_user_totp_secrets_updated_at ON public.user_totp_secrets;
CREATE TRIGGER update_user_totp_secrets_updated_at BEFORE UPDATE ON public.user_totp_secrets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Payment history
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('deposit', 'balance')),
  payment_method text NOT NULL CHECK (payment_method IN ('paystack', 'bank_transfer', 'cash', 'mobile_money', 'other')),
  amount numeric NOT NULL,
  reference text,
  recorded_by text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;
CREATE POLICY "Admins can view all payment history" ON public.payment_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert payment history" ON public.payment_history;
CREATE POLICY "Admins can insert payment history" ON public.payment_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
REVOKE ALL ON public.payment_history FROM anon;
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON public.payment_history (order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history (created_at DESC);

-- 4. Payment reminder log
CREATE TABLE IF NOT EXISTS public.payment_reminder_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reminder_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  recipient_email text NOT NULL,
  success boolean NOT NULL DEFAULT true,
  error_message text
);
ALTER TABLE public.payment_reminder_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view reminder logs" ON public.payment_reminder_logs;
CREATE POLICY "Admins can view reminder logs" ON public.payment_reminder_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
REVOKE ALL ON public.payment_reminder_logs FROM anon;
CREATE INDEX IF NOT EXISTS idx_reminder_logs_order_type ON public.payment_reminder_logs (order_id, reminder_type);

-- 5. Security audit log
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  user_id uuid,
  ip_address text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Only admins can view audit logs" ON public.security_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
REVOKE ALL ON public.security_audit_log FROM anon;
CREATE INDEX IF NOT EXISTS idx_security_audit_created ON public.security_audit_log (created_at DESC);
