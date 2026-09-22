-- Reprise de l'historique : les joueurs déjà inscrits avant la plateforme
-- n'ont pas toujours de date de naissance, d'e-mail ou de réponse au droit
-- à l'image. Ces trois champs deviennent facultatifs en base, pour accueillir
-- ces fiches sans inventer de données. Le formulaire d'inscription, lui,
-- continue de les exiger : seule la reprise d'historique peut être partielle.
alter table public.players
  alter column birthdate     drop not null,
  alter column email         drop not null,
  alter column image_consent drop not null;

comment on column public.players.image_consent is
  'Consentement à l''utilisation de l''image. null = jamais demandé (reprise d''historique) : à traiter comme un refus tant qu''il n''est pas recueilli.';
