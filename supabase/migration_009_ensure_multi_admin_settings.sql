-- Migration 009: Ensure Multi-Admin Settings Support
-- Run this in your Supabase project SQL Editor (Dashboard > SQL Editor) to ensure all tables and columns are fully configured

-- 1. Drop legacy single-row constraint if present
alter table public.settings drop constraint if exists settings_single_row;

-- 2. Ensure columns exist on settings table
alter table public.settings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.settings add column if not exists admin_email text;
alter table public.settings add column if not exists interviewer_name text default 'Recruiting Team';
alter table public.settings add column if not exists interviewer_photo_url text;

-- 3. Ensure sequence and autoincrement ID
create sequence if not exists settings_id_seq;
alter table public.settings alter column id set default nextval('settings_id_seq');
select setval('settings_id_seq', (select coalesce(max(id), 1) from public.settings));

-- 4. Ensure RLS policies allow authenticated admins to read and write all settings
alter table public.settings enable row level security;
drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);

drop policy if exists "admin all settings" on public.settings;
create policy "admin all settings" on public.settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
