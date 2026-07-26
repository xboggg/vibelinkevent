-- ============================================================================
-- Blog analytics: real per-post view tracking
-- ============================================================================
-- Root-cause fix for two silent-failure bugs on the admin Blog Analytics tab.
--
-- Bug 1: BlogAnalytics.tsx queries `blog_post_views (post_id, day, view_count)`
--   with a PostgREST embed on blog_posts. That table did not exist -> HTTP 404
--   every load. An earlier fix corrected the frontend column names but never
--   created the underlying table, so the panel silently reads empty instead
--   of erroring loudly.
--
-- Bug 2: blog_posts.view_count had seeded values 20-23 on every post from
--   initial DB setup. Nothing in the codebase ever incremented it, so those
--   numbers were fiction and stayed identical regardless of real traffic.
--
-- Source of truth is `page_views` (populated by usePageTracking on every
-- SPA route change). Blog URLs are /blog/{slug}, so this migration joins on
-- slug to bucket historic page_views into a per-(post, day) aggregate table,
-- then wires a trigger so future visits keep the aggregate live.
--
-- Applied 2026-07-26 via Supabase SQL Editor (first run failed on has_role();
-- fixed to reference user_roles directly, which matches the pattern the
-- rest of the codebase uses).
--
-- Safe to re-run — all DDL is IF NOT EXISTS / DROP IF EXISTS, DML is
-- idempotent via ON CONFLICT.
-- ============================================================================

-- ---------- 1. blog_post_views table --------------------------------------
-- Aggregate row per (post_id, day). PK on (post_id, day) so the trigger
-- and backfill can UPSERT cleanly. Real FK to blog_posts(id) so PostgREST
-- can resolve the ?select=post_id,day,view_count,blog_posts(...) embed.
CREATE TABLE IF NOT EXISTS public.blog_post_views (
  post_id     uuid    NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  day         date    NOT NULL,
  view_count  integer NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, day)
);

-- Defensive: if an earlier partial run created the table WITHOUT updated_at
-- (happened once during initial development), add it now. IF NOT EXISTS
-- makes it a no-op on fresh runs.
ALTER TABLE public.blog_post_views
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS blog_post_views_day_idx
  ON public.blog_post_views (day DESC);

-- RLS: admin-read only. References public.user_roles directly (avoids
-- depending on has_role() which uses an app_role enum type not present
-- in this DB). Anon must not read raw view counts — that's business
-- intelligence.
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_post_views admin read" ON public.blog_post_views;
CREATE POLICY "blog_post_views admin read"
  ON public.blog_post_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Grants — service_role bypasses RLS entirely; authenticated needs SELECT
-- to hit the policy above.
GRANT SELECT ON public.blog_post_views TO authenticated;
GRANT ALL    ON public.blog_post_views TO service_role;

-- ---------- 2. Backfill from page_views -----------------------------------
-- One-time seed. Idempotent via ON CONFLICT — safe to re-run if needed.
-- Matches /blog/{slug} rows in page_views to blog_posts via the slug
-- portion of the path. Excludes non-blog paths.
INSERT INTO public.blog_post_views (post_id, day, view_count)
SELECT
  bp.id                     AS post_id,
  pv.created_at::date       AS day,
  COUNT(*)                  AS view_count
FROM public.page_views pv
JOIN public.blog_posts bp
  ON bp.slug = substring(pv.page_path FROM '^/blog/([^/?#]+)')
WHERE pv.page_path LIKE '/blog/%'
GROUP BY bp.id, pv.created_at::date
ON CONFLICT (post_id, day) DO UPDATE
  SET view_count = EXCLUDED.view_count,
      updated_at = now();

-- ---------- 3. Trigger: keep blog_post_views live -------------------------
-- Fires on every INSERT into page_views. If the path is /blog/{slug} and
-- matches a real post, increments that (post_id, day) bucket by 1. Silent
-- no-op for non-blog paths so page_views inserts stay fast.
CREATE OR REPLACE FUNCTION public.blog_post_views_bump()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug text;
  v_post_id uuid;
BEGIN
  IF NEW.page_path IS NULL OR NEW.page_path NOT LIKE '/blog/%' THEN
    RETURN NEW;
  END IF;

  v_slug := substring(NEW.page_path FROM '^/blog/([^/?#]+)');
  IF v_slug IS NULL OR v_slug = '' THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_post_id FROM public.blog_posts WHERE slug = v_slug LIMIT 1;
  IF v_post_id IS NULL THEN
    -- URL points at a non-existent post — ignore silently.
    RETURN NEW;
  END IF;

  INSERT INTO public.blog_post_views (post_id, day, view_count)
  VALUES (v_post_id, NEW.created_at::date, 1)
  ON CONFLICT (post_id, day) DO UPDATE
    SET view_count = public.blog_post_views.view_count + 1,
        updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_post_views_bump_trg ON public.page_views;
CREATE TRIGGER blog_post_views_bump_trg
AFTER INSERT ON public.page_views
FOR EACH ROW EXECUTE FUNCTION public.blog_post_views_bump();

-- ---------- 4. Fix blog_posts.view_count ----------------------------------
-- Backfill to reflect real totals (was seeded 20-23 on every post from
-- initial DB setup with no incrementer wired in).
UPDATE public.blog_posts bp
SET view_count = COALESCE(sub.total, 0)
FROM (
  SELECT post_id, SUM(view_count) AS total
  FROM public.blog_post_views
  GROUP BY post_id
) sub
WHERE bp.id = sub.post_id;

-- Reset any post with no matching /blog/{slug} views to 0 (was leftover seed).
UPDATE public.blog_posts
SET view_count = 0
WHERE view_count > 0
  AND id NOT IN (SELECT post_id FROM public.blog_post_views);

-- Trigger to keep blog_posts.view_count in sync with blog_post_views. Runs
-- after row change. Cleaner than adding logic to the page_views trigger —
-- this way any manual edits to blog_post_views also flow through.
CREATE OR REPLACE FUNCTION public.blog_posts_view_count_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id uuid;
BEGIN
  v_post_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.blog_posts
  SET view_count = (
    SELECT COALESCE(SUM(view_count), 0)
    FROM public.blog_post_views
    WHERE post_id = v_post_id
  )
  WHERE id = v_post_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_view_count_sync_trg ON public.blog_post_views;
CREATE TRIGGER blog_posts_view_count_sync_trg
AFTER INSERT OR UPDATE OR DELETE ON public.blog_post_views
FOR EACH ROW EXECUTE FUNCTION public.blog_posts_view_count_sync();

-- ---------- 5. Sanity ------------------------------------------------------
DO $$
DECLARE
  v_rows_backfilled int;
  v_posts_with_views int;
BEGIN
  SELECT COUNT(*) INTO v_rows_backfilled FROM public.blog_post_views;
  SELECT COUNT(*) INTO v_posts_with_views FROM public.blog_posts WHERE view_count > 0;
  RAISE NOTICE 'blog_post_views rows: %', v_rows_backfilled;
  RAISE NOTICE 'blog_posts with view_count > 0: %', v_posts_with_views;
END $$;
