-- ═══════════════════════════════════════════════════════════════════
-- Blog Phase 1 migration — 2026-07-18
-- Adds:
--   • blog_posts.series_slug, series_order, view_count
--   • blog_series table (for the /blog/series index)
--   • blog_comments table (Supabase-backed comments with admin approval)
--   • blog_post_views table (view tracker, one row per view)
-- Existing rows are wiped on Edmund's instruction (site not public yet).
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Wipe existing blog rows ──────────────────────────────────────
truncate table blog_posts restart identity cascade;

-- ── 2. New columns on blog_posts ────────────────────────────────────
alter table blog_posts
  add column if not exists series_slug text,
  add column if not exists series_order integer,
  add column if not exists view_count integer not null default 0;

create index if not exists blog_posts_series_slug_idx
  on blog_posts(series_slug, series_order);

-- ── 3. blog_series — one row per multi-part series ──────────────────
create table if not exists blog_series (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover_image text,
  category text,                       -- primary category
  post_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_series_slug_idx on blog_series(slug);

-- ── 4. blog_comments — admin-moderated, Supabase-owned ──────────────
create table if not exists blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references blog_posts(id) on delete cascade,
  parent_id uuid references blog_comments(id) on delete cascade,   -- threaded
  author_name text not null,
  author_email text,                        -- for gravatar / notifications, not shown publicly
  body text not null,
  approved boolean not null default false,  -- admin approves before public visibility
  ip_hash text,                             -- for spam / rate-limiting
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_idx on blog_comments(post_id, created_at desc);
create index if not exists blog_comments_approved_idx on blog_comments(approved, created_at desc);

-- ── 5. blog_post_views — one row per view for our own tracker ───────
-- Kept lightweight: post_id + day + count. Daily aggregation avoids
-- a row per pageview at scale.
create table if not exists blog_post_views (
  post_id uuid not null references blog_posts(id) on delete cascade,
  day date not null,
  view_count integer not null default 0,
  primary key (post_id, day)
);

-- Increment helper — called from the client on page load.
create or replace function increment_post_view(p_slug text)
returns void
language plpgsql
security definer
as $$
declare
  v_post_id uuid;
begin
  select id into v_post_id
  from blog_posts
  where slug = p_slug and published = true;

  if v_post_id is null then
    return;
  end if;

  -- Daily bucket
  insert into blog_post_views (post_id, day, view_count)
  values (v_post_id, current_date, 1)
  on conflict (post_id, day)
  do update set view_count = blog_post_views.view_count + 1;

  -- Running total on the post row for quick reads
  update blog_posts
  set view_count = view_count + 1
  where id = v_post_id;
end;
$$;

grant execute on function increment_post_view(text) to anon, authenticated;

-- ── 6. Row Level Security ───────────────────────────────────────────

-- blog_series: readable by all, writable only by admin (matches blog_posts convention)
alter table blog_series enable row level security;

drop policy if exists "blog_series public read" on blog_series;
create policy "blog_series public read"
  on blog_series for select
  using (true);

drop policy if exists "blog_series admin write" on blog_series;
create policy "blog_series admin write"
  on blog_series for all
  using (auth.role() = 'authenticated');

-- blog_comments: public can insert, only approved rows readable publicly,
-- admin can update (approve/delete)
alter table blog_comments enable row level security;

drop policy if exists "blog_comments public read approved" on blog_comments;
create policy "blog_comments public read approved"
  on blog_comments for select
  using (approved = true);

drop policy if exists "blog_comments public insert" on blog_comments;
create policy "blog_comments public insert"
  on blog_comments for insert
  with check (
    length(coalesce(author_name, '')) between 1 and 80
    and length(coalesce(body, '')) between 3 and 2000
    and approved = false                        -- inserts always pending
  );

drop policy if exists "blog_comments admin all" on blog_comments;
create policy "blog_comments admin all"
  on blog_comments for all
  using (auth.role() = 'authenticated');

-- blog_post_views: writable via the RPC function only. Read is admin-only.
alter table blog_post_views enable row level security;

drop policy if exists "blog_post_views admin read" on blog_post_views;
create policy "blog_post_views admin read"
  on blog_post_views for select
  using (auth.role() = 'authenticated');
