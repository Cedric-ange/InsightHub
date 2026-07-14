-- InsightHub — schéma Supabase (source de vérité backend).
-- À exécuter dans Supabase → SQL Editor. L'application se connecte via le pooler
-- Postgres (variable d'environnement DATABASE_URL), les colonnes sont en snake_case.
-- RLS activé + politique anon (pilote) ; à renforcer avec l'auth réelle en production.

-- 1. Questionnaires (créés dans le studio, alimentent la collecte terrain).
create table if not exists public.studies (
  id text primary key,
  title text not null,
  description text,
  category text,
  status text default 'draft',
  questions jsonb not null default '[]'::jsonb,
  created_by text,
  created_at bigint,
  updated_at bigint,
  inserted_at timestamptz not null default now()
);

-- Migration depuis l'ancien schéma en camelCase quoté ("createdAt"/"updatedAt").
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='studies' and column_name='createdAt') then
    alter table public.studies rename column "createdAt" to created_at;
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='studies' and column_name='updatedAt') then
    alter table public.studies rename column "updatedAt" to updated_at;
  end if;
end $$;

-- 2. Soumissions terrain (calquées sur src/lib/sync.ts).
create table if not exists public.submissions (
  id text primary key,
  study_id text not null,
  study_title text,
  agent_id text,
  agent_name text,
  answers jsonb not null default '[]'::jsonb,
  geo jsonb,
  started_at bigint,
  finished_at bigint,
  duration_sec integer,
  validation text default 'submitted',
  created_at bigint,
  inserted_at timestamptz not null default now()
);

-- 3. Audits de prix.
create table if not exists public.price_audits (
  id text primary key,
  outlet text,
  channel text,
  brand text,
  is_own_brand boolean,
  product text,
  price numeric,
  promo boolean,
  available boolean,
  facings integer,
  region text,
  geo jsonb,
  agent_id text,
  agent_name text,
  created_at bigint,
  inserted_at timestamptz not null default now()
);

-- 4. Audits merchandising.
create table if not exists public.merch_audits (
  id text primary key,
  outlet text,
  channel text,
  brand text,
  is_own_brand boolean,
  facings integer,
  shelf_length_cm numeric,
  shelf_position text,
  out_of_stock boolean,
  plv_present boolean,
  activation_present boolean,
  region text,
  geo jsonb,
  agent_id text,
  agent_name text,
  created_at bigint,
  inserted_at timestamptz not null default now()
);

-- 5. Utilisateurs (authentification pilote via /api/login).
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text,
  role text,
  password text,
  inserted_at timestamptz not null default now()
);

alter table public.studies enable row level security;
alter table public.submissions enable row level security;
alter table public.price_audits enable row level security;
alter table public.merch_audits enable row level security;
alter table public.users enable row level security;

-- Pilote : autoriser lecture + écriture via la clé anon (accès direct PostgREST).
do $$
declare t text;
begin
  foreach t in array array['studies','submissions','price_audits','merch_audits','users'] loop
    execute format('drop policy if exists anon_all on public.%I', t);
    execute format(
      'create policy anon_all on public.%I for all to anon using (true) with check (true)', t);
  end loop;
end $$;
