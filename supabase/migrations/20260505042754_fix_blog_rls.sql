-- Fix blog_posts RLS to allow public reads of published posts
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;

CREATE POLICY "Anyone can read published blog posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (published = true);
