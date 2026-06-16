-- Contact form messages from the website.
-- Submitted via the send-contact-message edge function (anon does not write
-- directly to the table; the function uses the service role).

CREATE TABLE IF NOT EXISTS public.contact_messages (
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

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated can update contact messages" ON contact_messages;

CREATE POLICY "Authenticated can read contact messages"
  ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update contact messages"
  ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.contact_messages IS 'Messages submitted via the website Contact form. Inserts done by send-contact-message edge function under service_role.';
