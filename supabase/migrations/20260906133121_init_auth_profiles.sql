-- ===========================================================================
-- Lot 0 — Socle authentification & rôles
-- ---------------------------------------------------------------------------
-- Crée :
--   * l'enum public.app_role (client / coach / admin)
--   * la table public.profiles (1 ligne par membre, FK vers auth.users)
--   * une fonction is_admin() SECURITY DEFINER (évite la récursion RLS)
--   * les politiques RLS
--   * le trigger de création automatique du profil à l'inscription
--   * le trigger updated_at
-- ===========================================================================

-- --- Enum des rôles --------------------------------------------------------
create type public.app_role as enum ('client', 'coach', 'admin');

-- --- Table profiles -------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.app_role not null default 'client',
  first_name   text,
  last_name    text,
  phone        text,
  address_line text,
  postal_code  text,
  city         text,
  country      text not null default 'BE',
  notif_prefs  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Profil applicatif : rôle et coordonnées. 1 ligne par utilisateur auth.';

-- --- Helper : l''utilisateur courant est-il admin ? ----------------------
-- SECURITY DEFINER : s''exécute avec les droits du propriétaire (postgres),
-- ce qui évite la récursion infinie quand la politique RLS de `profiles`
-- doit elle-même lire `profiles`.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- --- RLS ----------------------------------------------------------------
alter table public.profiles enable row level security;

-- Chacun lit son propre profil.
create policy "profiles_select_self"
  on public.profiles for select
  using (auth.uid() = id);

-- Chacun met à jour son propre profil (sans changer son rôle : voir trigger).
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Les admins voient et modifient tous les profils.
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.is_admin());

-- --- Empêche l''auto-promotion de rôle --------------------------------
-- Un membre non-admin ne peut pas modifier son propre `role`.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Modification du rôle interdite';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- --- updated_at automatique -------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- --- Création du profil à l''inscription -----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
