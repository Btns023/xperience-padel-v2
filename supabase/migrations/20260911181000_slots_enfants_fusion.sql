-- Cycles enfants : un seul créneau par horaire.
-- Les versions « 9 cours » et « 18 cours » de chaque horaire disparaissent ;
-- la version « 27 cours » devient LE créneau de l'horaire. La durée
-- (9, 18 ou 27) est désormais choisie à l'inscription.
-- Groupes de 2 à 6 enfants. Aucune inscription n'était liée à ces créneaux.

delete from public.slots s
 using public.products p
 where p.id = s.product_id
   and p.slug = 'cycle-enfant'
   and s.session_count in (9, 18)
   and not exists (select 1 from public.registrations r where r.slot_id = s.id);

update public.slots s
   set capacity = 6,
       min_capacity = 2,
       level_note = regexp_replace(s.level_note, ' · \d+ cours$', '')
  from public.products p
 where p.id = s.product_id
   and p.slug = 'cycle-enfant'
   and s.session_count = 27;
