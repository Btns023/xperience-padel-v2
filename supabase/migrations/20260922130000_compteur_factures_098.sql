-- Le listing des inscriptions attribue déjà les numéros 2026-090 à 2026-098
-- (cycles enfants de la rentrée), au-delà des factures PDF qui s'arrêtent à
-- 2026-089. Le compteur doit donc repartir de 98, sans quoi la plateforme
-- rééditerait des numéros déjà utilisés.
update public.document_counters
   set last_number = greatest(last_number, 98)
 where year = 2026 and kind = 'invoice';
