-- STEP 1 of 2 (additive only; nothing is removed here, so nothing can break).
-- 1. Admin-only access rules, so the admin panel keeps working after step 2 removes the public rules.
-- 2. Atomic referral counter used by the new referral-api edge function (server only).
-- 3. Nightly cleanup of the rate-limit log (pg_cron).
-- Step 2 (20261023100000_close_public_referral_revision_access.sql) closes the public access
-- AFTER the new server functions and pages are live and tested.

-- 1. Admin access (has_role(uuid, text) already exists)
DROP POLICY IF EXISTS "Admins can view referral codes" ON public.referral_codes;
CREATE POLICY "Admins can view referral codes" ON public.referral_codes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update referral codes" ON public.referral_codes;
CREATE POLICY "Admins can update referral codes" ON public.referral_codes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view referrals" ON public.referrals;
CREATE POLICY "Admins can view referrals" ON public.referrals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view revisions" ON public.order_revisions;
CREATE POLICY "Admins can view revisions" ON public.order_revisions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Atomic stats bump (replaces the broken client-side supabase.rpc("increment_field") call)
CREATE OR REPLACE FUNCTION public.increment_referral_stats(p_code text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.referral_codes
     SET total_referrals = COALESCE(total_referrals, 0) + 1,
         pending_referrals = COALESCE(pending_referrals, 0) + 1
   WHERE code = upper(p_code);
$$;
REVOKE EXECUTE ON FUNCTION public.increment_referral_stats(text) FROM PUBLIC, anon, authenticated;

-- 3. Nightly cleanup of rate_limit_logs at 03:17 UTC
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
SELECT cron.schedule('cleanup-rate-limit-logs', '17 3 * * *', 'select public.cleanup_rate_limit_logs()');
