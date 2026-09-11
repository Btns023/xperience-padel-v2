-- Créneaux enfants 2026-2027.
-- Grille publiée sur le site : mercredis après-midi et samedis matin,
-- séances d'1h à Padel Smash Gembloux, encadrées par Andréa Maronet.
-- Chaque horaire existe en trois durées de cycle : 9, 18 et 27 cours,
-- qui correspondent aux trois paliers tarifaires du produit « cycle-enfant ».
-- Créés en brouillon : ils n'apparaissent pas encore à l'inscription.

-- La rentrée enfants (16/09/2026) précède le début enregistré de la saison.
update seasons
   set starts_on = date '2026-09-01'
 where name = 'Saison 2026 - 2027'
   and starts_on > date '2026-09-01';

with
  saison as (select id from seasons where name = 'Saison 2026 - 2027'),
  produit as (select id from products where slug = 'cycle-enfant'),
  lieu as (select id from locations where name = 'Padel Smash Gembloux'),
  coach as (
    select id from coaches
     where first_name = 'Andréa' and last_name = 'Maronet'
  ),
  grille (weekday, start_time, starts_on, ages) as (
    values
      (3, time '13:00', date '2026-09-16', '6 – 8 ans'),
      (3, time '14:00', date '2026-09-16', '9 – 12 ans'),
      (3, time '15:00', date '2026-09-16', '13 – 15 ans'),
      (3, time '16:00', date '2026-09-16', '16 – 18 ans'),
      (6, time '10:00', date '2026-09-19', '8 – 12 ans'),
      (6, time '11:00', date '2026-09-19', '13 – 18 ans')
  ),
  durees (session_count) as (values (9), (18), (27))
insert into slots (
  season_id, product_id, location_id, coach_id,
  weekday, start_time, duration_minutes, session_count, starts_on,
  capacity, level_note, status
)
select
  saison.id, produit.id, lieu.id, coach.id,
  g.weekday, g.start_time, 60, d.session_count, g.starts_on,
  4,
  g.ages || ' · ' || d.session_count::text || ' cours',
  'draft'::slot_status
from grille g
cross join durees d
cross join saison
cross join produit
cross join lieu
cross join coach
where not exists (
  select 1
    from slots x
   where x.season_id = saison.id
     and x.product_id = produit.id
     and x.weekday = g.weekday
     and x.start_time = g.start_time
     and x.session_count = d.session_count
);
