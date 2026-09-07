-- ===========================================================================
-- Lot 6 — Acceptation d'une invitation coach (accessible hors admin)
-- ===========================================================================

-- Infos publiques minimales d'une invitation (pour l'écran de bienvenue).
create or replace function public.coach_invite_info(p_token text)
returns table (coach_name text, email text, valid boolean, accepted boolean)
language sql stable security definer set search_path = public
as $$
  select
    (c.first_name || ' ' || c.last_name) as coach_name,
    ci.email,
    (ci.accepted_at is null and ci.expires_at > now()) as valid,
    (ci.accepted_at is not null) as accepted
  from public.coach_invites ci
  join public.coaches c on c.id = ci.coach_id
  where ci.token = p_token;
$$;
grant execute on function public.coach_invite_info(text) to anon, authenticated;

-- Rattache le compte connecté au coach de l'invitation.
create or replace function public.accept_coach_invite(p_token text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_invite  public.coach_invites%rowtype;
  v_email   text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;

  select * into v_invite from public.coach_invites where token = p_token;
  if not found then
    raise exception 'Invitation introuvable';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'Invitation déjà utilisée';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'Invitation expirée';
  end if;
  if lower(v_invite.email) <> v_email then
    raise exception 'Cette invitation est destinée à %', v_invite.email;
  end if;

  update public.profiles set role = 'coach' where id = auth.uid();
  update public.coaches
    set profile_id = auth.uid(), email = v_invite.email
    where id = v_invite.coach_id;
  update public.coach_invites set accepted_at = now() where id = v_invite.id;
end;
$$;
grant execute on function public.accept_coach_invite(text) to authenticated;
