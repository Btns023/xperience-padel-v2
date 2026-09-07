-- ===========================================================================
-- Lot 6 — Espace coach
-- ---------------------------------------------------------------------------
--  * sessions        : séances d'un groupe (générées à la confirmation)
--  * attendance      : présence par séance et par joueur
--  * coach_invites   : liens d'invitation pour rattacher un compte coach
--  * fonctions SECURITY DEFINER : le coach voit UNIQUEMENT ses groupes,
--    sans les montants, via ces fonctions (aucun accès direct aux tables)
--  * price_tiers : lecture retirée aux coachs
-- ===========================================================================

create table public.sessions (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups (id) on delete cascade,
  date       date not null,
  start_time time,
  seq        int not null,
  created_at timestamptz not null default now()
);
create index sessions_group_idx on public.sessions (group_id);

create table public.attendance (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions (id) on delete cascade,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  present         boolean not null,
  marked_by       uuid references public.profiles (id) on delete set null,
  updated_at      timestamptz not null default now(),
  unique (session_id, registration_id)
);
create index attendance_session_idx on public.attendance (session_id);

create table public.coach_invites (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references public.coaches (id) on delete cascade,
  token       text not null unique,
  email       text not null,
  created_by  uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '30 days'),
  created_at  timestamptz not null default now()
);

create trigger attendance_set_updated_at before update on public.attendance
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- RLS — admin uniquement en accès direct ; le coach passe par les fonctions
-- ===========================================================================
alter table public.sessions      enable row level security;
alter table public.attendance    enable row level security;
alter table public.coach_invites enable row level security;

create policy "sessions_admin" on public.sessions for all
  using (public.is_admin()) with check (public.is_admin());
create policy "attendance_admin" on public.attendance for all
  using (public.is_admin()) with check (public.is_admin());
create policy "coach_invites_admin" on public.coach_invites for all
  using (public.is_admin()) with check (public.is_admin());

-- Le membre (client) peut voir les séances de son groupe (planning).
create policy "sessions_member_read" on public.sessions for select
  using (
    exists (
      select 1 from public.registrations r
      join public.players p on p.id = r.player_id
      where r.group_id = sessions.group_id
        and (
          r.billed_to_profile_id = auth.uid()
          or p.managed_by = auth.uid()
          or p.profile_id = auth.uid()
        )
    )
  );

-- price_tiers : plus de lecture pour les coachs
drop policy if exists "price_tiers_read" on public.price_tiers;
create policy "price_tiers_read" on public.price_tiers for select to authenticated
  using (public.current_app_role() is distinct from 'coach');

-- ===========================================================================
-- Fonctions coach
-- ===========================================================================
create or replace function public.current_coach_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.coaches
  where profile_id = auth.uid() and active
  limit 1;
$$;
grant execute on function public.current_coach_id() to authenticated;

-- Groupes du coach connecté
create or replace function public.coach_groups()
returns table (
  group_id uuid, group_label text, group_status text, slot_id uuid,
  weekday smallint, start_time time, product_name text, location_name text,
  member_count bigint
)
language sql stable security definer set search_path = public
as $$
  select g.id, g.label, g.status::text, s.id, s.weekday, s.start_time,
         p.name, l.name,
         (select count(*) from public.registrations r
          where r.group_id = g.id and r.status <> 'annulee')
  from public.groups g
  join public.slots s on s.id = g.slot_id
  left join public.products p on p.id = s.product_id
  left join public.locations l on l.id = s.location_id
  where public.current_coach_id() is not null
    and (s.coach_id = public.current_coach_id()
         or g.coach_id = public.current_coach_id())
  order by s.weekday, s.start_time;
$$;
grant execute on function public.coach_groups() to authenticated;

