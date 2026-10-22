-- Applied live 2026-10-22 as "customer_portal_otp_tables".
-- Customer portal login: one-time codes + short-lived sessions.
-- Only the edge functions (service role) touch these tables. RLS is on with NO policies,
-- and all direct grants to anon/authenticated are revoked, so the public API cannot read them.
CREATE TABLE IF NOT EXISTS public.customer_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_otps_email_created ON public.customer_otps (email, created_at DESC);

CREATE TABLE IF NOT EXISTS public.customer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires ON public.customer_sessions (expires_at);

ALTER TABLE public.customer_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.customer_otps FROM anon, authenticated;
REVOKE ALL ON public.customer_sessions FROM anon, authenticated;
