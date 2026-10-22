-- Applied live 2026-10-22 (Supabase advisor: function_search_path_mutable, 7 functions).
-- Behaviour unchanged: every body either uses only built-ins or names its tables explicitly.
ALTER FUNCTION public.validate_coupon_type() SET search_path = public;
ALTER FUNCTION public.validate_referral_status() SET search_path = public;
ALTER FUNCTION public.increment_post_view(text) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.calculate_order_priority() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
