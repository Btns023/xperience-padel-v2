-- Les libellés des paliers enfants citaient une rentrée en septembre
-- (« 9 cours (sept. -> déc.) »…). Les créneaux enfants ouverts démarrent
-- en janvier 2027 : on retire les mois, qui dépendent de la date de début.

update price_tiers t
   set label = t.session_count::text || ' cours'
  from products p
 where p.id = t.product_id
   and p.slug = 'cycle-enfant'
   and t.kind = 'duration'
   and t.session_count in (9, 18, 27)
   and t.label like '%(sept.%';
