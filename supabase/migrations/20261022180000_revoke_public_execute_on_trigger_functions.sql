-- Applied live 2026-10-22 as "revoke_public_execute_on_trigger_functions".
-- These three are trigger functions only. Postgres checks EXECUTE when a trigger is created,
-- not when it fires, so the triggers keep working. This only stops visitors calling them
-- directly through /rest/v1/rpc/<name>.
-- Verified after applying: direct call as visitor -> not exposed (404); a visitor page-view insert
-- still fires blog_post_views_bump (201); increment_post_view / insert_order / has_role unaffected.
-- UNDO (only if something breaks):
--   GRANT EXECUTE ON FUNCTION public.blog_post_views_bump() TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION public.blog_posts_view_count_sync() TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.blog_post_views_bump() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.blog_posts_view_count_sync() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
