-- ===========================================================================
-- Lot 2 — Joueurs, entreprises, inscriptions
-- ---------------------------------------------------------------------------
--  * players        : 1 fiche par joueur, rattachée au compte gestionnaire
--                     (parent / capitaine / le joueur lui-même)
--  * organizations  : entreprise cliente (facture unique au Lot 4)
--  * registrations  : demande d'inscription d'un joueur à un créneau
--
-- États d'inscription : demande_recue → groupe_constitue → validee
--                       → facturee → payee ; annulee accessible à tout moment.
-- ===========================================================================

create type public.registration_status as enum (
  'demande_recue',
  'groupe_constitue',
  'validee',
  'facturee',
  'payee',
  'annulee'
);

create type public.invitation_status as enum ('none', 'pending', 'accepted');

-- --- Entreprises ------------------------------------------------------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  name        text not null,
  address     text,
  vat_number  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index organizations_owner_idx on public.organizations (owner_id);

-- --- Joueurs --------------------------------------------------------
create table public.players (
  id            uuid primary key default gen_random_uuid(),
  managed_by    uuid not null references public.profiles (id) on delete cascade,
  profile_id    uuid references public.profiles (id) on delete set null,
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  birthdate     date not null,
  level_code    text not null references public.padel_levels (code),
  image_consent boolean not null,
  invitation_status public.invitation_status not null default 'none',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index players_managed_by_idx on public.players (managed_by);
create index players_profile_idx    on public.players (profile_id);

-- --- Inscriptions --------------------------------------------------
create table public.registrations (
  id                   uuid primary key default gen_random_uuid(),
  player_id            uuid not null references public.players (id) on delete cascade,
  slot_id              uuid not null references public.slots (id)   on delete cascade,
  season_id            uuid not null references public.seasons (id) on delete cascade,
  status               public.registration_status not null default 'demande_recue',
  billed_to_profile_id uuid not null references public.profiles (id)      on delete restrict,
  billed_to_org_id     uuid references public.organizations (id)          on delete set null,
  level_mismatch       boolean not null default false,
  promo_code           text,
  prorata_sessions     int,
  notes                text,
  cancel_requested_at  timestamptz,
  requested_at         timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (player_id, slot_id)
);

create index registrations_slot_idx    on public.registrations (slot_id);
create index registrations_player_idx  on public.registrations (player_id);
create index registrations_billed_idx  on public.registrations (billed_to_profile_id);
create index registrations_status_idx  on public.registrations (status);

-- --- updated_at -------------------------------------------------
create trigger organizations_set_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger players_set_updated_at before update on public.players
  for each row execute function public.set_updated_at();
create trigger registrations_set_updated_at before update on public.registrations
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.organizations enable row level security;
alter table public.players       enable row level security;
alter table public.registrations enable row level security;

-- --- organizations : le propriétaire gère les siennes ; admin tout ----
create policy "organizations_owner_all" on public.organizations for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "organizations_admin_all" on public.organizations for all
  using (public.is_admin()) with check (public.is_admin());

-- --- players : le compte gestionnaire OU le joueur lié ; admin tout ---
create policy "players_manager_all" on public.players for all
  using (managed_by = auth.uid()) with check (managed_by = auth.uid());
create policy "players_self_read" on public.players for select
  using (profile_id = auth.uid());
create policy "players_self_update" on public.players for update
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "players_admin_all" on public.players for all
  using (public.is_admin()) with check (public.is_admin());

-- --- registrations ---------------------------------------------------
-- Lecture : le payeur, OU le gestionnaire du joueur, OU le joueur lié.
create policy "registrations_read_own" on public.registrations for select
  using (
    billed_to_profile_id = auth.uid()
    or exists (
      select 1 from public.players p
      where p.id = registrations.player_id
        and (p.managed_by = auth.uid() or p.profile_id = auth.uid())
    )
  );

-- Création : par le payeur, uniquement pour un joueur qu'il gère, et
-- toujours à l'état initial 'demande_recue'.
create policy "registrations_insert_own" on public.registrations for insert
  with check (
    billed_to_profile_id = auth.uid()
    and status = 'demande_recue'
    and exists (
      select 1 from public.players p
      where p.id = registrations.player_id and p.managed_by = auth.uid()
    )
  );

-- Les modifications de statut, la facturation, etc. passent par l'admin
-- (ou par des Server Actions à privilèges élevés côté serveur).
create policy "registrations_admin_all" on public.registrations for all
  using (public.is_admin()) with check (public.is_admin());
