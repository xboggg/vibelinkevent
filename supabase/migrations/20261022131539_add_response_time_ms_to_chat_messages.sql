-- Applied live 2026-10-22. customer-chat inserts response_time_ms with every assistant reply,
-- but the live chat_messages table was created without that column, so assistant replies
-- silently failed to log. Original design (20251228062425) defines it as a nullable integer.
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS response_time_ms integer;
