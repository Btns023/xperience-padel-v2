-- Le cycle démarre le lundi 4 janvier 2027 : les créneaux passent de la
-- « Saison 2026 - 2027 » à la « Saison 2027 - 2028 », qui commence ce jour-là.

update slots s
   set season_id = (select id from seasons where name = 'Saison 2027 - 2028')
 where s.season_id = (select id from seasons where name = 'Saison 2026 - 2027')
   and s.starts_on >= date '2027-01-04';
