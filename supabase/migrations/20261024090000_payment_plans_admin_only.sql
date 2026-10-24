-- APPLIED live 2026-10-24 (pasted into the SQL Editor; verified: only "Admins can manage plans" + "Public can read active plans" remain). Make payment_plans editable by admins only.
-- Visitors keep read access to active plans ("Public can read active plans" is untouched).
-- Checked: the only code that reads this table is components/payment/InstallmentPayments.tsx,
-- which no page uses, so nothing can break.
-- UNDO (only if something breaks):
--   DROP POLICY IF EXISTS "Admins can manage plans" ON public.payment_plans;
--   CREATE POLICY "Authenticated can manage plans" ON public.payment_plans FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated can manage plans" ON public.payment_plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.payment_plans;
CREATE POLICY "Admins can manage plans" ON public.payment_plans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
