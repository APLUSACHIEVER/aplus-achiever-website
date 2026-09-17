-- APLUS ACHIEVER AI LEARNING SYSTEM
-- Supabase database schema
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Student',
  role text not null default 'student' check (role in ('student','teacher','admin')),
  level text default 'P6',
  class_name text default '',
  parent_email text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null default 'English',
  module text not null default 'vocabulary',
  question_id text,
  word text,
  level int,
  question_type text,
  answer text,
  correct_answer text,
  is_correct boolean not null default false,
  response_ms int,
  hints_used int not null default 0,
  answer_revealed boolean not null default false,
  mode text default 'daily',
  created_at timestamptz not null default now()
);

create index if not exists attempts_student_created_idx
  on public.attempts(student_id, created_at desc);

create index if not exists attempts_word_idx
  on public.attempts(word);

create table if not exists public.vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  word text not null,
  level int,
  seen int not null default 0,
  correct int not null default 0,
  wrong int not null default 0,
  streak int not null default 0,
  mastery numeric(5,2) not null default 0,
  last_response_ms int,
  fast_count int not null default 0,
  slow_count int not null default 0,
  last_result text,
  last_seen timestamptz,
  next_review timestamptz,
  recent_results jsonb not null default '[]'::jsonb,
  response_times jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(student_id, word)
);

create index if not exists vocab_progress_student_idx
  on public.vocabulary_progress(student_id, mastery);

create table if not exists public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null,
  questions int not null default 0,
  correct int not null default 0,
  study_seconds int not null default 0,
  unique(student_id, activity_date)
);

create table if not exists public.fluency_tests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  accuracy numeric(5,2) not null default 0,
  avg_recall_seconds numeric(6,2) not null default 0,
  fast_correct int not null default 0,
  timeout_count int not null default 0,
  level_label text,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Helper: current user's role
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Profiles RLS
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
on public.profiles for select
using (id = auth.uid() or public.current_user_role() in ('admin','teacher'));

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles for update
using (id = auth.uid() or public.current_user_role() = 'admin')
with check (id = auth.uid() or public.current_user_role() = 'admin');

-- Attempts RLS
alter table public.attempts enable row level security;

drop policy if exists "attempts_student_insert" on public.attempts;
create policy "attempts_student_insert"
on public.attempts for insert
with check (student_id = auth.uid());

drop policy if exists "attempts_read" on public.attempts;
create policy "attempts_read"
on public.attempts for select
using (student_id = auth.uid() or public.current_user_role() in ('admin','teacher'));

-- Vocabulary progress RLS
alter table public.vocabulary_progress enable row level security;

drop policy if exists "vocab_self_all" on public.vocabulary_progress;
create policy "vocab_self_all"
on public.vocabulary_progress for all
using (student_id = auth.uid() or public.current_user_role() in ('admin','teacher'))
with check (student_id = auth.uid() or public.current_user_role() in ('admin','teacher'));

-- Daily stats RLS
alter table public.daily_stats enable row level security;

drop policy if exists "daily_self_all" on public.daily_stats;
create policy "daily_self_all"
on public.daily_stats for all
using (student_id = auth.uid() or public.current_user_role() in ('admin','teacher'))
with check (student_id = auth.uid() or public.current_user_role() in ('admin','teacher'));

-- Fluency RLS
alter table public.fluency_tests enable row level security;

drop policy if exists "fluency_self_insert" on public.fluency_tests;
create policy "fluency_self_insert"
on public.fluency_tests for insert
with check (student_id = auth.uid());

drop policy if exists "fluency_read" on public.fluency_tests;
create policy "fluency_read"
on public.fluency_tests for select
using (student_id = auth.uid() or public.current_user_role() in ('admin','teacher'));

-- New users automatically get a student profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
