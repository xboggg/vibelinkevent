-- CLEAR SAMPLE DATA (prepared 2026-10-25, NOT yet run). VibeLink has no real customers yet, so the 13
-- orders and the other test rows are sample data. Run this whole file once in the Supabase SQL Editor.
--
-- What it does, in ONE transaction (all or nothing):
--   1. Copies every row it will remove into a private backup schema  backup_20261025  (not visible to the public
--      API, because only the "public" schema is exposed).
--   2. Deletes ONLY the rows it just backed up (by id), so anything created after the backup is never touched.
--   3. Stops with an error, changing nothing, if a referral or expense row points at one of these orders.
--
-- Cleared:  orders (+ their revisions, invoices, invoice items), the survey + its response, abandoned_carts,
--           vl_contact_messages, consultation_bookings, referral_codes (NANA-9LI8, KWAM-K7A3).
-- NOT touched: blog posts, testimonials, team members, packages, coupons, payment plans, settings, newsletter
--           subscribers, visitor analytics (page_views), users.
--
-- Supabase may warn "table without RLS" for the backup tables: choose "Run without RLS" / "Run anyway".
-- Those tables sit in a non-exposed schema and the schema is locked below.
--
-- RESTORE (only if you want the sample data back). Run in THIS order:
--   INSERT INTO public.referral_codes        SELECT * FROM backup_20261025.referral_codes;
--   INSERT INTO public.orders                SELECT * FROM backup_20261025.orders;
--   INSERT INTO public.order_revisions       SELECT * FROM backup_20261025.order_revisions;
--   INSERT INTO public.invoices              SELECT * FROM backup_20261025.invoices;
--   INSERT INTO public.invoice_items         SELECT * FROM backup_20261025.invoice_items;
--   INSERT INTO public.surveys               SELECT * FROM backup_20261025.surveys;
--   INSERT INTO public.survey_responses      SELECT * FROM backup_20261025.survey_responses;
--   INSERT INTO public.abandoned_carts       SELECT * FROM backup_20261025.abandoned_carts;
--   INSERT INTO public.vl_contact_messages   SELECT * FROM backup_20261025.vl_contact_messages;
--   INSERT INTO public.consultation_bookings SELECT * FROM backup_20261025.consultation_bookings;
-- When you are sure you do not need the backup (suggest: after 30 days):  DROP SCHEMA backup_20261025 CASCADE;

BEGIN;

CREATE SCHEMA IF NOT EXISTS backup_20261025;
REVOKE ALL ON SCHEMA backup_20261025 FROM PUBLIC, anon, authenticated;

CREATE TABLE backup_20261025.orders                AS SELECT * FROM public.orders;
CREATE TABLE backup_20261025.order_revisions       AS SELECT * FROM public.order_revisions;
CREATE TABLE backup_20261025.invoices              AS SELECT * FROM public.invoices;
CREATE TABLE backup_20261025.invoice_items         AS SELECT * FROM public.invoice_items;
CREATE TABLE backup_20261025.surveys               AS SELECT * FROM public.surveys;
CREATE TABLE backup_20261025.survey_responses      AS SELECT * FROM public.survey_responses;
CREATE TABLE backup_20261025.abandoned_carts       AS SELECT * FROM public.abandoned_carts;
CREATE TABLE backup_20261025.vl_contact_messages   AS SELECT * FROM public.vl_contact_messages;
CREATE TABLE backup_20261025.consultation_bookings AS SELECT * FROM public.consultation_bookings;
CREATE TABLE backup_20261025.referral_codes        AS SELECT * FROM public.referral_codes;

-- Safety check: nothing outside this clean-up may depend on these orders.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.referrals r JOIN backup_20261025.orders b ON b.id = r.order_id) THEN
    RAISE EXCEPTION 'A referral row points at one of these orders - aborting, nothing changed';
  END IF;
  IF EXISTS (SELECT 1 FROM public.expenses e JOIN backup_20261025.orders b ON b.id = e.order_id) THEN
    RAISE EXCEPTION 'An expense row points at one of these orders - aborting, nothing changed';
  END IF;
END $$;

-- Delete only what was backed up, children before parents.
DELETE FROM public.invoices        WHERE id IN (SELECT id FROM backup_20261025.invoices);        -- invoice_items cascade
DELETE FROM public.surveys         WHERE id IN (SELECT id FROM backup_20261025.surveys);         -- survey_responses cascade
DELETE FROM public.orders          WHERE id IN (SELECT id FROM backup_20261025.orders);          -- revisions, timeline, history cascade
DELETE FROM public.abandoned_carts       WHERE id IN (SELECT id FROM backup_20261025.abandoned_carts);
DELETE FROM public.vl_contact_messages   WHERE id IN (SELECT id FROM backup_20261025.vl_contact_messages);
DELETE FROM public.consultation_bookings WHERE id IN (SELECT id FROM backup_20261025.consultation_bookings);
DELETE FROM public.referral_codes        WHERE id IN (SELECT id FROM backup_20261025.referral_codes);

COMMIT;

-- Check (read-only): every number below should be 0 for the cleared tables, and the backup counts should
-- match what was cleared (13 orders, 2 revisions, 2 invoices, 2 invoice items, 1 survey, 1 response,
-- 1 abandoned cart, 2 contact messages, 2 bookings, 2 referral codes).
SELECT 'orders left' AS what, count(*) FROM public.orders
UNION ALL SELECT 'invoices left', count(*) FROM public.invoices
UNION ALL SELECT 'surveys left', count(*) FROM public.surveys
UNION ALL SELECT 'abandoned_carts left', count(*) FROM public.abandoned_carts
UNION ALL SELECT 'contact messages left', count(*) FROM public.vl_contact_messages
UNION ALL SELECT 'bookings left', count(*) FROM public.consultation_bookings
UNION ALL SELECT 'referral codes left', count(*) FROM public.referral_codes
UNION ALL SELECT 'BACKUP orders', count(*) FROM backup_20261025.orders
UNION ALL SELECT 'BACKUP revisions', count(*) FROM backup_20261025.order_revisions
UNION ALL SELECT 'BACKUP invoices', count(*) FROM backup_20261025.invoices
UNION ALL SELECT 'BACKUP referral codes', count(*) FROM backup_20261025.referral_codes;
