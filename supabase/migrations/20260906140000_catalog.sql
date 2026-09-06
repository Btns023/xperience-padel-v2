-- ===========================================================================
-- Lot 1 — Catalogue : saisons, lieux, coachs, niveaux, produits, tarifs,
--                     créneaux
-- ---------------------------------------------------------------------------
-- Toutes les tables : lecture réservée aux membres connectés, écriture
-- réservée aux administrateurs (public.is_admin()). L'ouverture au public
-- (visiteurs non connectés) se fera au Lot 2.
-- Montants : entiers, en centimes d'euro (amount_cents).
-- ===========================================================================

-- --- Enums --------------------------------------------------------------
create type public.season_status  as enum ('draft', 'active', 'archived');
create type public.product_category as enum (
  'cycle_adulte', 'cycle_enfant', 'stage', 'ete_indien', 'cours_prive'
);
create type public.pricing_model as enum (
  'per_group_size',  -- prix selon l'effectif (2 / 3 / 4)
  'per_duration',    -- prix selon le nombre de séances du cycle
  'unit',            -- prix unitaire (solo/duo, 1h/1h30)
  'flat'             -- forfait unique (ex. équipe été indien)
);
create type public.price_tier_kind as enum ('group_size', 'duration', 'unit', 'flat');
create type public.slot_status as enum ('draft', 'open', 'closed');

-- --- updated_at partagé ----------------------------------------------
-- (public.set_updated_at() existe déjà — migration Lot 0)

-- --- Niveaux de padel (référence) ----------------------------------
create table public.padel_levels (
  code  text primary key,             -- 'NC', 'P100', 'P200'…
  label text not null,
  rank  int  not null unique          -- ordre croissant
);

-- --- Lieux --------------------------------------------------------------
create table public.locations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  notes      text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- Coachs -----------------------------------------------------------
-- Identité "coach" affichée sur les créneaux. Reliée à un compte au Lot 6.
create table public.coaches (
  id         uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  email      text,
  profile_id uuid references public.profiles (id) on delete set null,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- Saisons --------------------------------------------------------
create table public.seasons (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  starts_on             date not null,
  ends_on               date not null,
  status                public.season_status not null default 'draft',
  registration_opens_on  date,
  registration_closes_on date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint seasons_dates_chk check (ends_on >= starts_on)
);

-- --- Produits / formules -----------------------------------------
create table public.products (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  name                   text not null,
  category               public.product_category not null,
  pricing_model          public.pricing_model not null,
  default_session_count  int,          -- ex. 9 pour le cycle adultes
  default_session_minutes int not null default 90,
  description            text,
  active                 boolean not null default true,
  position               int not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- --- Grille tarifaire ------------------------------------------
create table public.price_tiers (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products (id) on delete cascade,
  kind             public.price_tier_kind not null,
  group_size       int,           -- si kind = group_size
  session_count    int,           -- si kind = duration
  duration_minutes int,           -- si kind = unit (60 / 90)
  variant          text,          -- si kind = unit ('solo' / 'duo')
  label            text not null,
  amount_cents     int not null check (amount_cents >= 0),
  position         int not null default 0,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index price_tiers_product_idx on public.price_tiers (product_id);

-- --- Créneaux --------------------------------------------------------
create table public.slots (
  id               uuid primary key default gen_random_uuid(),
  season_id        uuid not null references public.seasons (id)   on delete cascade,
  product_id       uuid not null references public.products (id)  on delete restrict,
  location_id      uuid references public.locations (id)          on delete set null,
  coach_id         uuid references public.coaches (id)            on delete set null,
  weekday          smallint not null check (weekday between 1 and 7), -- 1 = lundi
  start_time       time not null,
  duration_minutes int not null default 90,
  session_count    int not null default 9,
  starts_on        date,                       -- date de la 1re séance
  capacity         int not null default 4 check (capacity > 0),
  min_level_code   text references public.padel_levels (code),
  max_level_code   text references public.padel_levels (code),
  level_note       text,                       -- étiquette libre, visible de tous
  status           public.slot_status not null default 'draft',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index slots_season_idx  on public.slots (season_id);
create index slots_product_idx on public.slots (product_id);

-- --- updated_at : triggers ----------------------------------------
create trigger locations_set_updated_at   before update on public.locations
  for each row execute function public.set_updated_at();
create trigger coaches_set_updated_at     before update on public.coaches
  for each row execute function public.set_updated_at();
create trigger seasons_set_updated_at     before update on public.seasons
  for each row execute function public.set_updated_at();
create trigger products_set_updated_at    before update on public.products
  for each row execute function public.set_updated_at();
create trigger price_tiers_set_updated_at before update on public.price_tiers
  for each row execute function public.set_updated_at();
create trigger slots_set_updated_at       before update on public.slots
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.padel_levels enable row level security;
alter table public.locations    enable row level security;
alter table public.coaches      enable row level security;
alter table public.seasons      enable row level security;
alter table public.products     enable row level security;
alter table public.price_tiers  enable row level security;
alter table public.slots        enable row level security;

-- Lecture : tout membre connecté.
create policy "padel_levels_read" on public.padel_levels for select to authenticated using (true);
create policy "locations_read"    on public.locations    for select to authenticated using (true);
create policy "coaches_read"      on public.coaches      for select to authenticated using (true);
create policy "seasons_read"      on public.seasons      for select to authenticated using (true);
create policy "products_read"     on public.products     for select to authenticated using (true);
create policy "price_tiers_read"  on public.price_tiers  for select to authenticated using (true);
create policy "slots_read"        on public.slots        for select to authenticated using (true);

-- Écriture : administrateurs uniquement.
create policy "padel_levels_admin" on public.padel_levels for all
  using (public.is_admin()) with check (public.is_admin());
create policy "locations_admin" on public.locations for all
  using (public.is_admin()) with check (public.is_admin());
create policy "coaches_admin" on public.coaches for all
  using (public.is_admin()) with check (public.is_admin());
create policy "seasons_admin" on public.seasons for all
  using (public.is_admin()) with check (public.is_admin());
create policy "products_admin" on public.products for all
  using (public.is_admin()) with check (public.is_admin());
create policy "price_tiers_admin" on public.price_tiers for all
  using (public.is_admin()) with check (public.is_admin());
create policy "slots_admin" on public.slots for all
  using (public.is_admin()) with check (public.is_admin());
