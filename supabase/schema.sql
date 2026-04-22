-- ============================================================
-- Life OS — Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  partner_email text,
  partner_id uuid references public.profiles(id),
  partner_status text default 'none',
  avatar_color text default '#818cf8',
  created_at timestamptz default now()
);

-- HABITS
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  category text default 'Life',
  color text default '#94a3b8',
  icon text default '⭐',
  priority integer default 99,
  note text,
  active boolean default true,
  created_at timestamptz default now()
);

-- HABIT LOGS
create table public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  habit_name text not null,
  date date not null,
  status text check (status in ('success', 'fail', 'skip')),
  created_at timestamptz default now(),
  unique(user_id, habit_name, date)
);

-- DSA PROGRESS
create table public.dsa_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  topic_key text not null,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, topic_key)
);

-- STARTUP PROGRESS
create table public.startup_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  task_key text not null,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, task_key)
);

-- FITNESS LOGS
create table public.fitness_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  weight decimal,
  calories_eaten integer,
  calories_burned integer,
  note text,
  created_at timestamptz default now()
);

-- GOAL PROGRESS (stores custom progress % per goal id)
create table public.goal_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  goal_id text not null,
  progress integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, goal_id)
);

-- ACCOUNTABILITY REACTIONS
create table public.accountability_reactions (
  id uuid default gen_random_uuid() primary key,
  from_user uuid references public.profiles(id),
  to_user uuid references public.profiles(id),
  type text check (type in ('fire', 'nudge', 'cheer', 'message')),
  message text,
  habit_name text,
  date date default current_date,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.dsa_progress enable row level security;
alter table public.startup_progress enable row level security;
alter table public.fitness_logs enable row level security;
alter table public.goal_progress enable row level security;
alter table public.accountability_reactions enable row level security;

-- PROFILES: own read/write + partner read
create policy "Own profile full access" on public.profiles
  for all using (auth.uid() = id);

create policy "Partner profile read" on public.profiles
  for select using (
    id = (select partner_id from public.profiles where id = auth.uid())
  );

-- HABITS: own full + partner read
create policy "Own habits" on public.habits
  for all using (auth.uid() = user_id);

create policy "Partner habits read" on public.habits
  for select using (
    user_id = (select partner_id from public.profiles where id = auth.uid())
  );

-- HABIT LOGS: own full + partner read
create policy "Own logs" on public.habit_logs
  for all using (auth.uid() = user_id);

create policy "Partner logs read" on public.habit_logs
  for select using (
    user_id = (select partner_id from public.profiles where id = auth.uid())
  );

-- DSA PROGRESS: own only
create policy "Own dsa" on public.dsa_progress
  for all using (auth.uid() = user_id);

-- STARTUP PROGRESS: own only
create policy "Own startup" on public.startup_progress
  for all using (auth.uid() = user_id);

-- FITNESS LOGS: own full + partner read
create policy "Own fitness" on public.fitness_logs
  for all using (auth.uid() = user_id);

create policy "Partner fitness read" on public.fitness_logs
  for select using (
    user_id = (select partner_id from public.profiles where id = auth.uid())
  );

-- GOAL PROGRESS: own only
create policy "Own goals" on public.goal_progress
  for all using (auth.uid() = user_id);

-- REACTIONS: send to partner + read own
create policy "Send reactions" on public.accountability_reactions
  for insert with check (auth.uid() = from_user);

create policy "Read reactions" on public.accountability_reactions
  for select using (auth.uid() = to_user or auth.uid() = from_user);

create policy "Update own received" on public.accountability_reactions
  for update using (auth.uid() = to_user);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PARTNER LINKING: function to link two users
-- ============================================================
create or replace function public.link_partners(user_a uuid, user_b uuid)
returns void as $$
begin
  update public.profiles set partner_id = user_b, partner_status = 'linked' where id = user_a;
  update public.profiles set partner_id = user_a, partner_status = 'linked' where id = user_b;
end;
$$ language plpgsql security definer;

-- Add onboarding_data to profiles (run if upgrading from personal version)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_data jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
