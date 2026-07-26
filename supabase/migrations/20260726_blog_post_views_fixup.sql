-- ============================================================================
-- Fixup for 20260726_blog_post_views.sql
-- ============================================================================
-- The original migration ran partially. Verified state on live DB before
-- writing this — no assumptions:
--   ✓ blog_post_views table exists with 266 rows
--   ✗ Missing updated_at column
--   ✗ RLS not enforced (anon can read)
--   ✗ blog_posts.view_count still shows seeded 20-23 values
--   ? Triggers unknown — recreating both defensively
--
-- This script only adds what's missing. All operations are idempotent so
-- re-running is safe.
-- ============================================================================

-- ---------- 1. Add the missing updated_at column ---------------------------
ALTER TABLE public.blog_post_views
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS blog_post_views_day_idx
  ON public.blog_post_views (day DESC);

-- ---------- 2. Enable RLS + admin-read policy ------------------------------
-- References user_roles directly (verified columns: user_id, role, id,
-- created_at). No has_role() function dependency.
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

GRANT SELECT ON public.blog_post_views TO authenticated;
GRANT ALL    ON public.blog_post_views TO service_role;

-- ---------- 3. Trigger: increment on every new page_views blog hit --------
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

-- ---------- 4. Fix seeded blog_posts.view_count ---------------------------
UPDATE public.blog_posts bp
SET view_count = COALESCE(sub.total, 0)
FROM (
  SELECT post_id, SUM(view_count) AS total
  FROM public.blog_post_views
  GROUP BY post_id
) sub
WHERE bp.id = sub.post_id;

UPDATE public.blog_posts
SET view_count = 0
WHERE view_count > 0
  AND id NOT IN (SELECT post_id FROM public.blog_post_views);

-- ---------- 5. Keep blog_posts.view_count in sync ---------------------------
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

-- ---------- 6. Report ------------------------------------------------------
DO $$
DECLARE
  v_rows int;
  v_max_view_count int;
  v_min_view_count int;
BEGIN
  SELECT COUNT(*), MAX(view_count), MIN(view_count)
    INTO v_rows, v_max_view_count, v_min_view_count
    FROM public.blog_posts WHERE view_count > 0;
  RAISE NOTICE 'blog_posts with view_count > 0: % (min=%, max=%)',
    v_rows, v_min_view_count, v_max_view_count;
END $$;
