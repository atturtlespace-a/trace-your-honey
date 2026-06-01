-- ─── Trace Your Honey – Supabase Schema ─────────────────────────
-- Run this in the Supabase SQL Editor (dashboard → SQL Editor → New query)

-- ─── Table 1: Customer Registrations ─────────────────────────────
create table if not exists customer_registrations (
  id                uuid        primary key default gen_random_uuid(),
  email             text        not null unique,
  marketing_consent boolean     not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists idx_customer_registrations_email
  on customer_registrations (email);

-- ─── Table 2: Honey Batches ───────────────────────────────────────
create table if not exists honey_batches (
  id                  uuid        primary key default gen_random_uuid(),
  batch_code          text        not null unique,
  honey_type          text,
  harvest_region      text,
  harvest_date        date,
  testing_laboratory  text,
  umf_rating          integer,
  mgo_rating          integer,
  authenticity_status text,
  producer            text,
  notes               text,
  created_at          timestamptz not null default now()
);

create index if not exists idx_honey_batches_batch_code
  on honey_batches (lower(batch_code));

-- ─── Row Level Security ───────────────────────────────────────────
alter table honey_batches enable row level security;

create policy "Public read honey_batches"
  on honey_batches for select
  using (true);

alter table customer_registrations enable row level security;

create policy "Public insert customer_registrations"
  on customer_registrations for insert
  with check (true);

-- ─── Sample Data ──────────────────────────────────────────────────
insert into honey_batches
  (batch_code, honey_type, harvest_region, harvest_date,
   testing_laboratory, umf_rating, mgo_rating,
   authenticity_status, producer, notes)
values
  ('B250401','Mānuka Honey','Waikato, New Zealand','2025-04-01','Analytica Laboratories, New Zealand',15,514,'Verified Authentic – UMF Certified','1839 Honey Co.','Single-source harvest from native mānuka trees at 400m elevation.'),
  ('B250302','Mānuka Honey','Northland, New Zealand','2025-03-02','Hill Laboratories, New Zealand',20,829,'Verified Authentic – UMF Certified','1839 Honey Co.','Premium UMF 20+ batch from remote Northland coastal mānuka.'),
  ('B250110','Mānuka Honey','Bay of Plenty, New Zealand','2025-01-10','Analytica Laboratories, New Zealand',10,263,'Verified Authentic – UMF Certified','1839 Honey Co.','Entry-level UMF 10+ ideal for daily wellness.'),
  ('B241205','Mānuka Honey','East Cape, New Zealand','2024-12-05','AsureQuality, New Zealand',25,1200,'Verified Authentic – UMF Certified','1839 Honey Co.','Rare UMF 25+ from East Cape. Limited harvest batch.');