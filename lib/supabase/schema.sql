-- ═══════════════════════════════════════════════════════════════
-- Synapto Database Schema for Supabase
-- Run this SQL in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ─── Enable UUID Extension ───
create extension if not exists "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  avatar_url text,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 2. CONTENT TABLE (educational content records)
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.content (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  youtube_url text,
  thumbnail_url text,
  transcript text,
  transcript_status text default 'pending' check (transcript_status in ('pending', 'processing', 'completed', 'failed')),
  duration_seconds integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. SAVED CONTENT (many-to-many: users ↔ content)
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.saved_content (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content_id uuid references public.content(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, content_id)
);

-- ═══════════════════════════════════════════════════════════════
-- 4. SIMPLIFIED CONTENT (cached simplifications)
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.simplified_content (
  id uuid default uuid_generate_v4() primary key,
  content_id uuid references public.content(id) on delete cascade not null,
  original_text text not null,
  simplified_text text not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  provider text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 5. USER ACTIVITY LOG (learning progress tracking)
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.user_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content_id uuid references public.content(id) on delete cascade,
  activity_type text not null check (activity_type in ('view', 'simplify', 'audio', 'sign_language', 'complete')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Profiles: users can read/update their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Content: anyone can read, authenticated users can insert
alter table public.content enable row level security;

create policy "Anyone can view content"
  on public.content for select
  to authenticated
  using (true);

create policy "Authenticated users can create content"
  on public.content for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Creators can update own content"
  on public.content for update
  to authenticated
  using (auth.uid() = created_by);

-- Saved Content: users can manage their own saved content
alter table public.saved_content enable row level security;

create policy "Users can view own saved content"
  on public.saved_content for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can save content"
  on public.saved_content for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unsave content"
  on public.saved_content for delete
  to authenticated
  using (auth.uid() = user_id);

-- Simplified Content: authenticated users can read/create
alter table public.simplified_content enable row level security;

create policy "Authenticated users can view simplified content"
  on public.simplified_content for select
  to authenticated
  using (true);

create policy "Authenticated users can create simplified content"
  on public.simplified_content for insert
  to authenticated
  with check (true);

-- User Activity: users can manage their own activity
alter table public.user_activity enable row level security;

create policy "Users can view own activity"
  on public.user_activity for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can log own activity"
  on public.user_activity for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════════
create index if not exists idx_saved_content_user_id on public.saved_content(user_id);
create index if not exists idx_saved_content_content_id on public.saved_content(content_id);
create index if not exists idx_user_activity_user_id on public.user_activity(user_id);
create index if not exists idx_user_activity_content_id on public.user_activity(content_id);
create index if not exists idx_simplified_content_content_id on public.simplified_content(content_id);
create index if not exists idx_content_created_by on public.content(created_by);

-- ═══════════════════════════════════════════════════════════════
-- UPDATED_AT trigger for auto-timestamp
-- ═══════════════════════════════════════════════════════════════
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists content_updated_at on public.content;
create trigger content_updated_at
  before update on public.content
  for each row execute function public.update_updated_at_column();
