-- eSimConnect Database Schema
-- Run this in Supabase SQL Editor to recreate all tables

-- USERS
create table if not exists users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);
alter table users enable row level security;
drop policy if exists "Users can manage own profile" on users;
create policy "Users can manage own profile" on users for all using (auth.uid() = id);

-- WAITLIST
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default now()
);
alter table waitlist enable row level security;
drop policy if exists "Anyone can join waitlist" on waitlist;
create policy "Anyone can join waitlist" on waitlist for insert with check (true);

-- COUNTRIES
create table if not exists countries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text,
  flag text,
  region text,
  created_at timestamp with time zone default now()
);
alter table countries enable row level security;
drop policy if exists "Anyone can view countries" on countries;
create policy "Anyone can view countries" on countries for select using (true);

-- ESIM PLANS
create table if not exists esim_plans (
  id uuid default gen_random_uuid() primary key,
  country_id uuid references countries(id),
  name text,
  data_gb numeric,
  duration_days integer,
  price_usd numeric,
  provider text,
  created_at timestamp with time zone default now()
);
alter table esim_plans enable row level security;
drop policy if exists "Anyone can view plans" on esim_plans;
create policy "Anyone can view plans" on esim_plans for select using (true);

-- ORDERS
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references esim_plans(id),
  amount_usd numeric,
  status text default 'pending',
  created_at timestamp with time zone default now()
);
alter table orders enable row level security;
drop policy if exists "Users can manage own orders" on orders;
create policy "Users can manage own orders" on orders for all using (auth.uid() = user_id);

-- ESIMS
create table if not exists esims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references orders(id),
  iccid text,
  qr_code text,
  status text default 'active',
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
alter table esims enable row level security;
drop policy if exists "Users can manage own esims" on esims;
create policy "Users can manage own esims" on esims for all using (auth.uid() = user_id);

-- SAVED ITINERARIES
create table if not exists saved_itineraries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  destination text,
  trip_data jsonb,
  created_at timestamp with time zone default now()
);
alter table saved_itineraries enable row level security;
drop policy if exists "Users can manage own itineraries" on saved_itineraries;
create policy "Users can manage own itineraries" on saved_itineraries for all using (auth.uid() = user_id);
