create extension if not exists "pgcrypto";
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', phone text not null default '', address text not null default '',
 updated_at timestamptz not null default now()
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 design jsonb not null default '{}'::jsonb, status text not null default 'submitted',
 created_at timestamptz not null default now()
);
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index if not exists profiles_updated_at_idx on public.profiles(updated_at desc);
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
create policy "profiles own data" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "orders own data" on public.orders for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
