-- ─────────────────────────────────────────────────────────────
-- vyv · initial schema
--
-- Identity lives in Supabase Auth (auth.users), created only through
-- Google or Facebook OAuth — there are no passwords. Each user owns:
--   profiles   public profile (name, handle, bio, avatar, cover)
--   libraries  one row per user: likes, bookmarks, playlists, history,
--              resume positions, saved live-source items, settings
-- Row Level Security: a user can only ever read or write their own rows.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null default '',
  handle      text unique,
  bio         text not null default '',
  avatar_url  text,
  cover_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.libraries (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  favorites    jsonb not null default '[]'::jsonb,   -- ["track-id", ...]
  bookmarks    jsonb not null default '[]'::jsonb,   -- [{kind, id, at}, ...]
  playlists    jsonb not null default '[]'::jsonb,   -- [{id, name, trackIds, ...}, ...]
  history      jsonb not null default '[]'::jsonb,   -- ["track-id", ...] newest first
  progress     jsonb not null default '{}'::jsonb,   -- {"episode-id": seconds}
  saved_items  jsonb not null default '{}'::jsonb,   -- {"rb:…"|"au:…"|"ia:…"|"yt:…": Track}
  saved_shows  jsonb not null default '{}'::jsonb,   -- {"it:…": RemoteShow}
  settings     jsonb not null default '{}'::jsonb,   -- theme, EQ, speed, …
  device       text,                                 -- last writer, to skip our own realtime echo
  updated_at   timestamptz not null default now()
);

alter table public.profiles  enable row level security;
alter table public.libraries enable row level security;

drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile write"  on public.profiles;
drop policy if exists "own library"        on public.libraries;

create policy "own profile read"  on public.profiles  for select using (auth.uid() = id);
create policy "own profile write" on public.profiles  for all    using (auth.uid() = id) with check (auth.uid() = id);
create policy "own library"       on public.libraries for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- keep updated_at honest
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_touch  on public.profiles;
drop trigger if exists libraries_touch on public.libraries;
create trigger profiles_touch  before update on public.profiles  for each row execute function public.touch_updated_at();
create trigger libraries_touch before update on public.libraries for each row execute function public.touch_updated_at();

-- first sign-in: create the profile (from the Google/Facebook metadata) and an empty library
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  insert into public.libraries (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- live sync across a user's devices
do $$
begin
  alter publication supabase_realtime add table public.libraries;
exception when duplicate_object then null;
end $$;
