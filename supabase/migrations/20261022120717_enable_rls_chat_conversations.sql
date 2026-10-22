-- Applied live 2026-10-22 (Supabase advisor: rls_disabled_in_public on chat_conversations).
-- The customer-chat edge function writes with the service-role key, which bypasses RLS,
-- so visitors need no direct access. Only signed-in admins can read/edit/delete rows
-- (the table holds visitor emails).
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- A visitor-insert policy ("chat_conversations public insert") was created by this migration
-- and then dropped the same day in the Supabase dashboard because nothing needs it:
--   DROP POLICY IF EXISTS "chat_conversations public insert" ON public.chat_conversations;

CREATE POLICY "chat_conversations admin all" ON public.chat_conversations
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
