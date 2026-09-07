-- ===========================================================================
-- À l'inscription, rattacher automatiquement les fiches joueur créées par un
-- capitaine / parent qui portent la même adresse e-mail.
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );

  update public.players
     set profile_id = new.id,
         invitation_status = 'accepted'
   where profile_id is null
     and lower(email) = lower(new.email);

  return new;
end;
$$;
