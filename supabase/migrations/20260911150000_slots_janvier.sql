-- Les créneaux créés le 11/09/2026 (enfants et adultes mercredi/jeudi)
-- sont pour le cycle de janvier 2027, comme les créneaux du lundi :
-- semaine du lundi 4 janvier 2027. Chaque date de début est posée sur le
-- premier jour réel du créneau (mercredi 6, jeudi 7, samedi 9 janvier).

update slots s
   set starts_on = case s.weekday
                     when 3 then date '2027-01-06'  -- mercredi
                     when 4 then date '2027-01-07'  -- jeudi
                     when 6 then date '2027-01-09'  -- samedi
                   end
  from products p, seasons se
 where p.id = s.product_id
   and se.id = s.season_id
   and se.name = 'Saison 2026 - 2027'
   and (
         (p.slug = 'cycle-enfant' and s.starts_on in (date '2026-09-16', date '2026-09-19'))
      or (p.slug = 'cycle-adulte' and s.starts_on in (date '2026-10-07', date '2026-10-08'))
   );

-- Le début de saison avait été avancé au 01/09 pour une rentrée enfants
-- en septembre, qui ne concerne pas ces créneaux : on rétablit le 01/10.
update seasons
   set starts_on = date '2026-10-01'
 where name = 'Saison 2026 - 2027'
   and starts_on = date '2026-09-01';
