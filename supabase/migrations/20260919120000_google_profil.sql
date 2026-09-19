-- ===========================================================================
-- Connexion Google + profil complet
-- ---------------------------------------------------------------------------
--  * profiles.terms_accepted_at : date d'acceptation des conditions
--    d'inscription et de la politique de confidentialité. Le formulaire
--    e-mail l'impose à la création du compte ; un compte Google la donne à
--    l'étape « Complète ton profil ».
--  * handle_new_user : un compte Google n'envoie pas first_name / last_name
--    mais given_name / family_name, ou seulement full_name.
-- ===========================================================================

alter table public.profiles
  add column terms_accepted_at timestamptz;

comment on column public.profiles.terms_accepted_at is
  'Acceptation des conditions d''inscription et de la politique de confidentialité.';

-- Comptes existants : tous créés par le formulaire e-mail, où la case est
-- obligatoire. L'acceptation date de la création du compte.
update public.profiles
   set terms_accepted_at = created_at
 where terms_accepted_at is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := nullif(trim(coalesce(meta ->> 'full_name', meta ->> 'name', '')), '');
begin
  insert into public.profiles (id, first_name, last_name, phone, terms_accepted_at)
  values (
    new.id,
    coalesce(
      nullif(meta ->> 'first_name', ''),
      nullif(meta ->> 'given_name', ''),
      split_part(full_name, ' ', 1)
    ),
    coalesce(
      nullif(meta ->> 'last_name', ''),
      nullif(meta ->> 'family_name', ''),
      nullif(substring(full_name from position(' ' in full_name) + 1), full_name)
    ),
    nullif(meta ->> 'phone', ''),
    case when meta ->> 'accept_terms' = 'true' then now() end
  );

  update public.players
     set profile_id = new.id,
         invitation_status = 'accepted'
   where profile_id is null
     and lower(email) = lower(new.email);

  return new;
end;
$$;
