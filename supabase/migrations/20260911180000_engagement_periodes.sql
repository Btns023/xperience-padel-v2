-- ===========================================================================
-- Cycles à durée choisie (cycles enfants 9 / 18 / 27 cours)
-- ---------------------------------------------------------------------------
-- Un seul créneau par horaire, qui porte le cycle complet (ex. 27 séances).
-- Chaque inscription précise son engagement :
--   * first_session : n° de la 1re séance suivie (1 = début du cycle ;
--                     10 = entrée en période 2 pour un cycle découpé en 9)
--   * session_count : nombre de séances suivies ; null = jusqu'à la fin
-- Les produits « par durée » (per_duration) découpent le cycle en périodes
-- dont la longueur est le plus petit palier (9) : 1–9, 10–18, 19–27.
--
--   * slots.min_capacity         : effectif sous lequel un groupe est trop
--                                  petit (alerte admin, pas de blocage)
--   * extension_offer_sent_at    : e-mail « prolonger ? » déjà envoyé
-- ===========================================================================

alter table public.registrations
  add column first_session int not null default 1
    check (first_session >= 1),
  add column session_count int
    check (session_count is null or session_count > 0),
  add column extension_offer_sent_at timestamptz;

comment on column public.registrations.first_session is
  'N° de la première séance suivie dans le cycle du créneau (1 = début).';
comment on column public.registrations.session_count is
  'Nombre de séances suivies à partir de first_session ; null = jusqu''à la fin du cycle.';

alter table public.slots
  add column min_capacity int
    check (min_capacity is null or min_capacity > 0);

comment on column public.slots.min_capacity is
  'Effectif minimum par période ; en dessous, le groupe est signalé trop petit.';

-- La séance n° p_seq fait-elle partie de l'engagement ?
create or replace function public.engagement_covers(
  p_first int, p_count int, p_slot_count int, p_seq int
)
returns boolean
language sql
immutable
as $$
  select p_seq >= p_first
     and p_seq < p_first + coalesce(p_count, p_slot_count - p_first + 1);
$$;

-- Engagements des inscriptions actives d'un ensemble de créneaux, sans
-- aucune donnée personnelle : sert à calculer les places par période côté
-- client (la RLS ne laisse voir à un client que ses propres inscriptions).
create or replace function public.slot_engagements(p_slot_ids uuid[])
returns table (slot_id uuid, first_session int, session_count int)
language sql
stable
security definer
set search_path = public
as $$
  select r.slot_id, r.first_session, r.session_count
    from public.registrations r
   where r.slot_id = any (p_slot_ids)
     and r.status <> 'annulee';
$$;

grant execute on function public.slot_engagements(uuid[]) to authenticated;

-- Écran de pointage : seuls les joueurs engagés sur CETTE séance.
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
  join public.groups g on g.id = se.group_id
  join public.slots s on s.id = g.slot_id
  join public.registrations r on r.group_id = se.group_id and r.status <> 'annulee'
  join public.players pl on pl.id = r.player_id
  left join public.attendance a on a.session_id = se.id and a.registration_id = r.id
  where se.id = p_session_id
    and public.engagement_covers(r.first_session, r.session_count, s.session_count, se.seq)
  order by pl.first_name;
end;
$$;
