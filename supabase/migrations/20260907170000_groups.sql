-- ===========================================================================
-- Lot 3 — Constitution des groupes
-- ---------------------------------------------------------------------------
--  * groups            : un groupe rattaché à un créneau, effectif confirmé
--  * registrations.group_id       : rattachement d'une demande à un groupe
--  * registrations.unit_price_cents : prix/joueur figé à la confirmation
--  * group_roster(uuid) : composition (prénoms) visible par les membres
--
-- Cycle : demande_recue --assigner--> groupe_constitue --confirmer--> validee
-- ===========================================================================

create type public.group_status as enum ('forming', 'confirmed');

create table public.groups (
  id           uuid primary key default gen_random_uuid(),
  slot_id      uuid not null references public.slots (id) on delete cascade,
  label        text,
  size         int check (size is null or size > 0),
  status       public.group_status not null default 'forming',
  coach_id     uuid references public.coaches (id) on delete set null,
  starts_on    date,
  confirmed_at timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index groups_slot_idx on public.groups (slot_id);

alter table public.registrations
  add column group_id uuid references public.groups (id) on delete set null,
  add column unit_price_cents int check (unit_price_cents is null or unit_price_cents >= 0);

create index registrations_group_idx on public.registrations (group_id);

create trigger groups_set_updated_at before update on public.groups
  for each row execute function public.set_updated_at();

-- --- Composition d'un groupe (prénoms), pour l'espace client -----------
create or replace function public.group_roster(p_group_id uuid)
returns table (first_name text, level_code text, level_mismatch boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    public.is_admin()
    or exists (
      select 1
      from public.registrations r
      join public.players p on p.id = r.player_id
      where r.group_id = p_group_id
        and (
          r.billed_to_profile_id = auth.uid()
          or p.managed_by = auth.uid()
          or p.profile_id = auth.uid()
        )
    )
  ) then
    return;
  end if;

  return query
    select pl.first_name, pl.level_code, r.level_mismatch
    from public.registrations r
    join public.players pl on pl.id = r.player_id
    where r.group_id = p_group_id
      and r.status <> 'annulee'
    order by pl.first_name;
end;
$$;

grant execute on function public.group_roster(uuid) to authenticated;

-- --- RLS -----------------------------------------------------------
alter table public.groups enable row level security;

create policy "groups_admin_all" on public.groups for all
  using (public.is_admin()) with check (public.is_admin());

create policy "groups_member_read" on public.groups for select
  using (
    exists (
      select 1
      from public.registrations r
      join public.players p on p.id = r.player_id
      where r.group_id = groups.id
        and (
          r.billed_to_profile_id = auth.uid()
          or p.managed_by = auth.uid()
          or p.profile_id = auth.uid()
        )
    )
  );
