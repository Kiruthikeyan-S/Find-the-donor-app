-- Red Line Blood Donation App - Supabase Postgres Schema & RLS Policies
-- Run this in your Supabase Dashboard -> SQL Editor

-- 1. Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  email text not null,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own client profile"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'client');

create policy "Users can update their own profile without changing role"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- 2. Blood Donations table (registered donors)
create table if not exists public.blood_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  email text not null,
  phone text not null,
  blood_type text not null check (blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A1B+')),
  age integer not null check (age >= 18 and age <= 65),
  weight integer not null check (weight >= 45),
  medical_conditions text default 'None',
  latitude double precision,
  longitude double precision,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.blood_donations enable row level security;

create policy "Authenticated users can read donors"
  on public.blood_donations for select
  to authenticated
  using (true);

create policy "Users can insert their own donor registration"
  on public.blood_donations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own donor registration"
  on public.blood_donations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own donor registration"
  on public.blood_donations for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Blood Requests table (urgent blood requests)
create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  email text not null,
  phone text not null,
  blood_type text not null check (blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A1B+')),
  address text not null,
  id_proof_uri text default '',
  latitude double precision,
  longitude double precision,
  status text not null default 'open' check (status in ('open', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.blood_requests enable row level security;

create policy "Users can view their own requests or admins can view all"
  on public.blood_requests for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Users can create their own blood request"
  on public.blood_requests for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'open');

create policy "Owners or admins can update blood requests"
  on public.blood_requests for update
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );
