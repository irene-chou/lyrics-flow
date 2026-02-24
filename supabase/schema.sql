-- Shared Cloud Music Library schema for Supabase
-- Run this in the Supabase SQL Editor to create the shared_songs table.

create table if not exists shared_songs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  artist text not null default '',
  lrc_text text not null,
  offset real not null default 0,
  youtube_id text,
  duration real not null default 0,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for search by name/artist
create index if not exists idx_shared_songs_name on shared_songs using gin (to_tsvector('simple', name));
create index if not exists idx_shared_songs_artist on shared_songs using gin (to_tsvector('simple', artist));

-- Index for latest-first browsing
create index if not exists idx_shared_songs_published on shared_songs (published_at desc);

-- Row Level Security: allow public read, allow insert for anonymous users
alter table shared_songs enable row level security;

create policy "Anyone can read shared songs"
  on shared_songs for select
  using (true);

create policy "Anyone can publish songs"
  on shared_songs for insert
  with check (true);
