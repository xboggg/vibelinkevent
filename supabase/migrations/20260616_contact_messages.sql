-- Website contact-form messages.
-- Dedicated table, separate from any legacy `contact_messages` that may be
-- serving another product. Writes go through the send-contact-message edge
-- function (service role), so anon never touches this table directly.

CREATE TABLE IF NOT EXISTS public.vl_contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  event_type TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'website-contact-form',
  user_agent TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'new',
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vl_contact_messages_status ON public.vl_contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_vl_contact_messages_created ON public.vl_contact_messages(created_at DESC);

ALTER TABLE public.vl_contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read vl contact messages" ON public.vl_contact_messages;
DROP POLICY IF EXISTS "Authenticated can update vl contact messages" ON public.vl_contact_messages;

CREATE POLICY "Authenticated can read vl contact messages"
  ON public.vl_contact_messages FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update vl contact messages"
  ON public.vl_contact_messages FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.vl_contact_messages IS 'VibeLink website Contact form submissions. Written exclusively by send-contact-message edge function under service_role.';
