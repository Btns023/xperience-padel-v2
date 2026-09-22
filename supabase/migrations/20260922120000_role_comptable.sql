-- Nouveau rôle : le comptable de l'ASBL. Accès en lecture seule à la
-- comptabilité (journal, pièces, factures, Annexe B) et aux exports.
-- Seul dans sa migration : une valeur d'enum ajoutée ne peut pas être
-- utilisée dans la même transaction.
alter type public.app_role add value if not exists 'comptable';
