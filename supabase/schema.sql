-- InsightHub — schéma Supabase pour la persistance serveur des données terrain.
-- À exécuter dans Supabase → SQL Editor. Les colonnes correspondent aux `toRow`
-- de src/lib/sync.ts. RLS activé + politique d'insert/upsert pour la clé anon
-- (pilote). Renforcer selon l'auth réelle en production.

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

alter table public.submissions enable row level security;
alter table public.price_audits enable row level security;
alter table public.merch_audits enable row level security;

-- Pilote : autoriser lecture + upsert via la clé publishable/anon.
do $$
declare t text;
begin
  foreach t in array array['submissions','price_audits','merch_audits'] loop
    execute format('drop policy if exists anon_all on public.%I', t);
    execute format(
      'create policy anon_all on public.%I for all to anon using (true) with check (true)', t);
  end loop;
end $$;
