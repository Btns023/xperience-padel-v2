-- Créneaux adultes 2026-2027 : cycles de 9 séances de 1h30.
--   Mercredi 17h00 et 18h30 — Nicolas Bertholet
--   Jeudi 17h00, 18h30 et 20h00 — Antonin Hulster
-- Le cycle démarre la semaine du 3 octobre 2026 : première séance le
-- mercredi 7/10 et le jeudi 8/10. starts_on doit tomber sur le jour du
-- créneau, car les séances sont générées de semaine en semaine à partir
-- de cette date exacte (voir src/lib/sessions.ts).
-- Créés en brouillon : ils n'apparaissent pas encore à l'inscription.

with
  saison as (select id from seasons where name = 'Saison 2026 - 2027'),
  produit as (select id from products where slug = 'cycle-adulte'),
  lieu as (select id from locations where name = 'Padel Smash Gembloux'),
  grille (weekday, start_time, starts_on, coach_first, coach_last) as (
    values
      (3, time '17:00', date '2026-10-07', 'Nicolas', 'Bertholet'),
      (3, time '18:30', date '2026-10-07', 'Nicolas', 'Bertholet'),
      (4, time '17:00', date '2026-10-08', 'Antonin', 'Hulster'),
      (4, time '18:30', date '2026-10-08', 'Antonin', 'Hulster'),
      (4, time '20:00', date '2026-10-08', 'Antonin', 'Hulster')
  )
insert into slots (
  season_id, product_id, location_id, coach_id,
  weekday, start_time, duration_minutes, session_count, starts_on,
  capacity, status
)
select
  saison.id, produit.id, lieu.id, c.id,
  g.weekday, g.start_time, 90, 9, g.starts_on,
  4, 'draft'::slot_status
from grille g
join coaches c
  on c.first_name = g.coach_first and c.last_name = g.coach_last
cross join saison
cross join produit
cross join lieu
where not exists (
  select 1
    from slots x
   where x.season_id = saison.id
     and x.product_id = produit.id
     and x.weekday = g.weekday
     and x.start_time = g.start_time
);
