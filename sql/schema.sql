-- ============================================
-- FLASH PEAK COMMUNITY — SUPABASE SCHEMA
-- Jalankan ini di Supabase SQL Editor
-- ============================================

create extension if not exists pgcrypto;

create table if not exists public.members (
  id           uuid primary key default gen_random_uuid(),
  member_id    text unique not null,
  nama         text not null,
  usia         int  not null check (usia between 10 and 80),
  game_id      text not null,
  username     text not null,
  alasan       text not null,
  avatar       text not null default 'avatar1.svg',
  posisi       text not null check (posisi in ('ST','CM','WF','CB')),
  status       text not null default 'succeed',
  joined_at    timestamptz not null default now()
);

-- Case-insensitive uniqueness untuk username & gameId (biar konsisten dgn validasi lama)
create unique index if not exists members_username_lower_uq on public.members (lower(username));
create unique index if not exists members_game_id_lower_uq on public.members (lower(game_id));

-- Aktifkan Row Level Security
alter table public.members enable row level security;

-- Publik boleh baca semua member (dipakai landing page & roster)
create policy "Public read members"
  on public.members for select
  using (true);

-- Insert HANYA lewat server (service role di /api/register), bukan langsung dari browser.
-- Jadi TIDAK dibuat policy insert untuk anon — anon key hanya bisa select + subscribe realtime.

-- Masukkan tabel ke publication realtime supaya perubahan bisa di-subscribe dari client
alter publication supabase_realtime add table public.members;
