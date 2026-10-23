-- STEP 2 of 2: APPLIED live 2026-10-24 (pasted into the SQL Editor; verified afterwards). Close public access to referral and revision data.
-- RUN ONLY AFTER: (1) step 1 (20261023090000_...) is applied, (2) the new site (pages calling
-- referral-api / customer-orders) is deployed and tested. Before that the old pages would break.
--
-- Why: referral_codes holds owner emails, names, mobile money numbers and money balances and was
-- readable AND editable by anyone with the public key; order_revisions (customers' messages) was
-- readable and insertable by anyone; submit_revision_request let anyone add a revision to any order
-- they knew the id of. After this, only the server functions (service role) and admins can touch them.
--
-- UNDO (only if something breaks; restores the old open rules):
--   CREATE POLICY "Anyone can create referral codes" ON public.referral_codes FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Anyone can read referral codes" ON public.referral_codes FOR SELECT USING (true);
--   CREATE POLICY "Anyone can update own referral code" ON public.referral_codes FOR UPDATE USING (true);
--   CREATE POLICY "Anyone can create referrals" ON public.referrals FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Anyone can read referrals" ON public.referrals FOR SELECT USING (true);
--   CREATE POLICY "Anyone can create revisions" ON public.order_revisions FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Anyone can read revisions" ON public.order_revisions FOR SELECT USING (true);
--   GRANT EXECUTE ON FUNCTION public.submit_revision_request(uuid, text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can create referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Anyone can read referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Anyone can update own referral code" ON public.referral_codes;

DROP POLICY IF EXISTS "Anyone can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can read referrals" ON public.referrals;

DROP POLICY IF EXISTS "Anyone can create revisions" ON public.order_revisions;
DROP POLICY IF EXISTS "Anyone can read revisions" ON public.order_revisions;

REVOKE EXECUTE ON FUNCTION public.submit_revision_request(uuid, text) FROM PUBLIC, anon, authenticated;