-- Composition d'un groupe (avec coordonnées + statut de paiement, SANS montant)
create or replace function public.coach_group_roster(p_group_id uuid)
returns table (
  registration_id uuid, first_name text, last_name text, level_code text,
  email text, phone text, payment_status text
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.groups g
    join public.slots s on s.id = g.slot_id
    where g.id = p_group_id
      and (s.coach_id = public.current_coach_id()
           or g.coach_id = public.current_coach_id())
  ) then
    return;
  end if;

  return query
  select r.id, pl.first_name, pl.last_name, pl.level_code, pl.email, pl.phone,
    case
      when exists (
        select 1 from public.invoice_lines il
        join public.invoices i on i.id = il.invoice_id
        where il.registration_id = r.id and i.status = 'paid'
      ) then 'payé'
      when exists (
        select 1 from public.invoice_lines il
        join public.invoices i on i.id = il.invoice_id
        where il.registration_id = r.id and i.status = 'sent'
      ) then 'impayé'
      else '—'
    end
  from public.registrations r
  join public.players pl on pl.id = r.player_id
  where r.group_id = p_group_id and r.status <> 'annulee'
  order by pl.first_name;
end;
$$;
grant execute on function public.coach_group_roster(uuid) to authenticated;

-- Séances d'un groupe + présences déjà saisies
create or replace function public.coach_group_sessions(p_group_id uuid)
returns table (
  session_id uuid, seq int, date date, start_time time,
  present_count bigint, marked_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.groups g
    join public.slots s on s.id = g.slot_id
    where g.id = p_group_id
      and (s.coach_id = public.current_coach_id()
           or g.coach_id = public.current_coach_id())
  ) then
    return;
  end if;

  return query
  select se.id, se.seq, se.date, se.start_time,
         (select count(*) from public.attendance a
          where a.session_id = se.id and a.present),
         (select count(*) from public.attendance a where a.session_id = se.id)
  from public.sessions se
  where se.group_id = p_group_id
  order by se.seq;
end;
$$;
grant execute on function public.coach_group_sessions(uuid) to authenticated;

-- Présences d'une séance précise (pour l'écran de pointage)
create or replace function public.coach_session_attendance(p_session_id uuid)
returns table (registration_id uuid, first_name text, last_name text, present boolean)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.sessions se
    join public.groups g on g.id = se.group_id
    join public.slots s on s.id = g.slot_id
    where se.id = p_session_id
      and (s.coach_id = public.current_coach_id()
           or g.coach_id = public.current_coach_id())
  ) then
    return;
  end if;

  return query
  select r.id, pl.first_name, pl.last_name,
         coalesce(a.present, null) as present
  from public.sessions se
  join public.registrations r on r.group_id = se.group_id and r.status <> 'annulee'
  join public.players pl on pl.id = r.player_id
  left join public.attendance a on a.session_id = se.id and a.registration_id = r.id
  where se.id = p_session_id
  order by pl.first_name;
end;
$$;
grant execute on function public.coach_session_attendance(uuid) to authenticated;

-- Prochaines séances (planning)
create or replace function public.coach_upcoming_sessions()
returns table (
  session_id uuid, date date, start_time time, group_label text,
  product_name text, location_name text
)
language sql stable security definer set search_path = public
as $$
  select se.id, se.date, se.start_time, g.label, p.name, l.name
  from public.sessions se
  join public.groups g on g.id = se.group_id
  join public.slots s on s.id = g.slot_id
  left join public.products p on p.id = s.product_id
  left join public.locations l on l.id = s.location_id
  where public.current_coach_id() is not null
    and (s.coach_id = public.current_coach_id()
         or g.coach_id = public.current_coach_id())
    and se.date >= current_date
  order by se.date, se.start_time
  limit 50;
$$;
grant execute on function public.coach_upcoming_sessions() to authenticated;

-- Pointage d'une présence
create or replace function public.coach_mark_attendance(
  p_session_id uuid, p_registration_id uuid, p_present boolean
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.sessions se
    join public.groups g on g.id = se.group_id
    join public.slots s on s.id = g.slot_id
    where se.id = p_session_id
      and (s.coach_id = public.current_coach_id()
           or g.coach_id = public.current_coach_id())
  ) then
    raise exception 'Séance hors de vos groupes';
  end if;

  insert into public.attendance (session_id, registration_id, present, marked_by)
  values (p_session_id, p_registration_id, p_present, auth.uid())
  on conflict (session_id, registration_id)
  do update set present = excluded.present, marked_by = excluded.marked_by,
               updated_at = now();
end;
$$;
grant execute on function public.coach_mark_attendance(uuid, uuid, boolean) to authenticated;
