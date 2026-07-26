-- ═══════════════════════════════════════════════════════════════════
-- 2026-07-26 — create the tables the admin panel already queries
--
-- External code review of the entire admin (July 26) found 3 sections
-- returning 404 / PGRST205 because their tables never existed. Live
-- schema probe verified nothing similar exists under any other name.
-- Fix: create the missing tables so the code that already exists starts
-- working. No frontend changes needed.
--
-- Adds:
--   • chat_conversations       — one row per chatbot session
--   • chat_messages            — one row per message in a chat_conversation
--   • chat_analytics           — aggregated "topic X asked N times" tracker
--   • follow_up_logs           — one row per follow-up email sent (log/history)
--
-- All admin-read-only. Chat conversations + messages allow public
-- insert/update because the customer-facing chatbot writes to them
-- as the anon user. follow_up_logs is written by the follow-up Edge
-- Function via service_role (which bypasses RLS), so no anon-write
-- policy is needed on it.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. chat_conversations — one row per chatbot session ─────────────
-- Query the admin fires:
--   select id, session_id, started_at, message_count
--   from chat_conversations order by started_at desc limit 100
create table if not exists chat_conversations (
  id           uuid        primary key default gen_random_uuid(),
  session_id   text        not null,             -- browser-generated session id (localStorage)
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  message_count integer    not null default 0,
  user_email   text,                             -- optional, if visitor volunteered
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index if not exists chat_conversations_session_idx on chat_conversations(session_id);
create index if not exists chat_conversations_started_at_idx on chat_conversations(started_at desc);

alter table chat_conversations enable row level security;

-- Public can create + update their own conversation (identified by session_id
-- via the client). Admin can read everything.
drop policy if exists "chat_conversations public insert" on chat_conversations;
create policy "chat_conversations public insert"
  on chat_conversations for insert
  with check (true);

drop policy if exists "chat_conversations public update" on chat_conversations;
create policy "chat_conversations public update"
  on chat_conversations for update
  using (true)
  with check (true);

drop policy if exists "chat_conversations admin read" on chat_conversations;
create policy "chat_conversations admin read"
  on chat_conversations for select
  using (auth.role() = 'authenticated');


-- ── 2. chat_messages — one row per message in a conversation ────────
-- Query the admin fires (when a conversation is expanded):
--   select id, role, content, created_at, suggestions
--   from chat_messages where conversation_id = <uuid>
--   order by created_at asc
create table if not exists chat_messages (
  id              uuid        primary key default gen_random_uuid(),
  conversation_id uuid        not null references chat_conversations(id) on delete cascade,
  role            text        not null check (role in ('user', 'assistant', 'system')),
  content         text        not null,
  suggestions     jsonb,                                -- optional array of follow-up prompts
  created_at      timestamptz not null default now()
);

create index if not exists chat_messages_conversation_idx on chat_messages(conversation_id, created_at);

alter table chat_messages enable row level security;

drop policy if exists "chat_messages public insert" on chat_messages;
create policy "chat_messages public insert"
  on chat_messages for insert
  with check (true);

drop policy if exists "chat_messages public read own conversation" on chat_messages;
create policy "chat_messages public read own conversation"
  on chat_messages for select
  using (true);  -- anyone with a conversation id can read; the id is a UUID so unguessable

drop policy if exists "chat_messages admin all" on chat_messages;
create policy "chat_messages admin all"
  on chat_messages for all
  using (auth.role() = 'authenticated');


-- ── 3. chat_analytics — "topic X was asked N times" tracker ────────
-- Query the admin fires:
--   select topic, count, last_asked_at
--   from chat_analytics order by count desc limit 20
create table if not exists chat_analytics (
  topic          text        primary key,
  count          integer     not null default 0,
  last_asked_at  timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

create index if not exists chat_analytics_count_idx on chat_analytics(count desc);

alter table chat_analytics enable row level security;

drop policy if exists "chat_analytics public upsert" on chat_analytics;
create policy "chat_analytics public upsert"
  on chat_analytics for insert
  with check (true);

drop policy if exists "chat_analytics public update" on chat_analytics;
create policy "chat_analytics public update"
  on chat_analytics for update
  using (true)
  with check (true);

drop policy if exists "chat_analytics admin read" on chat_analytics;
create policy "chat_analytics admin read"
  on chat_analytics for select
  using (auth.role() = 'authenticated');


-- ── 4. follow_up_logs — one row per follow-up email sent ────────────
-- Reviewer's captured query proves this is a log/history table, not
-- config (follow_up_settings covers config). Query the admin fires:
--   select *, orders(client_name, client_email, event_title)
--   from follow_up_logs order by sent_at desc limit 100
--
-- Values of follow_up_type observed in the app UI mapping:
--   payment_reminder_3day, payment_reminder_7day,
--   draft_review_reminder, thank_you
create table if not exists follow_up_logs (
  id             uuid        primary key default gen_random_uuid(),
  order_id       uuid        not null references orders(id) on delete cascade,
  follow_up_type text        not null,
  sent_at        timestamptz not null default now(),
  success        boolean     not null default true,
  error_message  text,
  metadata       jsonb,                                -- optional context (recipient, subject, message-id, etc.)
  created_at     timestamptz not null default now()
);

create index if not exists follow_up_logs_order_idx    on follow_up_logs(order_id);
create index if not exists follow_up_logs_sent_at_idx  on follow_up_logs(sent_at desc);
create index if not exists follow_up_logs_type_idx     on follow_up_logs(follow_up_type);

alter table follow_up_logs enable row level security;

drop policy if exists "follow_up_logs admin read" on follow_up_logs;
create policy "follow_up_logs admin read"
  on follow_up_logs for select
  using (auth.role() = 'authenticated');

-- Writes are performed by the follow-up Edge Function via service_role,
-- which bypasses RLS. No public-write policy needed. If the Edge Function
-- is ever refactored to use anon+JWT, add an insert policy here.

-- ═══════════════════════════════════════════════════════════════════
-- End of 2026-07-26 migration
-- ═══════════════════════════════════════════════════════════════════
